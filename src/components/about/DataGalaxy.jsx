import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useSectionProgress } from '../shared/ScrollManager'
import { useScene } from '../../hooks/useScene'
import { useIsMobile } from '../../hooks/useIsMobile'

// ── Scene layout ───────────────────────────────────────────────────────────
// Camera is at [0,0,8], FOV 60 → visible ≈ ±4.6x, ±2.6y at z=0
// Card occupies left ≈ x < -2.5 in screen space.
// Clusters orbit the right portion of the scene.
const CLUSTER_CENTERS = [
  new THREE.Vector3( 2.2,  2.0,  0.2),   // Classification — top-right   cyan
  new THREE.Vector3( 3.6, -0.2, -0.8),   // NLP            — center-right purple
  new THREE.Vector3( 1.4, -2.6,  0.4),   // Computer Vision — bottom      amber
  new THREE.Vector3(-0.6,  2.4, -0.8),   // Regression     — top-left     green
]

const CLUSTER_HEX = ['#00d4ff', '#8b5cf6', '#f59e0b', '#10b981']
const CLUSTER_COLORS = CLUSTER_HEX.map(h => new THREE.Color(h))
const CLUSTER_LABELS = ['Classification', 'NLP', 'Computer Vision', 'Regression']
const CLUSTER_SUBLABELS = [
  ['Logistic Regression', 'SVM', 'Decision Trees'],
  ['LLMs', 'Embeddings', 'RAG'],
  ['YOLO', 'U-Net', 'Segmentation'],
  ['Linear Models', 'PCA', 'Optimization'],
]

// Right-edge of the About card in 3D (origin for neural paths)
const CARD_ORIGIN = new THREE.Vector3(-3.8, 0, 1.2)

// ── Particle vertex shader ─────────────────────────────────────────────────
const particleVert = /* glsl */ `
  attribute float aSize;
  attribute vec3  aColor;
  attribute vec3  aRandomPos;
  attribute float aPhase;

  uniform float uProgress;
  uniform float uTime;

  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    vec3 pos = mix(aRandomPos, position, uProgress);

    // Gentle organic drift applied after arrival
    float t = uProgress;
    pos.y += sin(uTime * 0.55 + aPhase * 6.283) * 0.065 * t;
    pos.x += cos(uTime * 0.42 + aPhase * 4.189) * 0.050 * t;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float pulse = sin(uTime * 2.1 + aPhase * 6.283) * 0.5 + 0.5;
    vAlpha = 0.50 + pulse * 0.50;

    gl_PointSize = (aSize + pulse * 11.0) * uProgress / max(-mvPos.z, 0.01);
  }
`

// ── Particle fragment shader ───────────────────────────────────────────────
const particleFrag = /* glsl */ `
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    float dist = length(gl_PointCoord - 0.5);

    float core = 1.0 - smoothstep(0.0,  0.18, dist);
    float halo = 1.0 - smoothstep(0.18, 0.50, dist);

    float alpha = (core * 0.9 + halo * 0.55) * vAlpha;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(vColor + vColor * core * 0.9, alpha);
  }
`

// ── Helpers ────────────────────────────────────────────────────────────────
function buildParticleGeometry(count) {
  const positions    = new Float32Array(count * 3)
  const randomPos    = new Float32Array(count * 3)
  const colors       = new Float32Array(count * 3)
  const sizes        = new Float32Array(count)
  const phases       = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const ci     = i % 4
    const center = CLUSTER_CENTERS[ci]
    const spread = 0.72

    positions[i*3]   = center.x + (Math.random() - 0.5) * spread * 2
    positions[i*3+1] = center.y + (Math.random() - 0.5) * spread * 2
    positions[i*3+2] = center.z + (Math.random() - 0.5) * spread * 2

    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)
    const r     = 10 + Math.random() * 5
    randomPos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
    randomPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
    randomPos[i*3+2] = r * Math.cos(phi)

    const col = CLUSTER_COLORS[ci]
    colors[i*3]   = col.r
    colors[i*3+1] = col.g
    colors[i*3+2] = col.b

    sizes[i]  = 15 + Math.random() * 22
    phases[i] = Math.random()
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position',   new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aRandomPos', new THREE.BufferAttribute(randomPos, 3))
  geo.setAttribute('aColor',     new THREE.BufferAttribute(colors,    3))
  geo.setAttribute('aSize',      new THREE.BufferAttribute(sizes,     1))
  geo.setAttribute('aPhase',     new THREE.BufferAttribute(phases,    1))
  return geo
}

