import { useState } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import AttentionViz from './AttentionViz'

const TOKEN_INFO = {
  Data:    'Cleaning · Annotation · Feature Design',
  Vision:  'YOLO · U-Net · Segmentation',
  Models:  'Training · Evaluation · Optimization',
  Systems: 'APIs · Pipelines · Deployment',
  Product: 'UX · Metrics · Real-world Impact',
}

export default function TransformerSection() {
  const [activeToken, setActiveToken] = useState('Models')
  const isMobile = useIsMobile()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <style>{`
        @keyframes tf-fade-up {
          from { opacity: 0; transform: translateY(7px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        padding: isMobile ? '7vh 6vw 4vh' : '0 5vw',
        gap: isMobile ? '3vh' : '4vw',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{
          flex: isMobile ? 'none' : '0 0 37%',
          width: isMobile ? '100%' : undefined,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '0.6rem' : '1.1rem',
        }}>

          {/* Section label */}
          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.6rem',
            color: '#00d4ff',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: 0.7,
          }}>
            05 / TRANSFORMER
          </div>

          {/* Heading */}
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: isMobile ? 'clamp(1.8rem, 6vw, 2.2rem)' : 'clamp(2rem, 3.2vw, 2.8rem)',
            fontWeight: 800,
            color: '#e2e8f0',
            margin: 0,
            lineHeight: 1.1,
          }}>
            How I Think
          </h2>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: isMobile ? '0.62rem' : '0.72rem',
            color: 'rgba(139,92,246,0.85)',
            lineHeight: 1.75,
            margin: 0,
          }}>
            I connect signals across data, models,<br />
            systems, and users — then decide<br />
            what deserves attention.
          </p>

          {!isMobile && (
            <>
              {/* Description */}
              <p style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.67rem',
                color: 'rgba(226,232,240,0.42)',
                lineHeight: 1.85,
                margin: 0,
              }}>
                Self-attention lets each token decide which other tokens
                matter most. My work follows the same pattern — connect
                raw signals, technical systems, and product context
                before making decisions.
              </p>

              {/* Insight panel — animates on token change */}
              <div
                key={activeToken}
                style={{
                  padding: '0.9rem 1.1rem',
                  background: 'rgba(0,6,24,0.75)',
                  border: '1px solid rgba(139,92,246,0.28)',
                  borderLeft: '2px solid rgba(139,92,246,0.75)',
                  borderRadius: '4px',
                  backdropFilter: 'blur(10px)',
                  animation: 'tf-fade-up 0.28s ease',
                }}
              >
                <div style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.57rem',
                  color: 'rgba(139,92,246,0.9)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: '0.45rem',
                }}>
                  {activeToken}
                </div>
                <div style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.7rem',
                  color: '#e2e8f0',
                  lineHeight: 1.55,
                }}>
                  {TOKEN_INFO[activeToken]}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
                {/* Beam thickness */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                    <div style={{ width: '18px', height: '2px', background: '#00d4ff', opacity: 0.3, borderRadius: '1px' }} />
                    <div style={{ width: '18px', height: '4px', background: '#00d4ff', opacity: 0.85, borderRadius: '1px' }} />
                  </div>
                  <span style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '0.57rem',
                    color: 'rgba(226,232,240,0.35)',
                    letterSpacing: '0.03em',
                  }}>
                    Beam thickness = attention strength
                  </span>
                </div>

                {/* Color legend */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {[
                    { color: '#8b5cf6', label: 'Active query' },
                    { color: '#00d4ff', label: 'Context' },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '8px', height: '8px', background: color, borderRadius: '2px', opacity: 0.85 }} />
                      <span style={{
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '0.56rem',
                        color: 'rgba(226,232,240,0.35)',
                      }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{
          flex: isMobile ? 'none' : '1',
          width: isMobile ? '100%' : undefined,
          pointerEvents: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <AttentionViz
            activeToken={activeToken}
            onTokenChange={setActiveToken}
            isMobile={isMobile}
          />
        </div>
      </div>

      {/* Mobile: hover hint */}
      {isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '4vh',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.58rem',
          color: 'rgba(226,232,240,0.28)',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          Tap a node to explore
        </div>
      )}

      {/* Desktop: hover hint */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.6rem',
          color: 'rgba(226,232,240,0.22)',
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          animation: 'tf-pulse 3.5s ease-in-out infinite',
        }}>
          Hover a node to shift attention
          <style>{`
            @keyframes tf-pulse {
              0%, 100% { opacity: 0.22; }
              50% { opacity: 0.48; }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
