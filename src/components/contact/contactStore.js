import { useState, useEffect } from 'react'

let _passId = 0
let _errorId = 0
const _listeners = new Set()

function emit() {
  const snap = { passId: _passId, errorId: _errorId }
  _listeners.forEach((fn) => fn(snap))
}

export function fireForwardPass() {
  _passId++
  emit()
}

export function fireError() {
  _errorId++
  emit()
}

export function useContactStore() {
  const [state, setState] = useState({ passId: _passId, errorId: _errorId })
  useEffect(() => {
    _listeners.add(setState)
    return () => _listeners.delete(setState)
  }, [])
  return state
}
