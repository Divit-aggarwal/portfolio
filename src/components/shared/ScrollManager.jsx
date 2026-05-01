import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SECTION_IDS = ['hero', 'about', 'projects', 'skills', 'timeline', 'transformer', 'contact']

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function getSectionProgress(sectionIndex) {
  const section = document.getElementById(SECTION_IDS[sectionIndex])
  if (!section) return 0

  const start = section.offsetTop
  const scrollSpan = Math.max(1, section.offsetHeight - window.innerHeight)
  return clamp((window.scrollY - start) / scrollSpan)
}

/**
 * Returns a 0-1 progress value for a specific section only.
 * 0 when outside the section, 0-1 while scrolling through it.
 */
export function useSectionProgress(sectionIndex) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: () => setProgress(getSectionProgress(sectionIndex)),
    })

    setProgress(getSectionProgress(sectionIndex))
    return () => trigger.kill()
  }, [sectionIndex])

  return progress
}

export default function ScrollManager() {
  useEffect(() => {
    ScrollTrigger.refresh()
    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return null
}
