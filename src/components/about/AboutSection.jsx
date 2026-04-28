const META_CHIPS = [
  { label: 'AI/ML Engineer',      color: '#00d4ff' },
  { label: 'Computer Vision',     color: '#8b5cf6' },
  { label: 'Data Engineering',    color: '#f59e0b' },
  { label: 'Intelligent Systems', color: '#10b981' },
]

const STATS = [
  { label: '12 Projects',    color: '#00d4ff' },
  { label: '80+ Papers Read', color: '#8b5cf6' },
  { label: '∞ Coffees',      color: '#f59e0b' },
]

export default function AboutSection() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
        padding: '0 5vw',
      }}
    >
      {/* Animated gradient border wrapper */}
      <div
        className="about-card-border"
        style={{ maxWidth: '358px', width: '100%', pointerEvents: 'auto' }}
      >
        {/* Inner frosted card */}
        <div className="about-card-inner">
          {/* Scanline sweep */}
          <div className="about-scanline" />
          {/* Glimmer sweep */}
          <div className="about-glimmer" />

          {/* Content — above decorative layers */}
          <div style={{ padding: '1.75rem 1.75rem 1.5rem', position: 'relative', zIndex: 3 }}>

            {/* Live indicator + section tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div className="about-live-dot" />
              <span
                style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.58rem',
                  color: '#00d4ff',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  opacity: 0.85,
                }}
              >
                01 / About
              </span>
            </div>

            {/* Title */}
            <h2
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(1.55rem, 3vw, 2rem)',
                fontWeight: 800,
                color: '#e2e8f0',
                margin: '0 0 0.95rem',
                lineHeight: 1.1,
                letterSpacing: '-0.015em',
              }}
            >
              About Me
            </h2>

            {/* Metadata chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1.2rem' }}>
              {META_CHIPS.map(({ label, color }) => (
                <span
                  key={label}
                  className="about-meta-chip"
                  style={{
                    color,
                    border: `1px solid ${color}3f`,
                    background: `${color}0d`,
                  }}
                >
                  <span
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: color,
                      flexShrink: 0,
                      boxShadow: `0 0 5px ${color}`,
                    }}
                  />
                  {label}
                </span>
              ))}
            </div>

            {/* Gradient rule */}
            <div
              style={{
                height: '1px',
                background:
                  'linear-gradient(90deg, rgba(0,212,255,0.35) 0%, rgba(139,92,246,0.25) 55%, transparent 100%)',
                marginBottom: '1.1rem',
              }}
            />

            {/* Bio */}
            <p
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.72rem',
                color: 'rgba(226, 232, 240, 0.76)',
                lineHeight: 1.95,
                margin: '0 0 1.4rem',
              }}
            >
              <span style={{ color: '#e2e8f0', fontWeight: 700 }}>I build systems that learn.</span>
              <br /><br />
              I'm focused on turning raw data into intelligent decisions — from neural architectures to
              production ML pipelines.
              <br /><br />
              Currently exploring LLMs, computer vision, and the mathematics of intelligence. I care
              about models that generalize, code that ships, and research that matters.
            </p>

            {/* Stat chips */}
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {STATS.map(({ label, color }, i) => (
                <span
                  key={label}
                  className="about-stat-chip"
                  style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '0.61rem',
                    color,
                    border: `1px solid ${color}55`,
                    borderRadius: '99px',
                    padding: '3px 11px',
                    background: `${color}10`,
                    animationDelay: `${i * 0.93}s`,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Pointer hint */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.63rem',
                color: 'rgba(226, 232, 240, 0.38)',
                letterSpacing: '0.06em',
              }}
            >
              <span>My skills visualized</span>
              <span className="about-arrow" style={{ color: '#00d4ff', opacity: 0.75 }}>→</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
