import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useScene } from '../../hooks/useScene'

// ── Config ────────────────────────────────────────────────────────────────────
const LAYER_CONFIG   = [1, 6, 8, 6, 4, 1]
const LAYER_NAMES    = [
  'Input Layer',
  'Dense 128 · ReLU',
  'Dense 256 · ReLU',
  'Dense 128 · ReLU',
  'Dense 64 · ReLU',
  'Softmax Output',
]
const LAYER_Z        = [-4, -2.4, -0.8, 0.8, 2.4, 4]
const NODE_RADIUS    = 0.1
const CIRCLE_RADIUS  = 1.15
const PASS_INTERVAL  = 4200
const LAYER_DELAY    = 0.35
const MAX_PARTICLES  = 60
const PARTICLE_SPEED = 1.6   // world-units / second
// Full scroll (progress 0→1) spins the network this many radians in Y
const SCROLL_ROT_RANGE = Math.PI * 3

// ── Module-level scratch objects (no GC pressure) ─────────────────────────────
const _dummy   = new THREE.Object3D()
const _lerpPos = new THREE.Vector3()

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

// ── Geometry builders ─────────────────────────────────────────────────────────
function buildNodePositions() {
  return LAYER_CONFIG.map((count, li) => {
    if (count === 1) return [new THREE.Vector3(0, 0, LAYER_Z[li])]
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2
      return new THREE.Vector3(
        Math.cos(angle) * CIRCLE_RADIUS,
        Math.sin(angle) * CIRCLE_RADIUS,
        LAYER_Z[li]
      )
    })
  })
}

function buildEdgeArray(nodePositions) {
  const positions = []
  for (let li = 0; li < nodePositions.length - 1; li++) {
    for (const a of nodePositions[li]) {
      for (const b of nodePositions[li + 1]) {
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }
    }
  }
  return new Float32Array(positions)
}

