// src/hooks/use-konami-code.ts
'use client'

import { useEffect, useState, useRef } from 'react'

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

interface KonamiState {
  activated: boolean
  progress: number // 0..KONAMI_SEQUENCE.length
}

export function useKonamiCode(onActivate?: () => void) {
  const [state, setState] = useState<KonamiState>({ activated: false, progress: 0 })
  const progressRef = useRef(0)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key
      // Match case-insensitive for b/a
      const expected = KONAMI_SEQUENCE[progressRef.current]
      const matches =
        key === expected || key.toLowerCase() === expected.toLowerCase()

      if (matches) {
        e.preventDefault()
        progressRef.current += 1
        setState({ activated: false, progress: progressRef.current })

        if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
        resetTimerRef.current = setTimeout(() => {
          progressRef.current = 0
          setState({ activated: false, progress: 0 })
        }, 2500)

        if (progressRef.current === KONAMI_SEQUENCE.length) {
          progressRef.current = 0
          setState({ activated: true, progress: 0 })
          onActivate?.()
          if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
        }
      } else {
        // Reset on wrong key
        progressRef.current = 0
        setState((s) => ({ ...s, progress: 0 }))
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onActivate])

  return state
}
