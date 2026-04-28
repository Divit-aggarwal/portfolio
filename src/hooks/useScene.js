import { useContext } from 'react'
import { SceneContext } from '../context/SceneContext'

export function useScene() {
  const ctx = useContext(SceneContext)
  if (!ctx) throw new Error('useScene must be used inside SceneProvider')
  return ctx
}