// Random line pairs inside each cluster for internal constellation effect
function buildIntraLines(center, count = 20) {
  const pts = []
  for (let i = 0; i < count; i++) {
    const spread = 0.65
    const rnd = () => (Math.random() - 0.5) * spread * 2
    pts.push(center.x+rnd(), center.y+rnd(), center.z+rnd())
    pts.push(center.x+rnd(), center.y+rnd(), center.z+rnd())
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3))
  return geo
}

// Radial glow sprite texture
function buildGlowTexture() {
  const sz = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = sz
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(sz/2, sz/2, 0, sz/2, sz/2, sz/2)
  grad.addColorStop(0,   'rgba(255,255,255,0.55)')
  grad.addColorStop(0.4, 'rgba(255,255,255,0.12)')
  grad.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, sz, sz)
  return new THREE.CanvasTexture(canvas)
}

// ── Component ──────────────────────────────────────────────────────────────
export default function DataGalaxy() {
  const particleMatRef = useRef()
  const progressRef    = useRef({ value: 0 })
  const shuffleTimer   = useRef(null)
  const { currentSection } = useScene()
  const sectionProgress = useSectionProgress(1)
  const hasEnteredSection = sectionProgress > 0
  const isMobile = useIsMobile()
  const particleCount = isMobile ? 800 : 2000

  const [hoveredCluster, setHoveredCluster] = useState(-1)
  const hoveredRef = useRef(-1)

  // ── Geometry / materials ─────────────────────────────────────────────────
  const particleGeo = useMemo(() => buildParticleGeometry(particleCount), [particleCount])
  const intraGeos   = useMemo(() => CLUSTER_CENTERS.map(c => buildIntraLines(c)), [])
  const glowTex     = useMemo(() => buildGlowTexture(), [])

  // Quadratic bezier curves from card to each cluster
  const curves = useMemo(() =>
    CLUSTER_CENTERS.map((center, i) => {
      const mid = new THREE.Vector3().addVectors(CARD_ORIGIN, center).multiplyScalar(0.5)
      mid.y += 1.0 + i * 0.25
      mid.z += 0.4
      return new THREE.QuadraticBezierCurve3(CARD_ORIGIN.clone(), mid, center.clone())
    }),
  [])

  // Path line THREE.Line objects (for neural connections) — desktop only
  const intraLineMats = useMemo(() =>
    CLUSTER_HEX.map(hex =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(hex),
        transparent: true,
        opacity: 0.10,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  [])

  const pathLineMats = useMemo(() =>
    CLUSTER_HEX.map(hex =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(hex),
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  [])

  const pathLines = useMemo(() =>
    curves.map((curve, i) => {
      const pts = curve.getPoints(40)
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      return new THREE.Line(geo, pathLineMats[i])
    }),
  [curves, pathLineMats])

  // ── Particle uniforms ────────────────────────────────────────────────────
  const particleUniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime:     { value: 0 },
  }), [])

  // ── Pulse state ──────────────────────────────────────────────────────────
  const pulses = useRef(CLUSTER_CENTERS.map(() => ({ t: -2, speed: 0.28 })))
  const pulseMeshRefs = useRef([null, null, null, null])

  // ── Hover glow ref for planes (avoids re-render jitter) ──────────────────
  const glowMatRefs = useRef([null, null, null, null])

  // ── Entry animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (hasEnteredSection) {
      gsap.to(progressRef.current, {
        value: 1,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          if (particleMatRef.current) {
            particleMatRef.current.uniforms.uProgress.value = progressRef.current.value
          }
        },
      })
    } else {
      progressRef.current.value = 0
      if (particleMatRef.current) particleMatRef.current.uniforms.uProgress.value = 0
    }
  }, [hasEnteredSection])

  // ── Shuffle every 10 s ───────────────────────────────────────────────────
  useEffect(() => {
    if (currentSection !== 1) {
      clearInterval(shuffleTimer.current)
      return
    }
    shuffleTimer.current = setInterval(() => {
      const pos   = particleGeo.attributes.position.array
      const count = particleGeo.attributes.position.count
      for (let i = 0; i < count; i++) {
        const ci = i % 4
        const c  = CLUSTER_CENTERS[ci]
        const j  = 0.3
        pos[i*3]   = c.x + (Math.random()-0.5)*j
        pos[i*3+1] = c.y + (Math.random()-0.5)*j
        pos[i*3+2] = c.z + (Math.random()-0.5)*j
      }
      particleGeo.attributes.position.needsUpdate = true
      progressRef.current.value = 0.3
      if (particleMatRef.current) particleMatRef.current.uniforms.uProgress.value = 0.3
      gsap.to(progressRef.current, {
        value: 1,
        duration: 1.2,
        ease: 'power3.out',
        onUpdate: () => {
          if (particleMatRef.current) {
            particleMatRef.current.uniforms.uProgress.value = progressRef.current.value
          }
        },
      })
    }, 10000)
    return () => clearInterval(shuffleTimer.current)
  }, [currentSection, particleGeo])

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => () => {
    particleGeo.dispose()
    intraGeos.forEach(g => g.dispose())
    pathLines.forEach(l => { l.geometry.dispose(); l.material.dispose() })
    glowTex.dispose()
    document.body.style.cursor = ''
  }, [glowTex, intraGeos, particleGeo, pathLines])

  // ── Frame loop ───────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    // Tick shader time
    if (particleMatRef.current) {
      particleMatRef.current.uniforms.uTime.value += delta
    }

    const hov = hoveredRef.current

    // Advance signal pulses
    pulses.current.forEach((pulse, i) => {
      if (pulse.t >= -1) {
        pulse.t += delta * pulse.speed
        if (pulse.t > 1.15) pulse.t = -2
      }

      // Path line flashes when a pulse is traveling on it
      if (pathLineMats[i]) {
        const target = (pulse.t >= 0 && pulse.t <= 1) ? 0.18 : 0.06
        pathLineMats[i].opacity += (target - pathLineMats[i].opacity) * 0.12
      }

      // Update pulse sphere position
      const mesh = pulseMeshRefs.current[i]
      if (mesh) {
        if (pulse.t >= 0 && pulse.t <= 1) {
          curves[i].getPoint(pulse.t, mesh.position)
          mesh.visible = true
        } else {
          mesh.visible = false
        }
      }
    })

    // Fire new pulses randomly while in section
    if (currentSection === 1 && Math.random() < 0.007) {
      const i = Math.floor(Math.random() * 4)
      if (pulses.current[i].t < -1) {
        pulses.current[i].t     = 0
        pulses.current[i].speed = 0.22 + Math.random() * 0.18
      }
    }

    // Smoothly interpolate intra-cluster line opacity
    intraLineMats.forEach((mat, i) => {
      const target = hov === i ? 0.38 : 0.10
      mat.opacity += (target - mat.opacity) * 0.07
    })

    // Smoothly interpolate glow plane opacity
    glowMatRefs.current.forEach((mat, i) => {
      if (!mat) return
      const target = hov === i ? 0.28 : 0.11
      mat.opacity += (target - mat.opacity) * 0.07
    })
  })

  // ── Hover callbacks ──────────────────────────────────────────────────────
  const onEnter = useCallback((i) => {
    setHoveredCluster(i)
    hoveredRef.current = i
    document.body.style.cursor = 'crosshair'
  }, [])
  const onLeave = useCallback(() => {
    setHoveredCluster(-1)
    hoveredRef.current = -1
    document.body.style.cursor = ''
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <OrbitControls
        enabled={currentSection === 1}
        autoRotate
        autoRotateSpeed={0.25}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={(2.5 * Math.PI) / 4}
      />

      {/* ── Particle cloud ── */}
      <points geometry={particleGeo}>
        <shaderMaterial
          ref={particleMatRef}
          vertexShader={particleVert}
          fragmentShader={particleFrag}
          uniforms={particleUniforms}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          transparent
        />
      </points>

      {/* ── Intra-cluster constellation lines ── */}
      {intraGeos.map((geo, i) => (
        <lineSegments key={`intra-${i}`} geometry={geo} material={intraLineMats[i]} />
      ))}

      {/* ── Neural path lines (card → cluster) — desktop only ── */}
      {!isMobile && pathLines.map((line, i) => (
        <primitive key={`path-${i}`} object={line} />
      ))}

      {/* ── Signal pulse spheres ── */}
      {!isMobile && CLUSTER_CENTERS.map((_, i) => (
        <mesh
          key={`pulse-${i}`}
          ref={el => { pulseMeshRefs.current[i] = el }}
          visible={false}
        >
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshBasicMaterial
            color={CLUSTER_HEX[i]}
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* ── Radial glow planes ── */}
      {CLUSTER_CENTERS.map((center, i) => (
        <mesh
          key={`glow-${i}`}
          position={[center.x, center.y, center.z - 0.25]}
        >
          <planeGeometry args={[3.0, 3.0]} />
          <meshBasicMaterial
            ref={el => { glowMatRefs.current[i] = el }}
            map={glowTex}
            color={CLUSTER_HEX[i]}
            transparent
            opacity={0.11}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* ── Per-cluster: hover hit-box + label + tooltip ── */}
      {CLUSTER_CENTERS.map((center, i) => (
        <group key={`cluster-node-${i}`}>

          {/* Invisible hover sphere */}
          <mesh
            position={[center.x, center.y, center.z]}
            onPointerEnter={() => onEnter(i)}
            onPointerLeave={onLeave}
          >
            <sphereGeometry args={[0.95, 8, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* Label + sub-skill tooltip */}
          <Html
            position={[center.x, center.y + 1.25, center.z]}
            distanceFactor={8}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
            center
          >
            <div style={{ textAlign: 'center' }}>
              {/* Main label */}
              <div
                style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: hoveredCluster === i ? '12px' : '10px',
                  letterSpacing: '0.08em',
                  color: hoveredCluster === i ? CLUSTER_HEX[i] : 'rgba(226,232,240,0.85)',
                  background: hoveredCluster === i
                    ? `${CLUSTER_HEX[i]}1e`
                    : 'rgba(0,0,8,0.55)',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  border: `1px solid ${CLUSTER_HEX[i]}${hoveredCluster === i ? '66' : '2a'}`,
                  textShadow: hoveredCluster === i
                    ? `0 0 14px ${CLUSTER_HEX[i]}, 0 0 30px ${CLUSTER_HEX[i]}55`
                    : 'none',
                  transition: 'all 0.25s ease',
                  marginBottom: hoveredCluster === i ? '6px' : 0,
                }}
              >
                {CLUSTER_LABELS[i]}
              </div>

              {/* Sub-skill chips — visible on hover */}
              {hoveredCluster === i && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                  {CLUSTER_SUBLABELS[i].map(skill => (
                    <div
                      key={skill}
                      style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '9px',
                        color: 'rgba(226,232,240,0.65)',
                        background: 'rgba(0,0,8,0.72)',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        border: '1px solid rgba(255,255,255,0.07)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Html>

        </group>
      ))}
    </>
  )
}
