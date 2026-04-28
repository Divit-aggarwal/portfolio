import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// ─── Holographic panel shaders ───────────────────────────────────────────────

const podVert = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const podFrag = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uHovered;
  uniform float uActive;
  varying vec2 vUv;

  void main() {
    vec3 colorA = vec3(0.0,  0.102, 0.243);  // #001a3e
    vec3 colorB = vec3(0.0,  0.239, 0.486);  // #003d7c
    vec3 cyan   = vec3(0.0,  0.831, 1.0  );  // #00d4ff

    vec3 base = mix(colorA, colorB, vUv.y);
    base = mix(base, cyan * 0.25, uHovered * 0.6);

    // Scanlines
    float scan = mod(vUv.y * 20.0 + uTime * 0.4, 1.0);
    scan = step(0.5, scan) * 0.12;
    base += scan;

    // Edge glow via manual edge detection (compatible with all WebGL versions)
    float ex = min(vUv.x, 1.0 - vUv.x);
    float ey = min(vUv.y, 1.0 - vUv.y);
    float edge = 1.0 - smoothstep(0.0, 0.04, min(ex, ey));
    base += edge * cyan * (0.8 + uHovered * 0.4);

    float baseAlpha = mix(0.35, 0.72, uActive);
    float alpha = baseAlpha + edge * 0.25;

    gl_FragColor = vec4(base, alpha);
  }
`

// ─── Per-icon geometries ─────────────────────────────────────────────────────

const noiseSphereVert = /* glsl */`
  uniform float uTime;
  varying vec3 vNormal;
  void main() {
    vNormal = normal;
    float disp = sin(position.x * 4.0 + uTime)
               * sin(position.y * 4.0 + uTime * 1.3)
               * sin(position.z * 4.0 + uTime * 0.7)
               * 0.12;
    vec3 displaced = position + normal * disp;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`
const noiseSphereFragShader = /* glsl */`
  precision mediump float;
  varying vec3 vNormal;
  void main() {
    float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(mix(vec3(0.0, 0.4, 0.6), vec3(0.0, 0.83, 1.0), fresnel), 0.85);
  }
`

function TorusKnotIcon({ active }) {
  const ref = useRef()
  useFrame((_, d) => { ref.current.rotation.x += d * (active ? 0.9 : 0.4); ref.current.rotation.y += d * (active ? 0.6 : 0.25) })
  return (
    <mesh ref={ref} position={[0, 2.4, 0]}>
      <torusKnotGeometry args={[0.28, 0.09, 80, 14]} />
      <meshStandardMaterial color="#00d4ff" emissive="#003d5c" emissiveIntensity={0.6} />
    </mesh>
  )
}

function IcosahedronIcon({ active }) {
  const ref = useRef()
  useFrame((_, d) => { ref.current.rotation.x += d * (active ? 0.7 : 0.3); ref.current.rotation.z += d * (active ? 0.5 : 0.2) })
  return (
    <mesh ref={ref} position={[0, 2.4, 0]}>
      <icosahedronGeometry args={[0.38, 0]} />
      <meshStandardMaterial color="#8b5cf6" wireframe />
    </mesh>
  )
}

function GridIcon({ active }) {
  const ref = useRef()
  useFrame((_, d) => { ref.current.rotation.z += d * (active ? 0.5 : 0.2) })
  return (
    <group ref={ref} position={[0, 2.4, 0]}>
      <gridHelper args={[0.8, 6, '#00d4ff', '#003d5c']} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

function NoiseSphereIcon({ active }) {
  const ref = useRef()
  const matRef = useRef()
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  useFrame((_, d) => {
    uniforms.uTime.value += d * (active ? 1.4 : 0.6)
    ref.current.rotation.y += d * 0.3
  })
  return (
    <mesh ref={ref} position={[0, 2.4, 0]}>
      <sphereGeometry args={[0.35, 28, 28]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={noiseSphereVert}
        fragmentShader={noiseSphereFragShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

function SineRibbonIcon({ active }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(t) * 0.35, Math.sin(t * 2) * 0.15, Math.sin(t) * 0.35))
    }
    const curve = new THREE.CatmullRomCurve3(pts, true)
    return new THREE.TubeGeometry(curve, 80, 0.035, 8, true)
  }, [])
  useFrame((_, d) => { ref.current.rotation.y += d * (active ? 0.9 : 0.35); ref.current.rotation.x += d * 0.15 })
  return (
    <mesh ref={ref} position={[0, 2.4, 0]} geometry={geo}>
      <meshStandardMaterial color="#f59e0b" emissive="#7c4a00" emissiveIntensity={0.5} />
    </mesh>
  )
}

const ICON_MAP = {
  torusKnot: TorusKnotIcon,
  icosahedron: IcosahedronIcon,
  grid: GridIcon,
  noiseSphere: NoiseSphereIcon,
  sineRibbon: SineRibbonIcon,
}

// ─── HoloPod ─────────────────────────────────────────────────────────────────

export default function HoloPod({ project, position, isActive }) {
  const matRef = useRef()
  const groupRef = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHovered: { value: 0 },
    uActive: { value: isActive ? 1 : 0 },
  }), [])

  const IconComponent = ICON_MAP[project.icon]

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
    uniforms.uActive.value = THREE.MathUtils.lerp(uniforms.uActive.value, isActive ? 1 : 0, delta * 4)

    if (groupRef.current) {
      const targetScale = isActive ? 1.1 : 0.85
      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 4)
      )
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Floating icon above the panel */}
      <IconComponent active={isActive} />

      {/* Holographic glass panel */}
      <mesh
        onPointerOver={() => { uniforms.uHovered.value = 1 }}
        onPointerOut={() => { uniforms.uHovered.value = 0 }}
      >
        <boxGeometry args={[2.5, 3.5, 0.1]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={podVert}
          fragmentShader={podFrag}
          uniforms={uniforms}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* HTML content panel — positioned just in front of the glass */}
      <Html
        transform
        occlude="blending"
        position={[0, -0.1, 0.08]}
        style={{ width: '220px', pointerEvents: isActive ? 'auto' : 'none' }}
      >
        <div style={{
          fontFamily: 'Space Mono, monospace',
          color: '#e2e8f0',
          padding: '12px',
          userSelect: 'none',
          opacity: isActive ? 1 : 0.4,
          transition: 'opacity 0.3s',
        }}>
          <h3 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 8px',
            lineHeight: 1.2,
          }}>
            {project.title}
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
            {project.tags.map(tag => (
              <span key={tag} style={{
                fontSize: '9px',
                color: '#00d4ff',
                border: '1px solid #00d4ff44',
                borderRadius: '99px',
                padding: '2px 6px',
                background: '#00d4ff11',
              }}>
                {tag}
              </span>
            ))}
          </div>

          <p style={{
            fontSize: '10px',
            color: '#94a3b8',
            lineHeight: 1.7,
            margin: '0 0 14px',
          }}>
            {project.desc}
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <a href={project.github} style={{
              fontSize: '9px',
              color: '#00d4ff',
              border: '1px solid #00d4ff55',
              borderRadius: '6px',
              padding: '4px 10px',
              textDecoration: 'none',
              background: '#00d4ff10',
            }}>
              GitHub →
            </a>
            <a href={project.demo} style={{
              fontSize: '9px',
              color: '#8b5cf6',
              border: '1px solid #8b5cf655',
              borderRadius: '6px',
              padding: '4px 10px',
              textDecoration: 'none',
              background: '#8b5cf610',
            }}>
              Demo ↗
            </a>
          </div>
        </div>
      </Html>
    </group>
  )
}
