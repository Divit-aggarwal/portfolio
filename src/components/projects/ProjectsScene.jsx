import { useMemo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'

function AmbientDust() {
  const count = 90
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 16
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return arr
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#8b5cf6"
        size={0.025}
        transparent
        opacity={0.22}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

export default function ProjectsScene() {
  const { camera } = useThree()

  useEffect(() => {
    gsap.to(camera.position, { x: 0, y: 0, z: 10, duration: 1.2, ease: 'power2.out' })
    return () => {
      gsap.killTweensOf(camera.position)
      camera.position.set(0, 0, 8)
      camera.lookAt(0, 0, 0)
    }
  }, [camera])

  return <AmbientDust />
}
