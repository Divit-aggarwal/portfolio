import { useSyncExternalStore } from 'react'

let selected = null
const listeners = new Set()
const notify = () => listeners.forEach(fn => fn())

export const setSelectedProject = (p) => { selected = p; notify() }
export const useSelectedProject = () =>
  useSyncExternalStore(
    cb => { listeners.add(cb); return () => listeners.delete(cb) },
    () => selected,
  )
