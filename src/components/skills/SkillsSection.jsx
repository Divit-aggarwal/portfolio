import { useState, useEffect } from 'react'
import { useSelectedSkill, setSelectedSkill } from './skillsStore'

function ProficiencyBar({ value, color }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setWidth(value), 80)
    return () => clearTimeout(id)
  }, [value])

  return (
    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
      <div style={{
        width: `${width}%`,
        height: '100%',
        background: `linear-gradient(90deg, ${color}, #8b5cf6)`,
        borderRadius: 4,
        transition: 'width 1.1s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: `0 0 8px ${color}88`,
      }} />
    </div>
  )
}

function SelectedPanel({ skill }) {
  return (
    <div
      style={{
        position: 'fixed',
        right: '5vw',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        width: '280px',
        background: 'linear-gradient(180deg, rgba(5, 8, 24, 0.9), rgba(0, 0, 8, 0.82))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${skill.color}44`,
        borderRadius: '8px',
        padding: '1.75rem',
        boxShadow: `0 24px 80px rgba(0,0,0,0.42), 0 0 40px ${skill.color}18`,
        animation: 'panel-slide-in 0.35s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <style>{`
        @keyframes panel-slide-in {
          from { opacity: 0; transform: translateY(-50%) translateX(24px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>

      <button
        onClick={() => setSelectedSkill(null)}
        style={{
          position: 'absolute',
          top: '12px',
          right: '14px',
          background: 'none',
          border: 'none',
          color: 'rgba(226,232,240,0.4)',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          padding: '4px',
        }}
        aria-label="Close"
      >
        ✕
      </button>

      {/* Skill name */}
      <h3 style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: '1.4rem',
        fontWeight: 800,
        color: '#e2e8f0',
        margin: '0 0 0.25rem',
      }}>
        {skill.name}
      </h3>
      <div style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: '0.65rem',
        color: skill.color,
        letterSpacing: '0.15em',
        marginBottom: '1.25rem',
        textTransform: 'uppercase',
      }}>
        {skill.years} {skill.years === 1 ? 'year' : 'years'} experience
      </div>

      {/* Proficiency */}
      <div style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: '0.68rem',
        color: 'rgba(226,232,240,0.5)',
        marginBottom: '6px',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>Proficiency</span>
        <span style={{ color: skill.color }}>{skill.proficiency}%</span>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <ProficiencyBar value={skill.proficiency} color={skill.color} />
      </div>

      {/* Moons / sub-skills */}
      <div style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: '0.65rem',
        color: 'rgba(226,232,240,0.4)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '0.6rem',
      }}>
        Libraries &amp; Tools
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {skill.moons.map((moon) => (
          <span key={moon} style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.68rem',
            color: skill.color,
            border: `1px solid ${skill.color}44`,
            background: `${skill.color}12`,
            borderRadius: '99px',
            padding: '3px 10px',
          }}>
            {moon}
          </span>
        ))}
      </div>

      <div style={{
        marginTop: '1.25rem',
        fontFamily: 'Space Mono, monospace',
        fontSize: '0.6rem',
        color: 'rgba(226,232,240,0.25)',
        letterSpacing: '0.08em',
      }}>
        Press Esc to return to orbit view
      </div>
    </div>
  )
}

export default function SkillsSection() {
  const [selectedSkill] = useSelectedSkill()

  return (
    <>
      {/* Title overlay */}
      <div
        style={{
          position: 'fixed',
          top: '6vh',
          left: '5vw',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.65rem',
          color: '#00d4ff',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          opacity: 0.7,
          marginBottom: '0.5rem',
        }}>
          03 / Skills
        </div>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          fontWeight: 800,
          color: '#e2e8f0',
          margin: 0,
          lineHeight: 1.1,
        }}>
          Tech Universe
        </h2>
      </div>

      {/* Selected skill panel */}
      {selectedSkill && <SelectedPanel key={selectedSkill.name} skill={selectedSkill} />}
    </>
  )
}
