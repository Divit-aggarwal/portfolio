import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function LoadingScreen({ onComplete }) {
  const overlayRef = useRef()
  const pathRef = useRef()
  const dotRef = useRef()
  const [text, setText] = useState('Initializing neural systems...')
  const [alive, setAlive] = useState(true)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    const length = path.getTotalLength()
    path.style.strokeDasharray = length
    path.style.strokeDashoffset = length

    const tl = gsap.timeline()

    // Draw the curve
    tl.to(path, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })

    // Swap text mid-way
    tl.call(() => setText('Training complete.'), null, 1.3)

    // Reveal trailing dot
    tl.to(dotRef.current, { opacity: 1, duration: 0.2 }, 1.5)

    // Fade overlay out
    tl.to(overlayRef.current, { opacity: 0, duration: 0.45, ease: 'power2.in' }, 2.1)

    // Remove from DOM
    tl.call(() => { setAlive(false); onComplete?.() }, null, 2.55)

    return () => tl.kill()
  }, [onComplete])

  if (!alive) return null

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#000008',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.75rem',
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* Axis labels */}
        <span style={{
          position: 'absolute', top: '50%', left: -28,
          transform: 'translateY(-50%) rotate(-90deg)',
          fontFamily: "'Space Mono', monospace", fontSize: '0.52rem',
          color: 'rgba(0,212,255,0.35)', letterSpacing: '0.1em', whiteSpace: 'nowrap',
        }}>loss</span>
        <span style={{
          position: 'absolute', bottom: -18, right: 0,
          fontFamily: "'Space Mono', monospace", fontSize: '0.52rem',
          color: 'rgba(0,212,255,0.35)', letterSpacing: '0.08em',
        }}>epoch →</span>

        <svg width="280" height="140" viewBox="0 0 280 140" aria-hidden="true">
          {/* Subtle grid */}
          {[35, 60, 85, 110].map((y) => (
            <line key={y} x1="25" y1={y} x2="265" y2={y}
              stroke="rgba(0,212,255,0.05)" strokeWidth="1" />
          ))}
          {/* Axes */}
          <line x1="25" y1="10" x2="25" y2="125" stroke="rgba(0,212,255,0.22)" strokeWidth="1" />
          <line x1="25" y1="125" x2="265" y2="125" stroke="rgba(0,212,255,0.22)" strokeWidth="1" />
          {/* Ghost path — shows where curve will go */}
          <path
            d="M 30,18 C 42,18 58,82 95,98 C 132,114 175,118 262,120"
            stroke="rgba(0,212,255,0.08)" strokeWidth="2.5"
            fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
          {/* Animated loss curve */}
          <path
            ref={pathRef}
            d="M 30,18 C 42,18 58,82 95,98 C 132,114 175,118 262,120"
            stroke="#00d4ff" strokeWidth="2.5"
            fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
          {/* Trailing dot */}
          <circle ref={dotRef} cx="262" cy="120" r="4" fill="#00d4ff"
            style={{ filter: 'drop-shadow(0 0 5px #00d4ff)', opacity: 0 }}
          />
        </svg>
      </div>

      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.75rem',
        color: '#00d4ff',
        letterSpacing: '0.1em',
        opacity: 0.8,
        margin: 0,
        minHeight: '1.2em',
      }}>
        {text}
        <span style={{ animation: 'ls-blink 1s step-end infinite' }}>_</span>
      </p>

      <style>{`
        @keyframes ls-blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  )
}
