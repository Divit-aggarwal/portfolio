import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSectionProgress } from '../shared/ScrollManager'
import { projects } from '../../data/projects'
import HoloPod from './HoloPod'

const POD_Z = [0, -4, -8, -12, -16]
const CAMERA_START_Z = 6
const CAMERA_END_Z = -18

export default function ProjectsScene() {
  const { camera } = useThree()
  const sectionProgress = useSectionProgress(2)
  const progressRef = useRef(0)

  // Keep a ref in sync for useFrame reads (avoids stale closure)
  useEffect(() => { progressRef.current = sectionProgress }, [sectionProgress])

  // Reset camera when unmounting (section change)
  useEffect(() => {
    return () => {
      camera.position.set(0, 0, 8)
      camera.lookAt(0, 0, 0)
    }
  }, [camera])

  useFrame(() => {
    const p = progressRef.current
    const targetZ = THREE.MathUtils.lerp(CAMERA_START_Z, CAMERA_END_Z, p)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.06)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, 0.06)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.06)
    camera.lookAt(0, 0, camera.position.z - 4)
  })

  // Active pod: which pod is closest to the camera
  const activeIndex = Math.min(4, Math.round(sectionProgress * 4))

  return (
    <>
      {/* Corridor floor line */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-8, -2, 4, 8, -2, 4, -8, -2, -20, 8, -2, -20]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00d4ff" opacity={0.08} transparent />
      </lineSegments>

      {projects.map((project, i) => (
        <HoloPod
          key={project.id}
          project={project}
          position={[0, 0, POD_Z[i]]}
          isActive={activeIndex === i}
        />
      ))}
    </>
  )
}
