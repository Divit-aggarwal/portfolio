import { lazy, Suspense, useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { useScene } from '../../hooks/useScene'

const SCENES = [
  lazy(() => import('../hero/HeroScene')),
  lazy(() => import('../about/AboutScene')),
  lazy(() => import('../projects/ProjectsScene')),
  lazy(() => import('../skills/SkillsScene')),
  lazy(() => import('../transformer/TransformerScene')),
  lazy(() => import('../contact/ContactScene')),
]

function FadingScene({ SceneComponent, visible }) {
  const groupRef = useRef()

  // Fade via group scale: invisible = scale 0 over 300ms
  useEffect(() => {
    if (!groupRef.current) return
    const target = visible ? 1 : 0
    gsap.to(groupRef.current.scale, {
      x: target, y: target, z: target,
      duration: 0.3,
      ease: 'power2.inOut',
    })
  }, [visible])

  return (
    <group ref={groupRef} scale={visible ? 1 : 0}>
      <Suspense fallback={null}>
        <SceneComponent />
      </Suspense>
    </group>
  )
}

export default function ActiveSection() {
  const { currentSection } = useScene()
  const [displaySection, setDisplaySection] = useState(currentSection)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (currentSection === displaySection) return
    setFading(true)
    const timer = setTimeout(() => {
      setDisplaySection(currentSection)
      setFading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [currentSection, displaySection])

  const SceneComponent = SCENES[displaySection]

  return (
    <FadingScene SceneComponent={SceneComponent} visible={!fading} />
  )
}
