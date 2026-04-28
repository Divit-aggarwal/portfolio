import NeuralNetwork from './NeuralNetwork'

// Dedicated lights for the hero neural network — only active during section 0
export default function HeroScene() {
  return (
    <>
      <pointLight position={[0, 0, 4]}  intensity={1.8} color="#00d4ff" distance={9} decay={2} />
      <pointLight position={[0, 0, -4]} intensity={1.2} color="#8b5cf6" distance={9} decay={2} />
      <NeuralNetwork />
    </>
  )
}