function buildEdgeList(nodePositions) {
  const edges = []
  for (let li = 0; li < nodePositions.length - 1; li++) {
    for (const a of nodePositions[li]) {
      for (const b of nodePositions[li + 1]) {
        edges.push({ from: a.clone(), to: b.clone(), layerFrom: li })
      }
    }
  }
  return edges
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function NeuralNetwork({ onForwardPassStart }) {
  const groupRef     = useRef()
  const nodeRefs     = useRef([])
  const particlesRef = useRef()
  const [hoveredNode, setHoveredNode] = useState(null)
  const { gl } = useThree()

  // Bridge scroll progress into a ref so useFrame can read it without stale closures
  const { scrollProgress } = useScene()
  const scrollRef = useRef(0)
  useEffect(() => { scrollRef.current = scrollProgress }, [scrollProgress])

  // ── Geometry ────────────────────────────────────────────────────────────────
  const nodePositions = useMemo(() => buildNodePositions(), [])
  const edgePositions = useMemo(() => buildEdgeArray(nodePositions), [nodePositions])
  const edgeList      = useMemo(() => buildEdgeList(nodePositions), [nodePositions])

  const nodeData = useMemo(() => {
    const out = []
    nodePositions.forEach((layer, li) =>
      layer.forEach((pos, ni) =>
        out.push({ layerIndex: li, nodeIndex: ni, position: pos, key: `${li}-${ni}` })
      )
    )
    return out
  }, [nodePositions])

  const layerStartIdx = useMemo(() => {
    const starts = []
    let acc = 0
    LAYER_CONFIG.forEach((c) => { starts.push(acc); acc += c })
    return starts
  }, [])

  // ── Particle pool (plain object, avoids re-renders) ──────────────────────
  const pool = useRef(
    Array.from({ length: MAX_PARTICLES }, () => ({
      from: new THREE.Vector3(),
      to:   new THREE.Vector3(),
      t: 1,
      duration: 1,
    }))
  )

  const spawnLayerParticles = useCallback((layerIndex) => {
    if (layerIndex >= LAYER_CONFIG.length - 1) return
    const layerEdges = edgeList.filter((e) => e.layerFrom === layerIndex)
    const sample = [...layerEdges].sort(() => Math.random() - 0.5).slice(0, 10)
    sample.forEach((edge) => {
      const slot = pool.current.find((p) => p.t >= 1)
      if (!slot) return
      slot.from.copy(edge.from)
      slot.to.copy(edge.to)
      slot.t = 0
      slot.duration = slot.from.distanceTo(slot.to) / PARTICLE_SPEED
    })
  }, [edgeList])

  // ── Forward pass ─────────────────────────────────────────────────────────
  const triggerForwardPass = useCallback((startLayer = 0) => {
    onForwardPassStart?.()
    for (let li = startLayer; li < LAYER_CONFIG.length; li++) {
      const delay = (li - startLayer) * LAYER_DELAY
      const start = layerStartIdx[li]
      const count = LAYER_CONFIG[li]
      for (let ni = 0; ni < count; ni++) {
        const mesh = nodeRefs.current[start + ni]
        if (!mesh) continue
        gsap.to(mesh.material, {
          emissiveIntensity: 3.2,
          duration: 0.14,
          delay,
          ease: 'power2.out',
          onComplete: () =>
            gsap.to(mesh.material, { emissiveIntensity: 0.8, duration: 0.45, ease: 'power2.in' }),
        })
      }
      setTimeout(() => spawnLayerParticles(li), delay * 1000)
    }
  }, [layerStartIdx, onForwardPassStart, spawnLayerParticles])

  useEffect(() => {
    triggerForwardPass(0)
    const id = setInterval(() => triggerForwardPass(0), PASS_INTERVAL)
    return () => clearInterval(id)
  }, [triggerForwardPass])

  // ── Random single-node pulses ─────────────────────────────────────────────
  useEffect(() => {
    let tid
    const pulse = () => {
      const flatIdx = Math.floor(Math.random() * nodeData.length)
      const mesh = nodeRefs.current[flatIdx]
      if (mesh) {
        gsap.to(mesh.material, {
          emissiveIntensity: 2.2,
          duration: 0.1,
          ease: 'power2.out',
          onComplete: () =>
            gsap.to(mesh.material, { emissiveIntensity: 0.8, duration: 0.35, ease: 'power2.in' }),
        })
      }
      tid = setTimeout(pulse, 400 + Math.random() * 900)
    }
    tid = setTimeout(pulse, 800)
    return () => clearTimeout(tid)
  }, [nodeData])

  // ── Breathing scale ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!groupRef.current) return
    gsap.to(groupRef.current.scale, {
      x: 1.03, y: 1.03, z: 1.03,
      duration: 3.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    })
  }, [])

  // ── Initialise particle instances off-screen ──────────────────────────────
  useEffect(() => {
    const mesh = particlesRef.current
    if (!mesh) return
    _dummy.position.set(0, 0, -9999)
    _dummy.scale.setScalar(0)
    _dummy.updateMatrix()
    for (let i = 0; i < MAX_PARTICLES; i++) mesh.setMatrixAt(i, _dummy.matrix)
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  // ── Per-frame: scroll-driven rotation + mouse tilt + particles ───────────
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Scroll drives Y rotation; mouse adds a local parallax tilt
    const targetRotY = scrollRef.current * SCROLL_ROT_RANGE + state.pointer.x * 0.16
    const targetRotX = state.pointer.y * -0.14

    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05

    // Signal particles
    const mesh = particlesRef.current
    if (!mesh) return
    pool.current.forEach((p, i) => {
      if (p.t >= 1) {
        _dummy.scale.setScalar(0)
        _dummy.updateMatrix()
        mesh.setMatrixAt(i, _dummy.matrix)
        return
      }
      p.t = Math.min(1, p.t + delta / p.duration)
      _lerpPos.lerpVectors(p.from, p.to, easeInOut(p.t))
      _dummy.position.copy(_lerpPos)
      _dummy.scale.setScalar(1)
      _dummy.updateMatrix()
      mesh.setMatrixAt(i, _dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <group ref={groupRef}>
      {/* Soft radial halo — excluded from raycasting */}
      {/* <mesh position={[0, 0, 0]} raycast={() => {}}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.022} depthWrite={false} />
      </mesh> */}

      {/* Edges */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edgePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#00b8d9" opacity={0.18} transparent />
      </lineSegments>

      {/* Nodes */}
      {nodeData.map(({ key, layerIndex, position }, flatIdx) => {
        const isHovered = hoveredNode?.key === key
        return (
          <group key={key} position={[position.x, position.y, position.z]}>
            {/* Core node */}
            <mesh
              ref={(el) => (nodeRefs.current[flatIdx] = el)}
              scale={isHovered ? 1.6 : 1}
              onPointerOver={(e) => {
                e.stopPropagation()
                gl.domElement.style.cursor = 'pointer'
                setHoveredNode({ key, layerIndex })
              }}
              onPointerOut={() => {
                gl.domElement.style.cursor = 'auto'
                setHoveredNode(null)
              }}
              onClick={(e) => { e.stopPropagation(); triggerForwardPass(layerIndex) }}
            >
              <sphereGeometry args={[NODE_RADIUS, 16, 16]} />
              <meshStandardMaterial
                color="#001a2e"
                emissive={isHovered ? '#f59e0b' : '#00d4ff'}
                emissiveIntensity={0.8}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            {isHovered && (
              <Html distanceFactor={6} position={[0, NODE_RADIUS * 3.5, 0]} style={{ pointerEvents: 'none' }}>
                <div style={{
                  background: 'rgba(0,8,20,0.88)',
                  border: '1px solid #00d4ff',
                  color: '#00d4ff',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 0 12px rgba(0,212,255,0.25)',
                }}>
                  {LAYER_NAMES[layerIndex]}
                </div>
              </Html>
            )}
          </group>
        )
      })}

      {/* Signal particles (InstancedMesh) */}
      <instancedMesh ref={particlesRef} args={[null, null, MAX_PARTICLES]}>
        <sphereGeometry args={[0.028, 6, 6]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={4}
          roughness={0}
          metalness={0}
        />
      </instancedMesh>
    </group>
  )
}
