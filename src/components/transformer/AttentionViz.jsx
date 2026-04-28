import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

const TOKENS = ['The', 'model', 'learns', 'context', 'very', 'well']
const TOKEN_X = [-3, -1.8, -0.6, 0.6, 1.8, 3]

const ATTENTION = [
  [0.40, 0.20, 0.15, 0.10, 0.10, 0.05],
  [0.15, 0.35, 0.25, 0.15, 0.05, 0.05],
  [0.10, 0.20, 0.30, 0.25, 0.10, 0.05],
  [0.05, 0.10, 0.20, 0.35, 0.20, 0.10],
  [0.05, 0.05, 0.10, 0.25, 0.35, 0.20],
  [0.05, 0.05, 0.10, 0.15, 0.25, 0.40],
]

const LOW = new THREE.Color('#001a3e')
const HIGH = new THREE.Color('#00d4ff')

function buildBeams() {
  const out = []
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      const w = ATTENTION[i][j]
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(TOKEN_X[i], 0, 0),
        new THREE.Vector3((TOKEN_X[i] + TOKEN_X[j]) / 2, 0.5, 1.5),
        new THREE.Vector3(TOKEN_X[j], 0, 3),
      ])
      const geometry = new THREE.TubeGeometry(curve, 20, w * 0.06, 8, false)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().lerpColors(LOW, HIGH, w),
        opacity: 0,
        transparent: true,
      })
      out.push({ i, j, w, geometry, material, finalOpacity: Math.min(w * 1.5, 0.9) })
    }
  }
  return out
}

function CameraRig() {
  const { camera } = useThree()
  const angle = useRef(0)
  const target = useMemo(() => new THREE.Vector3(0, 0, 1.5), [])

  useEffect(() => {
    camera.position.set(0, 3, 8)
    camera.lookAt(target)
  }, [camera, target])

  useFrame((_, delta) => {
    angle.current += delta * 0.1
    camera.position.x = Math.sin(angle.current) * 6.5
    camera.position.z = 1.5 + Math.cos(angle.current) * 6.5
    camera.position.y = 3
    camera.lookAt(target)
  })

  return null
}

function TokenCube({ index, zRow, highlighted, onHover, onLeave }) {
  return (
    <group position={[TOKEN_X[index], 0, zRow]}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); onHover(index) }}
        onPointerOut={onLeave}
      >
        <boxGeometry args={[0.6, 0.6, 0.1]} />
        <meshStandardMaterial
          color="#001a3e"
          emissive={highlighted ? '#f59e0b' : '#003366'}
          emissiveIntensity={highlighted ? 1.8 : 0.5}
        />
      </mesh>
      <Html center position={[0, -0.62, 0]}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.7rem',
          color: highlighted ? '#f59e0b' : '#67e8f9',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          transition: 'color 0.2s',
          pointerEvents: 'none',
        }}>
          {TOKENS[index]}
        </span>
      </Html>
    </group>
  )
}

function RowLabel({ text, color, position }) {
  return (
    <Html center position={position}>
      <span style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.6rem',
        color,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        opacity: 0.6,
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        {text}
      </span>
    </Html>
  )
}

function AttentionBeams({ beams, hoveredToken }) {
  const groupRefs = useRef([])

  // Entrance animation: scale + opacity stagger
  useEffect(() => {
    const tweens = beams.map(({ material, finalOpacity }, idx) => {
      const group = groupRefs.current[idx]
      if (group) {
        group.scale.set(0, 0, 0)
        gsap.to(group.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.35,
          delay: idx * 0.04,
          ease: 'back.out(1.5)',
        })
      }
      return gsap.to(material, {
        opacity: finalOpacity,
        duration: 0.4,
        delay: idx * 0.04,
        ease: 'power2.out',
      })
    })
    return () => tweens.forEach(t => t.kill())
  }, [beams])

  // Hover: dim non-attended beams
  useEffect(() => {
    beams.forEach(({ i, material, finalOpacity }) => {
      const target = hoveredToken === null
        ? finalOpacity
        : i === hoveredToken ? finalOpacity : 0.03
      gsap.killTweensOf(material)
      gsap.to(material, { opacity: target, duration: 0.2 })
    })
  }, [hoveredToken, beams])

  return (
    <>
      {beams.map(({ geometry, material }, idx) => (
        <group key={idx} ref={el => { groupRefs.current[idx] = el }}>
          <mesh geometry={geometry} material={material} />
        </group>
      ))}
    </>
  )
}

function TorusKnot() {
  const ref = useRef()

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta * 0.3
    ref.current.rotation.y += delta * 0.5
    ref.current.rotation.z += delta * 0.2
  })

  return (
    <group position={[0, 0, 1.5]}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[0.6, 0.15, 100, 16]} />
        <meshStandardMaterial
          color="#1a0033"
          emissive="#8b5cf6"
          emissiveIntensity={1.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <Html center position={[0, 1.25, 0]}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.6rem',
          color: '#a78bfa',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
          textShadow: '0 0 8px rgba(139,92,246,0.8)',
        }}>
          Attention Head
        </span>
      </Html>
    </group>
  )
}

export default function AttentionViz() {
  const [hoveredToken, setHoveredToken] = useState(null)
  const beams = useMemo(() => buildBeams(), [])

  const mostAttended = hoveredToken !== null
    ? ATTENTION[hoveredToken].indexOf(Math.max(...ATTENTION[hoveredToken]))
    : null

  // Dispose on unmount
  useEffect(() => {
    return () => {
      beams.forEach(({ geometry, material }) => {
        geometry.dispose()
        material.dispose()
      })
    }
  }, [beams])

  return (
    <>
      <CameraRig />

      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, 1.5]} intensity={2} color="#8b5cf6" />
      <pointLight position={[0, -2, 1.5]} intensity={1} color="#00d4ff" />
      <pointLight position={[-4, 2, 0]} intensity={0.6} color="#00d4ff" />
      <pointLight position={[4, 2, 3]} intensity={0.6} color="#8b5cf6" />

      {/* Query row — z=0, interactive */}
      {TOKENS.map((_, i) => (
        <TokenCube
          key={`q-${i}`}
          index={i}
          zRow={0}
          highlighted={hoveredToken === i}
          onHover={setHoveredToken}
          onLeave={() => setHoveredToken(null)}
        />
      ))}
      <RowLabel text="Query" color="#00d4ff" position={[-4.2, 0, 0]} />

      {/* Key row — z=3, decorative */}
      {TOKENS.map((_, i) => (
        <TokenCube
          key={`k-${i}`}
          index={i}
          zRow={3}
          highlighted={false}
          onHover={() => {}}
          onLeave={() => {}}
        />
      ))}
      <RowLabel text="Key" color="#8b5cf6" position={[-4.2, 0, 3]} />

      {/* 36 attention beams */}
      <AttentionBeams beams={beams} hoveredToken={hoveredToken} />

      {/* Attention head centerpiece */}
      <TorusKnot />

      {/* Hover tooltip */}
      {hoveredToken !== null && mostAttended !== null && (
        <Html position={[TOKEN_X[hoveredToken], 1.6, 0]} center>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            color: '#e2e8f0',
            background: 'rgba(0,0,8,0.88)',
            border: '1px solid rgba(245,158,11,0.45)',
            borderRadius: '6px',
            padding: '6px 12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 0 12px rgba(245,158,11,0.15)',
          }}>
            Attends most to:{' '}
            <span style={{ color: '#f59e0b' }}>"{TOKENS[mostAttended]}"</span>
          </div>
        </Html>
      )}
    </>
  )
}
