import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useIsMobile } from '../../hooks/useIsMobile'
import ActiveSection from './ActiveSection'

export default function SceneCanvas() {
  const isMobile = useIsMobile()

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        gl={{ antialias: true }}
        shadows
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ pointerEvents: 'auto' }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00d4ff" />

        <Suspense fallback={null}>
          <ActiveSection />
        </Suspense>

        <Stars
          radius={100}
          depth={50}
          count={isMobile ? 1200 : 3000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />

        {!isMobile && (
          <EffectComposer>
            <Bloom
              luminanceThreshold={0}
              luminanceSmoothing={0.9}
              height={300}
              intensity={1.1}
              radius={0.45}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
