# AI/ML 3D Portfolio — Project Context

## What this is
A single-page 3D portfolio website for an aspiring Data Scientist and AI/ML Engineer.
Built with React + Vite + React Three Fiber. All 3D geometry is PROCEDURALLY GENERATED
— no external .glb/.gltf model files. All visual effects use custom GLSL ShaderMaterial.

## Tech Stack
- React 18 + Vite 5 (JavaScript, not TypeScript)
- @react-three/fiber (React Three Fiber)
- @react-three/drei (Three.js helpers)
- @react-three/postprocessing (bloom, glow)
- three (Three.js core)
- gsap + @gsap/react (scroll animations)
- leva (debug controls, dev only)
- tailwindcss (2D UI overlays)
- howler (ambient audio)

## Architecture Rules
- Single persistent Canvas across all scroll sections
- Scroll drives a global scrollProgress float (0–1) via GSAP ScrollTrigger
- SceneContext provides: currentSection, scrollProgress, isTransitioning
- Each section is a React component that reads from SceneContext
- Mobile: useIsMobile() hook reduces particle counts by 60%, disables bloom
- Use InstancedMesh for any repeated geometry
- Postprocessing: UnrealBloom strength 0.8, radius 0.4

## Sections (in order)
0. Hero      — Living Neural Network Brain (pulsing forward-pass animation)
1. About     — Data Universe (3D galaxy scatter plot, t-SNE clusters)
2. Projects  — Holographic Pod Corridor (5 project cards, scroll-through)
3. Skills    — Solar System (tech skills as orbiting planets)
4. Transformer — Attention Mechanism Visualizer (token attention beams)
5. Contact   — Neural Signal Handshake (form triggers forward-pass animation)

## Color Palette
- Background: #000008 (near-black deep space)
- Primary accent: #00d4ff (electric cyan)
- Secondary: #8b5cf6 (vivid purple)
- Tertiary: #f59e0b (amber gold)
- Success: #10b981 (emerald)
- Text: #e2e8f0 (off-white)

## Performance Targets
- 60fps on mid-range laptop
- Lazy-load each section component
- InstancedMesh for repeated geometry
- Mobile: simplified particle counts

## File Structure
src/
  components/
    hero/         HeroSection.jsx + NeuralNetwork.jsx
    about/        AboutSection.jsx + DataGalaxy.jsx
    projects/     ProjectsSection.jsx + HoloPod.jsx
    skills/       SkillsSection.jsx + SolarSystem.jsx
    transformer/  TransformerSection.jsx + AttentionViz.jsx
    contact/      ContactSection.jsx + NeuralForm.jsx
    shared/       SceneCanvas.jsx, ScrollManager.jsx, Navigation.jsx
  context/        SceneContext.jsx
  hooks/          useScene.js, useIsMobile.js, useScrollProgress.js
  shaders/        holoPod.glsl, neuralPulse.glsl, particleGlow.glsl
  data/           projects.js, skills.js
  App.jsx
  main.jsx
  index.css

## DO NOTs
- Do NOT use external .glb/.gltf files
- Do NOT use TypeScript (plain JS only)
- Do NOT use next.js or any SSR framework
- Do NOT use styled-components (Tailwind only for 2D)
- Do NOT install packages not listed above without noting it
