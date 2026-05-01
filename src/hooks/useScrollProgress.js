import { useState, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

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

export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress
        setScrollProgress(p)
        setCurrentSection(getCurrentSectionFromScroll())
      },
    })

    return () => trigger.kill()
  }, [])

  return { scrollProgress, currentSection }
}
