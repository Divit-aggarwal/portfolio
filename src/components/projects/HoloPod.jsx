import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { setSelectedProject } from './projectsStore'

// ─── Animated icons (centered at origin) ────────────────────────────────────

function TorusKnotIcon({ active, color }) {
  const ref = useRef()
  useFrame((_, d) => {
    ref.current.rotation.x += d * (active ? 0.9 : 0.35)
    ref.current.rotation.y += d * (active ? 0.6 : 0.22)
  })
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.3, 0.1, 90, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.2 : 0.3} />
    </mesh>
  )
}

function IcosahedronIcon({ active, color }) {
  const ref = useRef()
  useFrame((_, d) => {
    ref.current.rotation.x += d * (active ? 0.7 : 0.28)
    ref.current.rotation.z += d * (active ? 0.5 : 0.18)
  })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.42, 0]} />
      <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={active ? 0.8 : 0.2} />
    </mesh>
  )
}

function GraphIcon({ active, color }) {
  const ref = useRef()
  const { geo, lineGeo } = useMemo(() => {
    const NODE_COUNT = 8
    const positions = new Float32Array(NODE_COUNT * 3)
    const linePositions = []
    const pts = []

    for (let i = 0; i < NODE_COUNT; i++) {
      const a = (i / NODE_COUNT) * Math.PI * 2
      const r = i % 2 === 0 ? 0.38 : 0.22
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r
      const z = (i % 3 === 0 ? 0.12 : -0.08)
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      pts.push(new THREE.Vector3(x, y, z))
    }

    // Connect every node to the next (ring) + cross-connections
    for (let i = 0; i < NODE_COUNT; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % NODE_COUNT]
      linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z)
      if (i % 2 === 0) {
        const c = pts[(i + 3) % NODE_COUNT]
        linePositions.push(a.x, a.y, a.z, c.x, c.y, c.z)
      }
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

    const lg = new THREE.BufferGeometry()
    lg.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))

    return { geo: g, lineGeo: lg }
  }, [])

  useFrame((_, d) => { ref.current.rotation.y += d * (active ? 0.7 : 0.25) })

  return (
    <group ref={ref}>
      <points geometry={geo}>
        <pointsMaterial color={color} size={0.07} sizeAttenuation transparent opacity={active ? 1 : 0.7} />
      </points>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color={color} transparent opacity={active ? 0.55 : 0.2} />
      </lineSegments>
    </group>
  )
}

const noiseSphereVert = /* glsl */`
  uniform float uTime;
  varying vec3 vNormal;
  void main() {
    vNormal = normal;
    float d = sin(position.x * 4.0 + uTime)
            * sin(position.y * 4.0 + uTime * 1.3)
            * sin(position.z * 4.0 + uTime * 0.7) * 0.12;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * d, 1.0);
  }
`
const noiseSphereFragShader = /* glsl */`
  precision mediump float;
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    float f = pow(1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(mix(uColor * 0.35, uColor, f), 0.88);
  }
`

function NoiseSphereIcon({ active, color }) {
  const ref = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
  }), [color])
  useFrame((_, d) => {
    uniforms.uTime.value += d * (active ? 1.4 : 0.6)
    ref.current.rotation.y += d * 0.3
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.38, 32, 32]} />
      <shaderMaterial
        vertexShader={noiseSphereVert}
        fragmentShader={noiseSphereFragShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

function SineRibbonIcon({ active, color }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(t) * 0.35, Math.sin(t * 2) * 0.15, Math.sin(t) * 0.35))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 80, 0.035, 8, true)
  }, [])
  useFrame((_, d) => {
    ref.current.rotation.y += d * (active ? 0.9 : 0.35)
    ref.current.rotation.x += d * 0.15
  })
  return (
    <mesh ref={ref} geometry={geo}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.1 : 0.3} />
    </mesh>
  )
}

const ICON_MAP = {
  torusKnot: TorusKnotIcon,
  icosahedron: IcosahedronIcon,
  grid: GraphIcon,
  noiseSphere: NoiseSphereIcon,
  sineRibbon: SineRibbonIcon,
}

// ─── ProjectNode (exported as HoloPod for backwards compat) ──────────────────

export default function HoloPod({ project, position, isSelected }) {
  const groupRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const glowRef = useRef()
  const [hovered, setHovered] = useState(false)
  const phaseOffset = project.id * 1.31

  const IconComponent = ICON_MAP[project.icon]
  const active = isSelected || hovered

  useFrame((state, delta) => {
    if (!groupRef.current) return
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.7 + phaseOffset) * 0.13

    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * (isSelected ? 1.1 : 0.4)
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * (isSelected ? -0.75 : -0.25)

    if (glowRef.current) {
      const target = active ? 1 : 0
      glowRef.current.material.opacity = THREE.MathUtils.lerp(
        glowRef.current.material.opacity, target * 0.12, delta * 4,
      )
    }
  })

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* Soft glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial color={project.color} transparent opacity={0} depthWrite={false} side={THREE.BackSide} />
      </mesh>

      {/* Outer orbit ring */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 5, 0, 0]}>
        <torusGeometry args={[0.72, 0.018, 8, 64]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={active ? 2.8 : 0.6}
          transparent
          opacity={active ? 0.95 : 0.5}
        />
      </mesh>

      {/* Inner orbit ring */}
      <mesh ref={ring2Ref} rotation={[0, Math.PI / 5, Math.PI / 6]}>
        <torusGeometry args={[0.52, 0.012, 8, 48]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={active ? 1.8 : 0.35}
          transparent
          opacity={active ? 0.75 : 0.3}
        />
      </mesh>

      {/* 3D icon */}
      <IconComponent active={active} color={project.color} />

      {/* Invisible interaction sphere */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          setSelectedProject(isSelected ? null : project)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[0.95, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Project title label */}
      <Html distanceFactor={10} position={[0, -1.05, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '9px',
          color: active ? project.color : 'rgba(226,232,240,0.4)',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          textShadow: active ? `0 0 12px ${project.color}` : 'none',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          transition: 'color 0.3s',
        }}>
          {project.title}
        </div>
      </Html>
    </group>
  )
}
