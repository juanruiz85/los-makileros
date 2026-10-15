// src/hooks/use-keyboard-shortcuts.ts
'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/game/store/gameStore'
import { useStationStore } from '@/game/store/stationStore'
import type { StationKind } from '@/game/types'

const STATION_KEYS: Record<string, StationKind> = {
  '1': 'cut',
  '2': 'splice',
  '3': 'press',
  '4': 'harness',
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      // Skip if user is typing in an input
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      const screen = useGameStore.getState().screen

      // Station shortcuts (1-4) — only during playing
      if (screen === 'playing' && STATION_KEYS[e.key]) {
        e.preventDefault()
        const station = STATION_KEYS[e.key]
        useStationStore.getState().setActive(station)
        return
      }

      // Pause toggle with P
      if (e.key === 'p' || e.key === 'P') {
        if (screen === 'playing') {
          e.preventDefault()
          useGameStore.getState().pause()
        } else if (screen === 'paused') {
          e.preventDefault()
          useGameStore.getState().resume()
        }
      }

      // Escape goes back to title from howto/paused
      if (e.key === 'Escape') {
        if (screen === 'howto') {
          useGameStore.getState().setScreen('title')
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
