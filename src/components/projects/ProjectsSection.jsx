import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Code2, ExternalLink } from 'lucide-react'
import { projects } from '../../data/projects'
import { useIsMobile } from '../../hooks/useIsMobile'

function getNodeAngles(count) {
  return Array.from({ length: count }, (_, i) => -90 + (360 / count) * i)
}

function nodePos(cx, cy, radius, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

// ─── Animated signal line (SVG) ─────────────────────────────────────────────
function SignalLine({ x1, y1, x2, y2, color, active, index }) {
  const duration = 1.7 + index * 0.22
  return (
    <g>
      {/* Dim base line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={active ? 1.3 : 0.6}
        opacity={active ? 0.45 : 0.11}
        style={{ transition: 'opacity 0.4s ease, stroke-width 0.4s ease' }}
      />
      {/* Moving signal dashes */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={active ? 2.2 : 1}
        opacity={active ? 0.9 : 0.28}
        strokeDasharray="5 14"
        style={{
          animation: `proj-signal ${duration}s linear infinite`,
          transition: 'opacity 0.4s ease, stroke-width 0.4s ease',
        }}
      />
      {/* Active glow bloom */}
      {active && (
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color}
          strokeWidth={5}
          opacity={0.12}
          style={{ filter: 'blur(3px)' }}
        />
      )}
    </g>
  )
}

// ─── Central core node ───────────────────────────────────────────────────────
function CentralNode({ x, y }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        width: 90,
        height: 90,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {/* Pulsing outer rings */}
      {[28, 54, 82].map((inset, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            border: `1px solid rgba(0,212,255,${0.22 - i * 0.06})`,
            inset: -inset,
            animation: `core-ring 3s ease-out infinite ${i * 0.9}s`,
          }}
        />
      ))}

      {/* Solid core circle */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 38% 33%, rgba(0,212,255,0.26) 0%, rgba(0,0,22,0.96) 70%)',
          border: '1.5px solid rgba(0,212,255,0.55)',
          boxShadow:
            '0 0 28px rgba(0,212,255,0.32), 0 0 56px rgba(0,212,255,0.1)',
          animation: 'core-glow 3.5s ease-in-out infinite',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '8px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '0.53rem',
            fontWeight: 800,
            color: '#00d4ff',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            lineHeight: 1.25,
          }}
        >
          Divit
          <br />
          Aggarwal
        </div>
        <div
          style={{
            marginTop: '4px',
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.38rem',
            color: 'rgba(0,212,255,0.5)',
            letterSpacing: '0.07em',
            lineHeight: 1.4,
          }}
        >
          AI / ML
          <br />
          Engineer
        </div>
      </div>
    </div>
  )
}

