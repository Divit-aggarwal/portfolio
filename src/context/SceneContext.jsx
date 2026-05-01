import { createContext, useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const SceneContext = createContext(null)

const SECTION_IDS = ['hero', 'about', 'projects', 'skills', 'timeline', 'transformer', 'contact']

function getCurrentSectionFromScroll() {
  const viewportAnchor = window.scrollY + window.innerHeight * 0.42
  let active = 0

  SECTION_IDS.forEach((id, index) => {
    const section = document.getElementById(id)
    if (!section) return
    if (viewportAnchor >= section.offsetTop) active = index
  })

  return Math.min(SECTION_IDS.length - 1, active)
}

export function SceneProvider({ children }) {
  const [currentSection, setCurrentSectionState] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimer = useRef(null)
  const prevSection = useRef(0)

  const setSection = useCallback((index) => {
    const clamped = Math.max(0, Math.min(6, index))
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
        setSection(getCurrentSectionFromScroll())
      },
    })

    setSection(getCurrentSectionFromScroll())
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
