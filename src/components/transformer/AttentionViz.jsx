import { Fragment, useMemo } from 'react'

const TOKENS = ['Data', 'Vision', 'Models', 'Systems', 'Product']
const CX = 200
const CY = 205
const R = 138

function getPos(i) {
  const angle = (-90 + i * 72) * (Math.PI / 180)
  return {
    x: +(CX + R * Math.cos(angle)).toFixed(2),
    y: +(CY + R * Math.sin(angle)).toFixed(2),
  }
}

const CONNECTIONS = [
  { from: 0, to: 2, weight: 0.70 }, // Data → Models
  { from: 1, to: 2, weight: 0.85 }, // Vision → Models
  { from: 2, to: 3, weight: 0.90 }, // Models → Systems
  { from: 2, to: 4, weight: 0.70 }, // Models → Product
  { from: 3, to: 4, weight: 0.80 }, // Systems → Product
  { from: 4, to: 0, weight: 0.60 }, // Product → Data
  { from: 0, to: 1, weight: 0.50 }, // Data → Vision
]

// Full 5×5 attention matrix [from][to]
const ATTN = [
  [0.15, 0.50, 0.70, 0.05, 0.08], // Data
  [0.05, 0.10, 0.85, 0.05, 0.08], // Vision
  [0.05, 0.05, 0.15, 0.90, 0.70], // Models
  [0.05, 0.05, 0.08, 0.15, 0.80], // Systems
  [0.60, 0.05, 0.08, 0.05, 0.12], // Product
]

function beamPath(fromIdx, toIdx) {
  const p1 = getPos(fromIdx)
  const p2 = getPos(toIdx)
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const len = Math.hypot(dx, dy)
  const nx = dx / len
  const ny = dy / len
  const off = 46
  const sx = +(p1.x + nx * off).toFixed(1)
  const sy = +(p1.y + ny * off).toFixed(1)
  const ex = +(p2.x - nx * off).toFixed(1)
  const ey = +(p2.y - ny * off).toFixed(1)
  const mx = (sx + ex) / 2
  const my = (sy + ey) / 2
  const cpx = +(mx + (CX - mx) * 0.38).toFixed(1)
  const cpy = +(my + (CY - my) * 0.38).toFixed(1)
  return `M ${sx} ${sy} Q ${cpx} ${cpy} ${ex} ${ey}`
}

