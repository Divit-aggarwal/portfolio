import { useState, useEffect } from 'react'
import { useSectionProgress } from '../shared/ScrollManager'
import { projects } from '../../data/projects'

export default function ProjectsSection() {
  const sectionProgress = useSectionProgress(2)
  const activeIndex = Math.min(4, Math.round(sectionProgress * 4))
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    if (sectionProgress > 0.08) setShowHint(false)
  }, [sectionProgress])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '6vh 5vw',
        pointerEvents: 'none',
      }}
    >
      {/* Top bar */}
      <div>
        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.65rem',
          color: '#00d4ff',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          opacity: 0.7,
          marginBottom: '0.5rem',
        }}>
          02 / Projects
        </div>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          fontWeight: 800,
          color: '#e2e8f0',
          margin: 0,
          lineHeight: 1.1,
        }}>
          Selected Work
        </h2>
      </div>

      {/* Bottom: pod counter + scroll hint */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {/* Pod counter */}
        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.75rem',
          color: '#e2e8f0',
          letterSpacing: '0.12em',
          opacity: 0.6,
        }}>
          <span style={{ color: '#00d4ff', fontSize: '1.1rem', fontWeight: 700 }}>
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <span style={{ margin: '0 4px' }}>/</span>
          <span style={{ opacity: 0.4 }}>0{projects.length}</span>
          <div style={{ marginTop: '6px', fontSize: '0.65rem', opacity: 0.5 }}>
            {projects[activeIndex].title}
          </div>
        </div>

        {/* Scroll hint */}
        {showHint && (
          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.7rem',
            color: '#e2e8f0',
            opacity: 0.4,
            letterSpacing: '0.08em',
            animation: 'proj-pulse 1.8s ease-in-out infinite',
          }}>
            scroll to explore →
            <style>{`
              @keyframes proj-pulse {
                0%, 100% { opacity: 0.4; transform: translateX(0); }
                50% { opacity: 0.7; transform: translateX(5px); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}
