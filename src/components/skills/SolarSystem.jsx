import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { skills } from '../../data/skills'
import { setSelectedSkill, useSelectedSkill } from './skillsStore'

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
function Moon({ name, index, total, planetSpeed, planetColor, timeRef }) {
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
function Planet({ skill, phase, timeRef, isSelected, onSelect, onDeselect }) {
  const groupRef   = useRef()
  const meshRef    = useRef()
  const hoveredRef = useRef(false)
  const texture    = useMemo(() => makeCanvasTexture(skill.name, skill.color), [skill])

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
      Math.cos(t * skill.speed + phase) * skill.orbit,
      0,
      Math.sin(t * skill.speed + phase) * skill.orbit,
    )
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.4
  })

  function handleClick(e) {
    e.stopPropagation()
    if (isSelected) { onDeselect() } else { onSelect(skill, groupRef.current.position) }
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
        <sphereGeometry args={[skill.size, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          color={skill.color}
          emissive={skill.color}
          emissiveIntensity={isSelected ? 0.55 : 0.18}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

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
        distanceFactor={12}
        position={[0, skill.size + 0.32, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '11px',
          fontWeight: 700,
          color: isSelected ? skill.color : 'rgba(226,232,240,0.82)',
          whiteSpace: 'nowrap',
          textShadow: isSelected
            ? `0 0 10px ${skill.color}, 0 0 20px ${skill.color}`
            : '0 0 6px rgba(0,0,0,0.9)',
          letterSpacing: '0.04em',
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
      <meshBasicMaterial color="#ffffff" opacity={0.07} transparent side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─── SolarSystem (main export) ────────────────────────────────────────────────
export default function SolarSystem() {
  const { camera } = useThree()
  const [selectedSkill] = useSelectedSkill()
  const timeRef = useRef(0)
  const cameraPos = useRef(new THREE.Vector3(0, 20, 44))
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0))

  // Stagger phases so planets don't start on top of each other
  const phases = useMemo(
    () => skills.map((_, i) => (i / skills.length) * Math.PI * 2),
    [],
  )

  // Set camera to overview on mount
  useEffect(() => {
    gsap.to(camera.position, { x: 0, y: 20, z: 44, duration: 1.4, ease: 'power2.out' })
    cameraPos.current.set(0, 20, 44)
    return () => {
      gsap.killTweensOf(camera.position)
      gsap.killTweensOf(lookAtTarget.current)
      camera.position.set(0, 0, 8)
      camera.lookAt(0, 0, 0)
      setSelectedSkill(null)
    }
  }, [camera])

  // Escape key to deselect
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleDeselect() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function handleSelect(skill, position) {
    setSelectedSkill(skill)
    const angle = Math.atan2(position.z, position.x)
    const pullIn = skill.orbit * 0.5
    gsap.to(cameraPos.current, {
      x: Math.cos(angle) * pullIn,
      y: skill.orbit * 0.45,
      z: Math.sin(angle) * pullIn + skill.orbit * 0.6,
      duration: 1.3,
      ease: 'power2.inOut',
    })
    gsap.to(lookAtTarget.current, {
      x: position.x, y: 0, z: position.z,
      duration: 1.3,
      ease: 'power2.inOut',
    })
  }

  function handleDeselect() {
    setSelectedSkill(null)
    gsap.to(cameraPos.current, { x: 0, y: 16, z: 34, duration: 1.3, ease: 'power2.inOut' })
    gsap.to(lookAtTarget.current, { x: 0, y: 0, z: 0, duration: 1.3, ease: 'power2.inOut' })
  }

  useFrame((_, delta) => {
    timeRef.current += delta
    camera.position.lerp(cameraPos.current, 0.05)
    camera.lookAt(lookAtTarget.current)
  })

  return (
    <>
      <Sun />

      {skills.map((skill, i) => (
        <group key={skill.name}>
          <OrbitRing radius={skill.orbit} />
          <Planet
            skill={skill}
            phase={phases[i]}
            timeRef={timeRef}
            isSelected={selectedSkill?.name === skill.name}
            onSelect={handleSelect}
            onDeselect={handleDeselect}
          />
        </group>
      ))}
    </>
  )
}
