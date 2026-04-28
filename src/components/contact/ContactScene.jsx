import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

const LAYERS = [3, 4, 3]
const LAYER_Z = [-1.8, 0, 1.8]
const NODE_RADIUS = 0.075
const BURST_COUNT = 30
const IDLE_INTENSITY = 0.2

function buildNodePositions() {
  return LAYERS.map((count, layerIndex) => {
    const spacing = 0.56
    const offset = ((count - 1) * spacing) / 2
    return Array.from({ length: count }, (_, nodeIndex) => (
      new THREE.Vector3((nodeIndex * spacing) - offset, 0, LAYER_Z[layerIndex])
    ))
  })
}

function buildEdges(nodePositions) {
  const positions = []
  for (let layer = 0; layer < nodePositions.length - 1; layer++) {
    for (const a of nodePositions[layer]) {
      for (const b of nodePositions[layer + 1]) {
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }
    }
  }
  return new Float32Array(positions)
}

function buildBurstGeometry() {
  const positions = new Float32Array(BURST_COUNT * 3)
  const directions = []

  for (let i = 0; i < BURST_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos((Math.random() * 2) - 1)
    directions.push(new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi),
    ))
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return { geometry, directions }
}

export default function ContactScene() {
  const groupRef = useRef()
  const nodeRefs = useRef([])
  const burstRef = useRef()
  const burstProgress = useRef({ value: 0 })
  const [burstOpacity, setBurstOpacity] = useState(0)

  const nodePositions = useMemo(() => buildNodePositions(), [])
  const edgePositions = useMemo(() => buildEdges(nodePositions), [nodePositions])
  const { geometry: burstGeometry, directions } = useMemo(() => buildBurstGeometry(), [])

  const nodeData = useMemo(() => {
    const data = []
    nodePositions.forEach((layer, layerIndex) => {
      layer.forEach((position, nodeIndex) => {
        data.push({ key: `${layerIndex}-${nodeIndex}`, layerIndex, position })
      })
    })
    return data
  }, [nodePositions])

  const layerStarts = useMemo(() => {
    let total = 0
    return LAYERS.map((count) => {
      const start = total
      total += count
      return start
    })
  }, [])

  const runForwardPass = useCallback(() => {
    nodeRefs.current.forEach((mesh) => {
      if (mesh?.material) mesh.material.emissive.set('#00d4ff')
    })

    LAYERS.forEach((count, layerIndex) => {
      const start = layerStarts[layerIndex]
      const delay = layerIndex * 0.2

      for (let i = 0; i < count; i++) {
        const mesh = nodeRefs.current[start + i]
        if (!mesh) continue
        gsap.to(mesh.material, {
          emissiveIntensity: 2.4,
          duration: 0.12,
          delay,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to(mesh.material, {
              emissiveIntensity: IDLE_INTENSITY,
              duration: 0.28,
              ease: 'power2.in',
            })
          },
        })
      }
    })

    const finalNode = nodeRefs.current[nodeRefs.current.length - 1]
    gsap.delayedCall(0.6, () => {
      if (finalNode) {
        gsap.to(finalNode.material, {
          emissiveIntensity: 3.4,
          duration: 0.12,
          yoyo: true,
          repeat: 1,
        })
      }
      burstProgress.current.value = 0
      setBurstOpacity(1)
      gsap.to(burstProgress.current, {
        value: 1,
        duration: 0.6,
        ease: 'power3.out',
        onComplete: () => setBurstOpacity(0),
      })
    })
  }, [layerStarts])

  const runErrorFlash = useCallback(() => {
    nodeRefs.current.forEach((mesh) => {
      if (!mesh) return
      mesh.material.emissive.set('#ef4444')
      gsap.fromTo(mesh.material, {
        emissiveIntensity: 2.8,
      }, {
        emissiveIntensity: IDLE_INTENSITY,
        duration: 0.45,
        ease: 'power2.out',
        onComplete: () => mesh.material.emissive.set('#00d4ff'),
      })
    })
  }, [])

  useEffect(() => {
    window.addEventListener('contact:valid-submit', runForwardPass)
    window.addEventListener('contact:invalid-submit', runErrorFlash)
    return () => {
      window.removeEventListener('contact:valid-submit', runForwardPass)
      window.removeEventListener('contact:invalid-submit', runErrorFlash)
    }
  }, [runForwardPass, runErrorFlash])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08

    const positions = burstGeometry.attributes.position.array
    const distance = burstProgress.current.value * 2.8
    for (let i = 0; i < BURST_COUNT; i++) {
      const dir = directions[i]
      positions[i * 3] = 0.56 + dir.x * distance
      positions[i * 3 + 1] = dir.y * distance
      positions[i * 3 + 2] = LAYER_Z[2] + dir.z * distance
    }
    burstGeometry.attributes.position.needsUpdate = true
  })

  return (
    <group ref={groupRef} position={[0, -0.15, 0]} scale={0.82} rotation={[0.15, -0.35, 0]}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edgePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#00d4ff" opacity={0.11} transparent />
      </lineSegments>

      {nodeData.map(({ key, position }, index) => (
        <mesh
          key={key}
          ref={(el) => { nodeRefs.current[index] = el }}
          position={[position.x, position.y, position.z]}
        >
          <sphereGeometry args={[NODE_RADIUS, 16, 16]} />
          <meshStandardMaterial
            color="#00101f"
            emissive="#00d4ff"
            emissiveIntensity={IDLE_INTENSITY}
            roughness={0.35}
          />
        </mesh>
      ))}

      <points ref={burstRef} geometry={burstGeometry}>
        <pointsMaterial
          color="#00d4ff"
          size={0.07}
          opacity={burstOpacity}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
