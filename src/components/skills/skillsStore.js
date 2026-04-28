// Minimal reactive store — bridges R3F Canvas events to HTML overlay
import { useState, useEffect } from 'react'

let _selected = null
const _listeners = new Set()

export function setSelectedSkill(skill) {
  _selected = skill
  _listeners.forEach((fn) => fn(skill))
}

export function useSelectedSkill() {
  const [selected, setSelected] = useState(_selected)
  useEffect(() => {
    _listeners.add(setSelected)
    return () => _listeners.delete(setSelected)
  }, [])
  return [selected, setSelectedSkill]
}
