import { useScene } from '../../hooks/useScene'

const SECTIONS = ['Hero', 'About', 'Projects', 'Skills', 'Timeline', 'Transformer', 'Contact']

function scrollToSection(index) {
  const section = document.getElementById(SECTIONS[index].toLowerCase())
  section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Navigation() {
  const { currentSection } = useScene()

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
      {SECTIONS.map((name, i) => (
        <button
          key={name}
          onClick={() => scrollToSection(i)}
          className="group relative flex items-center justify-end gap-3 border-0 bg-transparent p-0"
          aria-label={`Go to ${name}`}
        >
          {/* Tooltip label */}
          <span
            className="
              absolute right-6 whitespace-nowrap text-xs font-mono
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              pointer-events-none pr-1
            "
            style={{ color: 'var(--color-text)' }}
          >
            {name}
          </span>

          {/* Dot */}
          <span
            className="block rounded-full transition-all duration-300"
            style={{
              width: currentSection === i ? 10 : 6,
              height: currentSection === i ? 10 : 6,
              backgroundColor:
                currentSection === i ? 'var(--color-primary)' : 'rgba(226,232,240,0.3)',
              boxShadow:
                currentSection === i
                  ? '0 0 8px 2px var(--color-primary)'
                  : 'none',
            }}
          />
        </button>
      ))}
    </nav>
  )
}
