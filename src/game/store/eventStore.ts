// src/game/store/eventStore.ts
// Eventos aleatorios: Supervisor, Mantenimiento, Gringo, Chisme, Calidad

'use client'

import { create } from 'zustand'
import type { GameEvent, EventKind } from '../types'
import {
  EVENT_DURATION_SEC,
  GRINGO_PHRASES,
  GOSSIP_PHRASES,
  SUPERVISOR_ANGRY_PHRASES,
  SUPERVISOR_WARN_PHRASES,
} from '../constants'

let evSeq = 0
const nextEvId = () => `ev-${Date.now().toString(36)}-${evSeq++}`

interface EventStoreState {
  activeEvents: GameEvent[]
  gringoCooldownUntil: number
  lastGossipAt: number
  lastSupervisorWarnAt: number
  // frases activas para mostrar subtítulos
  currentSubtitle: { text: string; color?: string; until: number } | null
  // Acciones
  spawnEvent: (kind: EventKind, payload?: Record<string, unknown>) => void
  resolveEvent: (id: string) => void
  spawnGringo: () => void
  spawnSupervisorWarn: () => void
  spawnSupervisorAngry: () => void
  spawnGossip: () => void
  spawnMaintenance: () => void
  spawnQualityAudit: () => void
  setSubtitle: (text: string, color: string, durationMs: number) => void
  clearExpiredSubtitles: (now: number) => void
  reset: () => void
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  activeEvents: [],
  gringoCooldownUntil: 0,
  lastGossipAt: 0,
  lastSupervisorWarnAt: 0,
  currentSubtitle: null,

  spawnEvent: (kind, payload) =>
    set((s) => ({
      activeEvents: [
        ...s.activeEvents,
        {
          id: nextEvId(),
          kind,
          startedAt: performance.now(),
          duration: EVENT_DURATION_SEC[kind],
          resolved: false,
          payload,
        },
      ],
    })),

  resolveEvent: (id) =>
    set((s) => ({
      activeEvents: s.activeEvents.map((e) =>
        e.id === id ? { ...e, resolved: true } : e
      ),
    })),

  spawnGringo: () => {
    const now = performance.now()
    const phrase = GRINGO_PHRASES[Math.floor(Math.random() * GRINGO_PHRASES.length)]
    set({ gringoCooldownUntil: now + 90000 })
    get().spawnEvent('gringo', { phrase })
    get().setSubtitle(phrase, 'text-red-500', 5000)
  },

  spawnSupervisorWarn: () => {
    const phrase = SUPERVISOR_WARN_PHRASES[Math.floor(Math.random() * SUPERVISOR_WARN_PHRASES.length)]
    set({ lastSupervisorWarnAt: performance.now() })
    get().spawnEvent('supervisor-warn', { phrase })
    get().setSubtitle(phrase, 'text-amber-500', 4000)
  },

  spawnSupervisorAngry: () => {
    const phrase = SUPERVISOR_ANGRY_PHRASES[Math.floor(Math.random() * SUPERVISOR_ANGRY_PHRASES.length)]
    get().spawnEvent('supervisor-angry', { phrase })
    get().setSubtitle(phrase, 'text-red-600', 4000)
  },

  spawnGossip: () => {
    const phrase = GOSSIP_PHRASES[Math.floor(Math.random() * GOSSIP_PHRASES.length)]
    set({ lastGossipAt: performance.now() })
    get().spawnEvent('gossip', { phrase })
    get().setSubtitle(`💭 ${phrase}`, 'text-purple-500', 6000)
  },

  spawnMaintenance: () => {
    get().spawnEvent('maintenance', {})
  },

  spawnQualityAudit: () => {
    get().spawnEvent('quality-audit', {})
  },

  setSubtitle: (text, color, durationMs) =>
    set({ currentSubtitle: { text, color, until: performance.now() + durationMs } }),

  clearExpiredSubtitles: (now) =>
    set((s) => {
      if (s.currentSubtitle && now > s.currentSubtitle.until) {
        return { currentSubtitle: null }
      }
      return {}
    }),

  reset: () =>
    set({
      activeEvents: [],
      gringoCooldownUntil: 0,
      lastGossipAt: 0,
      lastSupervisorWarnAt: 0,
      currentSubtitle: null,
    }),
}))
