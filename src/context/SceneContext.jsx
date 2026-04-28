import { createContext, useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const SceneContext = createContext(null)

export function SceneProvider({ children }) {
  const [currentSection, setCurrentSectionState] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimer = useRef(null)
  const prevSection = useRef(0)

  const setSection = useCallback((index) => {
    const clamped = Math.max(0, Math.min(5, index))
    if (clamped === prevSection.current) return
    prevSection.current = clamped
    setIsTransitioning(true)
    setCurrentSectionState(clamped)
    clearTimeout(transitionTimer.current)
    transitionTimer.current = setTimeout(() => setIsTransitioning(false), 400)
  }, [])

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const progress = self.progress
        setScrollProgress(progress)
        const section = Math.min(5, Math.floor(progress * 6))
        setSection(section)
      },
    })

    return () => {
      trigger.kill()
      clearTimeout(transitionTimer.current)
    }
  }, [setSection])

  return (
    <SceneContext.Provider
      value={{ currentSection, scrollProgress, isTransitioning, setSection }}
    >
      {children}
    </SceneContext.Provider>
  )
}
