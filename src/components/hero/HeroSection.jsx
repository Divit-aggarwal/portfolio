// 2D overlay for the Hero section — rendered outside <Canvas> in App.jsx
export default function HeroSection() {
  return (
    <>
      {/* Radial glow behind the neural network — sits above canvas, below UI */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(ellipse 55% 45% at 50% 48%, rgba(0,212,255,0.07) 0%, rgba(139,92,246,0.03) 50%, transparent 75%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Main overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10vh 0 6vh',
          pointerEvents: 'none',
        }}
      >
        {/* ── Name + tagline ── */}
        <div style={{ textAlign: 'center' }}>
          {/* Eyebrow label */}
          <p
            style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 'clamp(0.52rem, 1vw, 0.68rem)',
              color: '#8b5cf6',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              marginBottom: '0.8rem',
              opacity: 0.8,
            }}
          >
            AI / ML Portfolio · 2025
          </p>

          {/* Name */}
          <h1
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              fontWeight: 800,
              color: '#e2e8f0',
              letterSpacing: '-0.03em',
              margin: 0,
              lineHeight: 1.05,
              textShadow: '0 0 60px rgba(0,212,255,0.18)',
            }}
          >
            Divit Aggarwal
          </h1>

          {/* Cyan accent rule */}
          <div
            style={{
              width: '3rem',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
              margin: '1.2rem auto',
              opacity: 0.65,
            }}
          />

          {/* Tagline */}
          <p
            style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 'clamp(0.6rem, 1.3vw, 0.8rem)',
              color: '#00d4ff',
              letterSpacing: '0.13em',
              opacity: 0.85,
            }}
          >
            AI Engineer&nbsp;&nbsp;·&nbsp;&nbsp;Data Scientist&nbsp;&nbsp;·&nbsp;&nbsp;Builder of Intelligent Systems
          </p>
        </div>

        {/* ── Bottom: CTAs + scroll hint ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          {/* CTA buttons */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              pointerEvents: 'auto',
            }}
          >
            <button
              onClick={() =>
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
              }
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#000008',
                background: '#00d4ff',
                border: 'none',
                padding: '0.65rem 1.7rem',
                borderRadius: '2px',
                cursor: 'pointer',
                fontWeight: 700,
                transition: 'opacity 0.18s, transform 0.18s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.82'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              View Projects
            </button>

            <button
              onClick={() =>
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
              }
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#00d4ff',
                background: 'transparent',
                border: '1px solid rgba(0,212,255,0.4)',
                padding: '0.65rem 1.7rem',
                borderRadius: '2px',
                cursor: 'pointer',
                fontWeight: 700,
                transition: 'border-color 0.18s, transform 0.18s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00d4ff'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Explore Work
            </button>
          </div>

          {/* Scroll hint */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.3rem',
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.65rem',
              color: '#e2e8f0',
              opacity: 0.38,
              letterSpacing: '0.12em',
              animation: 'hero-bounce 2.2s ease-in-out infinite',
            }}
          >
            <span>scroll</span>
            <span style={{ fontSize: '0.9rem' }}>↓</span>
          </div>
        </div>

        <style>{`
          @keyframes hero-bounce {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(5px); }
          }
        `}</style>
      </div>
    </>
  )
}
