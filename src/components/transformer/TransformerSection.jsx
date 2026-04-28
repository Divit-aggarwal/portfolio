export default function TransformerSection() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {/* Top-left title block */}
      <div
        style={{
          position: 'absolute',
          top: '7vh',
          left: '5vw',
          maxWidth: '300px',
        }}
      >
        <div
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.6rem',
            color: '#00d4ff',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: '0.65rem',
          }}
        >
          04 / Transformer
        </div>
        <h2
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: 800,
            color: '#e2e8f0',
            margin: '0 0 0.6rem',
            lineHeight: 1.1,
          }}
        >
          Self-Attention
        </h2>
        <p
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.72rem',
            color: 'rgba(139,92,246,0.85)',
            lineHeight: 1.7,
            margin: 0,
            letterSpacing: '0.02em',
          }}
        >
          Each token asks —<br />
          <em>"who should I listen to?"</em>
        </p>
      </div>

      {/* Bottom-left legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '7vh',
          left: '5vw',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {/* Beam thickness legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '28px',
              height: '4px',
              background: 'linear-gradient(90deg, #001a3e, #00d4ff)',
              borderRadius: '2px',
              opacity: 0.9,
            }} />
            <div style={{
              width: '28px',
              height: '8px',
              background: 'linear-gradient(90deg, #003a6e, #00d4ff)',
              borderRadius: '2px',
            }} />
          </div>
          <span
            style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.62rem',
              color: 'rgba(226,232,240,0.55)',
              letterSpacing: '0.06em',
            }}
          >
            Beam thickness = attention weight
          </span>
        </div>

        {/* Row labels legend */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px',
              background: '#00d4ff',
              borderRadius: '2px',
              opacity: 0.8,
            }} />
            <span style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.6rem',
              color: '#00d4ff',
              opacity: 0.7,
            }}>Query</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px',
              background: '#8b5cf6',
              borderRadius: '2px',
              opacity: 0.8,
            }} />
            <span style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.6rem',
              color: '#8b5cf6',
              opacity: 0.7,
            }}>Key</span>
          </div>
        </div>
      </div>

      {/* Bottom-center hover hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '7vh',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.65rem',
          color: 'rgba(226,232,240,0.35)',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
          animation: 'tf-pulse 3s ease-in-out infinite',
        }}
      >
        Hover a token to see its attention pattern
        <style>{`
          @keyframes tf-pulse {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 0.65; }
          }
        `}</style>
      </div>
    </div>
  )
}
