import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SECTION_COUNT = 6

/**
 * Returns a 0-1 progress value for a specific section only.
 * 0 when outside the section, 0-1 while scrolling through it.
 */
export function useSectionProgress(sectionIndex) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = sectionIndex / SECTION_COUNT
    const end = (sectionIndex + 1) / SECTION_COUNT

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress
        if (p < start || p >= end) {
          setProgress(0)
        } else {
          setProgress((p - start) / (end - start))
        }
      },
    })

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
