import { useSectionProgress } from '../shared/ScrollManager'

const TIMELINE_ITEMS = [
  {
    period: '2023-2024',
    title: 'Cybersecurity in school',
    kicker: 'Systems, networks, and security fundamentals',
    body: 'Started by exploring cybersecurity concepts in school: networks, Linux, vulnerabilities, defensive thinking, and how real attacks are prevented.',
    tags: ['Cybersecurity', 'Networks', 'Linux'],
  },
  {
    period: '2024-2025',
    title: 'Full-stack freelancer',
    kicker: 'Turning ideas into shipped web products',
    body: 'Worked as a full-stack freelancer, building practical web apps and learning how to ship interfaces, APIs, databases, and deployments end to end.',
    tags: ['React', 'Node.js', 'APIs'],
  },
  {
    period: '2025-Present',
    title: 'ChatGPT Labs',
    kicker: 'Learning and building with frontier AI tools',
    body: 'Became part of ChatGPT Labs, exploring how advanced AI tools can improve learning, building, experimentation, and applied workflows.',
    tags: ['ChatGPT', 'AI Tools', 'Labs'],
  },
  {
    period: '2025-Present',
    title: 'Data science and applied AI',
    kicker: 'From software products to intelligent systems',
    body: 'Moved deeper into data science, machine learning, computer vision, NLP, and applied AI systems that turn raw data into decisions.',
    tags: ['Python', 'ML', 'Computer Vision'],
  },
  {
    period: '2026-2026',
    title: 'Microsoft AI product testing',
    kicker: 'Feedback loops at product scale',
    body: 'Joined a Microsoft AI product testing team, contributing structured testing feedback and sharpening product quality instincts.',
    tags: ['Microsoft', 'AI Testing', 'Product'],
  },
  {
    period: '2026-Present',
    title: 'Project Skin - Applied AI Engineer',
    kicker: 'Applied AI in a real product context',
    body: 'Currently working with Project Skin as an Applied AI Engineer intern, focused on AI-driven skin analysis and product-facing machine learning workflows.',
    tags: ['Project Skin', 'Applied AI', 'Vision'],
  },
]

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

export default function TimelineSection() {
  const progress = useSectionProgress(4)
  const syncedProgress = clamp(progress * 0.999)
  const activeIndex = Math.min(
    TIMELINE_ITEMS.length - 1,
    Math.floor(syncedProgress * TIMELINE_ITEMS.length),
  )
  const segmentProgress = clamp((syncedProgress * TIMELINE_ITEMS.length) - activeIndex)

  return (
    <div className="fixed inset-0 z-10 overflow-hidden px-5 py-9 pointer-events-none">
      <div className="timeline-backdrop" aria-hidden="true" />

      <div className="timeline-viewport-center relative z-10 flex h-full flex-col items-center justify-center gap-6 pointer-events-auto">
        <header className="timeline-header text-center">
          <div className="mb-3 font-['Space_Mono'] text-[0.62rem] uppercase tracking-[0.24em] text-cyan-300/70">
            04 / Timeline
          </div>
          <h2 className="mx-auto mb-3 max-w-[13ch] font-['Syne'] text-[clamp(1.9rem,4vw,3.25rem)] font-extrabold leading-[1.04] text-slate-50">
            From curiosity to applied AI.
          </h2>
          <p className="mx-auto max-w-2xl font-['Space_Mono'] text-[0.74rem] leading-7 text-slate-400">
            A scroll-driven path through the phases that shaped my work: cybersecurity,
            full-stack freelancing, data science, applied AI, testing, and frontier AI labs.
          </p>
        </header>

        <div className="timeline-shell">
          <div className="timeline-rail" aria-hidden="true">
            <div
              className="timeline-rail-fill"
              style={{ transform: `scaleX(${syncedProgress})` }}
            />
          </div>

          <div className="timeline-markers" aria-hidden="true">
            {TIMELINE_ITEMS.map((item, index) => (
              <div
                key={item.period}
                className={`timeline-marker ${index <= activeIndex ? 'timeline-marker-active' : ''}`}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>

          <div className="timeline-3d-stage">
            {TIMELINE_ITEMS.map((item, index) => {
              const offset = index - activeIndex
              const distance = Math.abs(offset)
              const isActive = index === activeIndex
              const nextDistance = Math.abs(index - activeIndex - 1)
              const interpolatedDistance = Math.min(distance, nextDistance + (1 - segmentProgress))

              return (
                <article
                  key={item.title}
                  className={`timeline-depth-card ${isActive ? 'timeline-depth-card-active' : ''}`}
                  style={{
                    '--accent': index % 2 === 0 ? '#00d4ff' : '#8b5cf6',
                    opacity: clamp(1 - interpolatedDistance * 0.2, 0.2, 1),
                    zIndex: TIMELINE_ITEMS.length - distance,
                    transform: `
                      translateX(calc(-50% + ${offset * 54}px))
                      translateY(${interpolatedDistance * 18}px)
                      translateZ(${isActive ? 92 : -distance * 74}px)
                      rotateY(${-offset * 12}deg)
                      rotateX(${isActive ? 0 : 4}deg)
                      scale(${isActive ? 1 : 0.89 - distance * 0.032})
                    `,
                  }}
                >
                  <div className="timeline-card-index">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="timeline-card-content text-center">
                    <div className="mb-2 font-['Space_Mono'] text-[0.58rem] uppercase tracking-[0.22em] text-[var(--accent)]">
                      {item.period}
                    </div>
                    <h3 className="mb-2 font-['Syne'] text-[clamp(1.45rem,3vw,2.15rem)] font-bold leading-tight text-slate-50">
                      {item.title}
                    </h3>
                    <div className="mb-4 font-['Space_Mono'] text-[0.66rem] uppercase tracking-[0.13em] text-slate-500">
                      {item.kicker}
                    </div>
                    <p className="mx-auto mb-5 max-w-lg font-['Space_Mono'] text-[0.72rem] leading-7 text-slate-300">
                      {item.body}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="timeline-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="timeline-card-glow" />
                </article>
              )
            })}
          </div>

          <div className="timeline-scroll-hint">
            Scroll to move through the timeline
          </div>
        </div>
      </div>
    </div>
  )
}