export default function AttentionViz({ activeToken, onTokenChange, isMobile }) {
  const ai = TOKENS.indexOf(activeToken)

  const paths = useMemo(() => CONNECTIONS.map(c => beamPath(c.from, c.to)), [])

  function opacity(c) {
    if (ai < 0) return 0.35
    return (c.from === ai || c.to === ai) ? 1.0 : 0.06
  }

  function strokeW(c) {
    const base = 1.2 + c.weight * 4.5
    if (ai < 0) return base * 0.55
    return (c.from === ai || c.to === ai) ? base : base * 0.2
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
      <svg
        viewBox="0 0 400 410"
        style={{ width: '100%', maxWidth: isMobile ? '300px' : '420px', height: 'auto', overflow: 'visible' }}
        aria-label="Self-attention visualization"
      >
        <defs>
          {/* Cyan glow */}
          <filter id="tf-c" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Purple glow */}
          <filter id="tf-p" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Center radial gradient */}
          <radialGradient id="tf-cg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Orbit ring */}
        <circle cx={CX} cy={CY} r={R + 18}
          fill="none" stroke="rgba(0,212,255,0.07)" strokeWidth="1" strokeDasharray="3 7" />

        {/* Center glow + core dot */}
        <circle cx={CX} cy={CY} r={44} fill="url(#tf-cg)" />
        <circle cx={CX} cy={CY} r={4} fill="#8b5cf6" opacity="0.55" />

        {/* Beam glow layer */}
        {CONNECTIONS.map((c, i) => (
          <path key={`bg${i}`}
            d={paths[i]}
            stroke="#00d4ff"
            strokeWidth={strokeW(c) + 6}
            fill="none"
            opacity={opacity(c) * 0.1}
            style={{ transition: 'opacity 0.45s ease', filter: 'blur(2px)' }}
          />
        ))}

        {/* Beam main layer */}
        {CONNECTIONS.map((c, i) => (
          <path key={`bm${i}`}
            d={paths[i]}
            stroke="#00d4ff"
            strokeWidth={strokeW(c)}
            fill="none"
            opacity={opacity(c)}
            strokeLinecap="round"
            style={{ transition: 'opacity 0.45s ease, stroke-width 0.45s ease' }}
          />
        ))}

        {/* Signal pulses on active outgoing beams */}
        {CONNECTIONS.map((c, i) => c.from !== ai ? null : (
          <circle key={`sp${i}`} r="3.5" fill="#00d4ff" opacity="0.92" filter="url(#tf-c)">
            <animateMotion
              dur={`${1.4 + (1 - c.weight) * 0.9}s`}
              repeatCount="indefinite"
              path={paths[i]}
            />
          </circle>
        ))}

        {/* Token nodes */}
        {TOKENS.map((tok, i) => {
          const { x, y } = getPos(i)
          const active = i === ai
          return (
            <g key={tok} style={{ cursor: 'pointer' }}>
              {/* Invisible hit area */}
              <rect
                x={x - 52} y={y - 27} width={104} height={54}
                fill="rgba(0,0,0,0.001)"
                onClick={() => onTokenChange(tok)}
                onMouseEnter={() => onTokenChange(tok)}
              />

              {/* Breathing halo on active */}
              {active && (
                <ellipse cx={x} cy={y} rx={56} ry={27}
                  fill="#8b5cf6" opacity="0" filter="url(#tf-p)">
                  <animate attributeName="opacity"
                    values="0.06;0.22;0.06" dur="2.8s" repeatCount="indefinite" />
                </ellipse>
              )}

              {/* Card body */}
              <rect
                x={x - 43} y={y - 18} width={86} height={36} rx={7}
                fill={active ? 'rgba(40,0,72,0.94)' : 'rgba(0,8,28,0.88)'}
                stroke={active ? '#8b5cf6' : 'rgba(0,212,255,0.3)'}
                strokeWidth={active ? 1.5 : 1}
                style={{ transition: 'fill 0.3s ease, stroke 0.3s ease' }}
              />

              {/* Token label */}
              <text
                x={x} y={y + 6}
                textAnchor="middle"
                fill={active ? '#c4b5fd' : '#67e8f9'}
                fontSize={active ? 13 : 12}
                fontFamily="'Space Mono', monospace"
                letterSpacing="1.5"
                fontWeight={active ? '700' : '400'}
                filter={active ? 'url(#tf-p)' : undefined}
                style={{ transition: 'fill 0.3s ease', userSelect: 'none', pointerEvents: 'none' }}
              >
                {tok.toUpperCase()}
              </text>

              {/* Active indicator */}
              {active && (
                <circle cx={x} cy={y + 23} r={2.5} fill="#8b5cf6" opacity="0.85" />
              )}
            </g>
          )
        })}
      </svg>

      {/* Attention heatmap — desktop only */}
      {!isMobile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignSelf: 'center' }}>
          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.52rem',
            color: 'rgba(226,232,240,0.25)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: '0.1rem',
          }}>
            Attention Matrix
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '28px repeat(5, 30px)',
            gridTemplateRows: '18px repeat(5, 28px)',
            gap: '3px',
          }}>
            {/* Corner cell */}
            <div />

            {/* Column headers */}
            {TOKENS.map((t, ci) => (
              <div key={t} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.46rem',
                color: ci === ai ? 'rgba(139,92,246,0.75)' : 'rgba(0,212,255,0.36)',
                transition: 'color 0.3s ease',
              }}>
                {t.slice(0, 2).toUpperCase()}
              </div>
            ))}

            {/* Data rows */}
            {TOKENS.map((_, ri) => (
              <Fragment key={ri}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.46rem',
                  color: ri === ai ? 'rgba(139,92,246,0.75)' : 'rgba(0,212,255,0.36)',
                  transition: 'color 0.3s ease',
                }}>
                  {TOKENS[ri].slice(0, 2).toUpperCase()}
                </div>
                {ATTN[ri].map((w, ci) => (
                  <div key={ci} style={{
                    borderRadius: '3px',
                    background: `rgba(0,212,255,${0.04 + w * 0.84})`,
                    border: (ri === ai || ci === ai)
                      ? '1px solid rgba(139,92,246,0.45)'
                      : '1px solid rgba(0,212,255,0.05)',
                    boxShadow: (ri === ai && ci === ai) ? '0 0 7px rgba(0,212,255,0.35)' : 'none',
                    transition: 'all 0.35s ease',
                  }} />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
