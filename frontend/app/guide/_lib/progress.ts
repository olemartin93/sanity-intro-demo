import {useSyncExternalStore} from 'react'

/**
 * Guide progress, stored in the learner's browser (localStorage) as a list of completed lesson slugs.
 *
 * `useSyncExternalStore` is React's recommended way to read an external store. The server snapshot
 * is always "nothing completed", so server and client render the same HTML and React swaps in the
 * stored progress right after hydration, without a hydration mismatch.
 */

const STORAGE_KEY = 'sanity-guide-progress'
const EMPTY: readonly string[] = []

const listeners = new Set<() => void>()
// In-memory copy, so progress still works for the session if localStorage is unavailable
let progress: readonly string[] | null = null

function load(): readonly string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : EMPTY
  } catch {
    return EMPTY
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

function setProgress(next: readonly string[]) {
  progress = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage can be blocked (private windows, disabled site data). Keep the in-memory copy.
  }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Keep several open tabs in sync
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      progress = load()
      emit()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot() {
  progress ??= load()
  return progress
}

function getServerSnapshot() {
  return EMPTY
}

export function markComplete(slug: string) {
  const current = getSnapshot()
  if (!current.includes(slug)) setProgress([...current, slug])
}

export function markIncomplete(slug: string) {
  setProgress(getSnapshot().filter((s) => s !== slug))
}

export function resetProgress() {
  setProgress(EMPTY)
}

export function useCompletedLessons() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
