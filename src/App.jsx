import './index.css'
import { useState } from 'react'
import { SceneProvider } from './context/SceneContext'
import { useScene } from './hooks/useScene'
import ScrollManager from './components/shared/ScrollManager'
import Navigation from './components/shared/Navigation'
import SceneCanvas from './components/shared/SceneCanvas'
import LoadingScreen from './components/shared/LoadingScreen'
import HeroSection from './components/hero/HeroSection'
import AboutSection from './components/about/AboutSection'
import ProjectsSection from './components/projects/ProjectsSection'
import SkillsSection from './components/skills/SkillsSection'
import TransformerSection from './components/transformer/TransformerSection'
import NeuralForm from './components/contact/NeuralForm'

const SECTION_IDS = ['hero', 'about', 'projects', 'skills', 'transformer', 'contact']

function SectionOverlays() {
  const { currentSection } = useScene()
  if (currentSection === 0) return <HeroSection />
  if (currentSection === 1) return <AboutSection />
  if (currentSection === 2) return <ProjectsSection />
  if (currentSection === 3) return <SkillsSection />
  if (currentSection === 4) return <TransformerSection />
  if (currentSection === 5) return <NeuralForm />
  return null
}

export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <SceneProvider>
      {/* Loading screen — auto-hides after 2.5s */}
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      {/* Fixed Three.js canvas — behind everything, z-index 0 */}
      <SceneCanvas />

      {/* Invisible scroll ticker */}
      <ScrollManager />

      {/* Fixed right-side dot navigation */}
      <Navigation />

      {/* Section-specific 2D overlays */}
      <SectionOverlays />

      {/* Transparent 600vh scroll container — 3D canvas shows through */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          pointerEvents: 'auto',
          background: 'transparent',
        }}
      >
        {SECTION_IDS.map((id) => (
          <section
            key={id}
            id={id}
            style={{ height: '100vh', background: 'transparent' }}
          />
        ))}
      </div>
    </SceneProvider>
  )
}