// ─── Individual project node ─────────────────────────────────────────────────
function ProjectNode({ project, pos, cx, cy, isSelected, onHover, onHoverEnd, onClick }) {
  const [hovered, setHovered] = useState(false)
  const active = hovered || isSelected
  const nodeSize = 58

  // Tooltip direction: above or below; left or right
  const isAboveCenter = pos.y < cy
  const isRightOfCenter = pos.x > cx

  const tooltipPlacement = {
    ...(isAboveCenter ? { top: nodeSize + 10 } : { bottom: nodeSize + 10 }),
    ...(isRightOfCenter ? { right: -14 } : { left: -14 }),
    width: 210,
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 20 : 5,
      }}
    >
      {/* Node circle */}
      <motion.div
        animate={{ scale: isSelected ? 1.14 : 1 }}
        whileHover={{ scale: 1.14 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        onClick={onClick}
        onMouseEnter={() => { setHovered(true); onHover() }}
        onMouseLeave={() => { setHovered(false); onHoverEnd() }}
        style={{
          width: nodeSize,
          height: nodeSize,
          borderRadius: '50%',
          background: `radial-gradient(circle at 38% 33%, ${project.color}2a 0%, rgba(0,0,14,0.96) 70%)`,
          border: `1.5px solid ${active ? project.color + 'bb' : project.color + '40'}`,
          boxShadow: active
            ? `0 0 22px ${project.color}55, 0 0 44px ${project.color}1a`
            : `0 0 10px ${project.color}18`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
        }}
      >
        {/* Domain indicator dot */}
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: project.color,
            boxShadow: `0 0 10px ${project.color}, 0 0 20px ${project.color}60`,
            transition: 'box-shadow 0.3s ease',
          }}
        />
      </motion.div>

      {/* Node label */}
      <div
        style={{
          position: 'absolute',
          top: nodeSize + 9,
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.6rem',
          fontWeight: 400,
          color: active ? project.color : 'rgba(226,232,240,0.42)',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          textAlign: 'center',
          transition: 'color 0.35s ease',
          pointerEvents: 'none',
        }}
      >
        {project.shortTitle}
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && !isSelected && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, scale: 0.94, y: isAboveCenter ? -6 : 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: isAboveCenter ? -6 : 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              ...tooltipPlacement,
              zIndex: 60,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                background: 'rgba(0, 0, 18, 0.93)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: `1px solid ${project.color}30`,
                borderRadius: '14px',
                padding: '13px 15px',
                boxShadow: `0 12px 40px rgba(0,0,0,0.65), 0 0 24px ${project.color}10`,
              }}
            >
              <div
                style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.5rem',
                  color: project.color,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: '5px',
                  opacity: 0.85,
                }}
              >
                {project.category}
              </div>
              <div
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#e2e8f0',
                  marginBottom: '6px',
                  lineHeight: 1.2,
                }}
              >
                {project.title}
              </div>
              <div
                style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.58rem',
                  color: 'rgba(226,232,240,0.48)',
                  lineHeight: 1.75,
                  marginBottom: '10px',
                }}
              >
                {project.oneLiner}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {project.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: 'Space Mono, monospace',
                      fontSize: '0.5rem',
                      color: project.color,
                      background: `${project.color}14`,
                      border: `1px solid ${project.color}2e`,
                      borderRadius: '99px',
                      padding: '2px 9px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div
                style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.49rem',
                  color: 'rgba(226,232,240,0.22)',
                  letterSpacing: '0.08em',
                }}
              >
                click to explore →
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Right-side glassmorphism detail panel ───────────────────────────────────
function DetailPanel({ project, onClose }) {
  return (
    <motion.div
      key={project.id}
      initial={{ x: 440, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 440, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 270, damping: 32 }}
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        width: 'min(400px, 100vw)',
        zIndex: 50,
        overflowY: 'auto',
        background: 'rgba(0, 0, 14, 0.93)',
        backdropFilter: 'blur(26px)',
        WebkitBackdropFilter: 'blur(26px)',
        borderLeft: `1px solid ${project.color}22`,
        boxShadow: `-28px 0 80px rgba(0,0,0,0.75), inset 0 0 80px ${project.color}04`,
        padding: '2.5rem 2rem 3rem',
        scrollbarWidth: 'thin',
        scrollbarColor: `${project.color}28 transparent`,
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close panel"
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'rgba(226,232,240,0.07)',
          border: '1px solid rgba(226,232,240,0.14)',
          borderRadius: '8px',
          width: 32,
          height: 32,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(226,232,240,0.45)',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        <X size={14} />
      </button>

      {/* Category badge */}
      <div
        style={{
          display: 'inline-block',
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.58rem',
          color: project.color,
          border: `1px solid ${project.color}40`,
          background: `${project.color}12`,
          borderRadius: '99px',
          padding: '4px 13px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}
      >
        {project.category}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(1.25rem, 2.8vw, 1.6rem)',
          fontWeight: 800,
          color: '#e2e8f0',
          margin: '0 0 0.3rem',
          lineHeight: 1.1,
          paddingRight: '2.5rem',
        }}
      >
        {project.title}
      </h3>

      {/* Color divider */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${project.color}99 0%, transparent 100%)`,
          borderRadius: 99,
          marginBottom: '1.5rem',
          marginTop: '0.5rem',
        }}
      />

      {/* Problem */}
      <Section label="Problem" color={project.color} body={project.problem} />

      {/* Solution */}
      <Section label="Solution Approach" color={project.color} body={project.solution} />

      {/* Key Impact */}
      <div
        style={{
          background: `${project.color}0b`,
          border: `1px solid ${project.color}1e`,
          borderRadius: 12,
          padding: '1rem 1.1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.56rem',
            color: project.color,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            opacity: 0.85,
          }}
        >
          Key Impact
        </div>
        <p
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.68rem',
            color: 'rgba(226,232,240,0.75)',
            lineHeight: 1.85,
            margin: 0,
          }}
        >
          {project.outcome}
        </p>
      </div>

      {/* Tech stack */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.56rem',
            color: 'rgba(226,232,240,0.32)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: '0.6rem',
          }}
        >
          Tech Stack
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {project.tags.map(tag => (
            <span
              key={tag}
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.6rem',
                color: project.color,
                background: `${project.color}12`,
                border: `1px solid ${project.color}2e`,
                borderRadius: 99,
                padding: '4px 12px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <a
          href={project.github}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.66rem',
            color: '#00d4ff',
            border: '1px solid rgba(0,212,255,0.38)',
            borderRadius: 10,
            padding: '11px 0',
            textDecoration: 'none',
            background: 'rgba(0,212,255,0.07)',
            cursor: 'pointer',
            transition: 'background 0.2s, border-color 0.2s',
          }}
        >
          <Code2 size={13} />
          GitHub
        </a>
        <a
          href={project.demo}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.66rem',
            color: project.color,
            border: `1px solid ${project.color}40`,
            borderRadius: 10,
            padding: '11px 0',
            textDecoration: 'none',
            background: `${project.color}0b`,
            cursor: 'pointer',
            transition: 'background 0.2s, border-color 0.2s',
          }}
        >
          <ExternalLink size={13} />
          Case Study
        </a>
      </div>
    </motion.div>
  )
}

function Section({ label, color, body }) {
  return (
    <div style={{ marginBottom: '1.3rem' }}>
      <div
        style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.56rem',
          color,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
          opacity: 0.85,
        }}
      >
        {label}
      </div>
      <p
        style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.68rem',
          color: 'rgba(226,232,240,0.6)',
          lineHeight: 1.85,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  )
}

// ─── Mobile card list ────────────────────────────────────────────────────────
function MobileCards() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        padding: '5rem 1.2rem 3rem',
        zIndex: 15,
        pointerEvents: 'auto',
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.58rem',
            color: '#00d4ff',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '0.4rem',
            opacity: 0.7,
          }}
        >
          02 / Projects
        </div>
        <h2
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#e2e8f0',
            margin: '0 0 0.4rem',
            lineHeight: 1.1,
          }}
        >
          Selected Work
        </h2>
        <p
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.62rem',
            color: 'rgba(226,232,240,0.3)',
            margin: 0,
            lineHeight: 1.7,
          }}
        >
          Systems I've built across AI, data, and full-stack engineering.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: 'easeOut' }}
            style={{
              background: 'rgba(0, 0, 18, 0.78)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: `1px solid ${p.color}22`,
              borderLeft: `3px solid ${p.color}`,
              borderRadius: '12px',
              padding: '1.1rem 1rem',
              boxShadow: `0 4px 24px rgba(0,0,0,0.45), 0 0 12px ${p.color}0a`,
            }}
          >
            <div
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.54rem',
                color: p.color,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
                opacity: 0.9,
              }}
            >
              {p.category}
            </div>
            <div
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: '0.4rem',
                lineHeight: 1.2,
              }}
            >
              {p.title}
            </div>
            <div
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.6rem',
                color: 'rgba(226,232,240,0.48)',
                lineHeight: 1.75,
                marginBottom: '0.75rem',
              }}
            >
              {p.oneLiner}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '0.8rem' }}>
              {p.tags.slice(0, 4).map(tag => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '0.52rem',
                    color: p.color,
                    background: `${p.color}14`,
                    border: `1px solid ${p.color}28`,
                    borderRadius: 99,
                    padding: '2px 8px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={p.github}
                style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.6rem',
                  color: '#00d4ff',
                  textDecoration: 'none',
                  border: '1px solid rgba(0,212,255,0.32)',
                  borderRadius: '7px',
                  padding: '5px 12px',
                  background: 'rgba(0,212,255,0.07)',
                }}
              >
                GitHub →
              </a>
              <a
                href={p.demo}
                style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.6rem',
                  color: p.color,
                  textDecoration: 'none',
                  border: `1px solid ${p.color}32`,
                  borderRadius: '7px',
                  padding: '5px 12px',
                  background: `${p.color}0b`,
                }}
              >
                Case Study ↗
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Desktop constellation canvas ────────────────────────────────────────────
function Constellation({ selected, onSelect }) {
  const containerRef = useRef()
  const [dims, setDims] = useState({ w: 1200, h: 700 })
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setDims({ w: el.offsetWidth, h: el.offsetHeight })
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setDims({ w: width, h: height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const cx = dims.w / 2
  const cy = dims.h / 2
  const radius = Math.min(dims.w * 0.33, dims.h * 0.37, 265)

  const angles = getNodeAngles(projects.length)
  const positions = projects.map((_, i) => nodePos(cx, cy, radius, angles[i]))

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {/* CSS keyframes */}
      <style>{`
        @keyframes proj-signal {
          from { stroke-dashoffset: 19; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes core-ring {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(1.4); opacity: 0;   }
        }
        @keyframes core-glow {
          0%, 100% { box-shadow: 0 0 28px rgba(0,212,255,0.30), 0 0 56px rgba(0,212,255,0.10); }
          50%       { box-shadow: 0 0 40px rgba(0,212,255,0.50), 0 0 80px rgba(0,212,255,0.18); }
        }
      `}</style>

      {/* SVG line layer — below nodes */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {projects.map((p, i) => {
          const pos = positions[i]
          const active = selected?.id === p.id || hoveredId === p.id
          return (
            <SignalLine
              key={p.id}
              x1={cx} y1={cy}
              x2={pos.x} y2={pos.y}
              color={p.color}
              active={active}
              index={i}
            />
          )
        })}
      </svg>

      {/* Central core */}
      <CentralNode x={cx} y={cy} />

      {/* Project nodes */}
      {projects.map((p, i) => (
        <ProjectNode
          key={p.id}
          project={p}
          pos={positions[i]}
          cx={cx}
          cy={cy}
          isSelected={selected?.id === p.id}
          onHover={() => setHoveredId(p.id)}
          onHoverEnd={() => setHoveredId(null)}
          onClick={() => onSelect(selected?.id === p.id ? null : p)}
        />
      ))}
    </div>
  )
}

// ─── Root export ─────────────────────────────────────────────────────────────
export default function ProjectsSection() {
  const [selected, setSelected] = useState(null)
  const isMobile = useIsMobile()

  // Escape key closes panel
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (isMobile) return <MobileCards />

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
      {/* Section header */}
      <div
        style={{
          position: 'absolute',
          top: '6vh',
          left: '5vw',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.63rem',
            color: '#00d4ff',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: '0.45rem',
          }}
        >
          02 / Projects
        </div>
        <h2
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            color: '#e2e8f0',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Selected Work
        </h2>
        <p
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.66rem',
            color: 'rgba(226,232,240,0.28)',
            margin: '0.5rem 0 0',
            letterSpacing: '0.04em',
            maxWidth: '28ch',
            lineHeight: 1.6,
          }}
        >
          Systems I've built across AI,
          <br />
          data, and full-stack engineering.
        </p>
      </div>

      {/* Constellation */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
        <Constellation selected={selected} onSelect={setSelected} />
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selected && (
          <DetailPanel
            key={selected.id}
            project={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
