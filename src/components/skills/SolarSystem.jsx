import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { skills } from '../../data/skills'
import { setSelectedSkill, useSelectedSkill } from './skillsStore'

const ORBIT_SCALE = 0.86
const PLANET_SCALE = 1.02
const CLOSE_CAMERA = new THREE.Vector3(0, 3.2, 9.5)
const WIDE_CAMERA = new THREE.Vector3(0, 18.5, 40)
const CLOSE_LOOK_AT = new THREE.Vector3(0, 0.18, 0)
const WIDE_LOOK_AT = new THREE.Vector3(0, 0, 0)

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function getSkillsViewportProgress() {
  const section = document.getElementById('skills')
  if (!section) return 0

  const start = section.offsetTop
  const span = Math.max(1, window.innerHeight * 0.58)
  return clamp((window.scrollY - start) / span)
}

// ─── GLSL: Stefan Gustavson's simplex noise ───────────────────────────────────
const SIMPLEX_GLSL = /* glsl */`
vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute4(vec4 x){return mod289v4(((x*34.)+1.)*x);}
vec4 taylorInvSqrt4(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289v3(i);
  vec4 p=permute4(permute4(permute4(
    i.z+vec4(0.,i1.z,i2.z,1.))
    +i.y+vec4(0.,i1.y,i2.y,1.))
    +i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt4(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

const sunVert = /* glsl */`
${SIMPLEX_GLSL}
uniform float uTime;
varying vec3 vNormal;
varying float vNoise;
void main(){
  vNormal=normal;
  float n=snoise(position*2.5+uTime*0.4)*0.1;
  vNoise=n;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*n,1.);
}
`

const sunFrag = /* glsl */`
precision mediump float;
uniform float uTime;
varying vec3 vNormal;
varying float vNoise;
void main(){
  vec3 amber=vec3(0.965,0.62,0.043);
  vec3 orange=vec3(1.,0.42,0.);
  float f=dot(normalize(vNormal),vec3(0.,0.,1.));
  vec3 col=mix(orange,amber,f+vNoise*2.);
  gl_FragColor=vec4(col,1.);
}
`

// ─── Canvas texture ───────────────────────────────────────────────────────────
function makeCanvasTexture(name, color) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 128, 128)
  // Subtle radial gradient overlay
  const grad = ctx.createRadialGradient(40, 40, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,0.25)')
  grad.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 13px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.8)'
  ctx.shadowBlur = 4
  ctx.fillText(name, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

function lightenColor(hex, amount) {
  const c = new THREE.Color(hex)
  return new THREE.Color(
    Math.min(1, c.r + amount),
    Math.min(1, c.g + amount),
    Math.min(1, c.b + amount),
  )
}

// ─── Sun ──────────────────────────────────────────────────────────────────────
function Sun() {
  const matRef = useRef()
  const coronaRef = useRef()
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((_, delta) => {
    uniforms.uTime.value += delta * 0.8
    if (coronaRef.current) {
      const s = 1 + Math.sin(uniforms.uTime.value * 1.2) * 0.04
      coronaRef.current.scale.setScalar(s)
    }
  })

  return (
    <group>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[1.0, 48, 48]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={sunVert}
          fragmentShader={sunFrag}
          uniforms={uniforms}
        />
      </mesh>
      {/* Corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={1.5}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Point light from sun */}
      <pointLight color="#f59e0b" intensity={3} distance={30} decay={2} />
      <Html distanceFactor={10} position={[0, 1.4, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '12px',
          fontWeight: 700,
          color: '#f59e0b',
          textShadow: '0 0 8px #f59e0b',
          whiteSpace: 'nowrap',
        }}>
          Divit Aggarwal
        </div>
      </Html>
    </group>
  )
}

// ─── Moon ────────────────────────────────────────────────────────────────────
function Moon({ index, total, planetSpeed, planetColor, timeRef }) {
  const ref = useRef()
  const phase = (index / total) * Math.PI * 2
  const speed = planetSpeed * 3
  const lightColor = useMemo(() => lightenColor(planetColor, 0.35), [planetColor])

  useFrame(() => {
    if (!ref.current) return
    const t = timeRef.current
    ref.current.position.set(
      Math.cos(t * speed + phase) * 0.45,
      0,
      Math.sin(t * speed + phase) * 0.45,
    )
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.075, 8, 8]} />
      <meshStandardMaterial color={lightColor} />
    </mesh>
  )
}

// ─── Planet ──────────────────────────────────────────────────────────────────
function Planet({ skill, phase, timeRef, isSelected, onSelect }) {
  const groupRef   = useRef()
  const meshRef    = useRef()
  const glowRef    = useRef()
  const hoveredRef = useRef(false)
  const texture    = useMemo(() => makeCanvasTexture(skill.name, skill.color), [skill])
  const visualOrbit = skill.orbit * ORBIT_SCALE
  const visualSize = skill.size * PLANET_SCALE

  // Keep scale in sync when selection changes
  useEffect(() => {
    if (!meshRef.current) return
    const s = isSelected ? 1.5 : 1
    gsap.to(meshRef.current.scale, { x: s, y: s, z: s, duration: 0.35, ease: 'back.out(1.5)' })
  }, [isSelected])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const t = timeRef.current
    groupRef.current.position.set(
      Math.cos(t * skill.speed + phase) * visualOrbit,
      0,
      Math.sin(t * skill.speed + phase) * visualOrbit,
    )
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.4
    if (glowRef.current) {
      const pulse = isSelected || hoveredRef.current ? 1.18 : 1
      glowRef.current.scale.setScalar(pulse + Math.sin(t * 2.4 + phase) * 0.045)
    }
  })

  function handleClick(e) {
    e.stopPropagation()
    onSelect(skill, groupRef.current.position)
  }

  function handlePointerOver(e) {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    if (!isSelected && meshRef.current) {
      hoveredRef.current = true
      gsap.to(meshRef.current.scale, { x: 1.55, y: 1.55, z: 1.55, duration: 0.28, ease: 'back.out(2)' })
    }
  }

  function handlePointerOut() {
    document.body.style.cursor = 'auto'
    if (!isSelected && meshRef.current) {
      hoveredRef.current = false
      gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.22, ease: 'power2.out' })
    }
  }

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[visualSize, 40, 40]} />
        <meshStandardMaterial
          map={texture}
          color={skill.color}
          emissive={skill.color}
          emissiveIntensity={isSelected ? 0.55 : 0.18}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[visualSize * 1.28, 32, 32]} />
        <meshBasicMaterial
          color={skill.color}
          transparent
          opacity={isSelected ? 0.18 : 0.08}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[visualSize * 1.55, 0.024, 8, 80]} />
          <meshBasicMaterial
            color={skill.color}
            transparent
            opacity={0.62}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Moons */}
      {skill.moons.map((moon, i) => (
        <Moon
          key={moon}
          name={moon}
          index={i}
          total={skill.moons.length}
          planetSpeed={skill.speed}
          planetColor={skill.color}
          timeRef={timeRef}
        />
      ))}

      {/* Label */}
      <Html
        distanceFactor={18}
        position={[0, visualSize + 0.48, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '13px',
          fontWeight: 700,
          padding: '4px 7px',
          border: `1px solid ${skill.color}55`,
          borderRadius: '4px',
          background: 'rgba(0, 0, 8, 0.72)',
          backdropFilter: 'blur(6px)',
          color: isSelected ? skill.color : 'rgba(226,232,240,0.82)',
          whiteSpace: 'nowrap',
          textShadow: isSelected
            ? `0 0 10px ${skill.color}, 0 0 20px ${skill.color}`
            : '0 0 6px rgba(0,0,0,0.9)',
          letterSpacing: 0,
          transition: 'color 0.3s',
        }}>
          {skill.name}
        </div>
      </Html>
    </group>
  )
}

// ─── Orbit ring ──────────────────────────────────────────────────────────────
function OrbitRing({ radius }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.015, radius + 0.015, 80]} />
      <meshBasicMaterial
        color={radius % 2 > 1 ? '#8b5cf6' : '#00d4ff'}
        opacity={0.055}
        transparent
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// ─── SolarSystem (main export) ────────────────────────────────────────────────
export default function SolarSystem() {
  const { camera } = useThree()
  const [selectedSkill] = useSelectedSkill()
  const timeRef = useRef(0)
  const cameraPos = useRef(CLOSE_CAMERA.clone())
  const lookAtTarget = useRef(CLOSE_LOOK_AT.clone())
  const scrollProgressRef = useRef(0)
  const targetCamera = useRef(CLOSE_CAMERA.clone())
  const targetLookAt = useRef(CLOSE_LOOK_AT.clone())

  // Stagger phases so planets don't start on top of each other
  const phases = useMemo(
    () => skills.map((_, i) => (i / skills.length) * Math.PI * 2),
    [],
  )

  // Set camera to overview on mount
  useEffect(() => {
    scrollProgressRef.current = getSkillsViewportProgress()
    camera.position.copy(CLOSE_CAMERA)
    camera.lookAt(CLOSE_LOOK_AT)
    cameraPos.current.copy(CLOSE_CAMERA)
    lookAtTarget.current.copy(CLOSE_LOOK_AT)
    return () => {
      gsap.killTweensOf(camera.position)
      camera.position.set(0, 0, 8)
      camera.lookAt(0, 0, 0)
      setSelectedSkill(null)
    }
  }, [camera])

  useEffect(() => {
    function updateProgress() {
      scrollProgressRef.current = getSkillsViewportProgress()
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  // Escape key to deselect
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleDeselect() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function handleSelect(skill, position) {
    setSelectedSkill(skill)
    gsap.to(lookAtTarget.current, {
      x: position.x, y: 0, z: position.z,
      duration: 0.8,
      ease: 'power2.inOut',
    })
  }

  function handleDeselect() {
    setSelectedSkill(null)
    gsap.to(lookAtTarget.current, {
      x: targetLookAt.current.x,
      y: targetLookAt.current.y,
      z: targetLookAt.current.z,
      duration: 0.8,
      ease: 'power2.inOut',
    })
  }

  useFrame((_, delta) => {
    timeRef.current += delta
    const p = THREE.MathUtils.smoothstep(scrollProgressRef.current, 0, 1)
    targetCamera.current.lerpVectors(CLOSE_CAMERA, WIDE_CAMERA, p)
    targetCamera.current.x = Math.sin(p * Math.PI * 1.1) * 2.2
    targetLookAt.current.lerpVectors(CLOSE_LOOK_AT, WIDE_LOOK_AT, p)

    if (!selectedSkill) lookAtTarget.current.lerp(targetLookAt.current, 0.08)
    cameraPos.current.lerp(targetCamera.current, 0.08)
    camera.position.copy(cameraPos.current)
    camera.lookAt(lookAtTarget.current)
  })

  return (
    <>
      <Sun />

      {skills.map((skill, i) => (
        <group key={skill.name}>
          <OrbitRing radius={skill.orbit * ORBIT_SCALE} />
          <Planet
            skill={skill}
            phase={phases[i]}
            timeRef={timeRef}
            isSelected={selectedSkill?.name === skill.name}
            onSelect={handleSelect}
          />
        </group>
      ))}
    </>
  )
}
