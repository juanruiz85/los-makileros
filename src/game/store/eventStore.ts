// src/game/store/eventStore.ts
// Eventos aleatorios: Supervisor, Mantenimiento, Gringo, Chisme, Calidad, Cliente, Rampage

'use client'

import { create } from 'zustand'
import type { GameEvent, EventKind } from '../types'
import {
  EVENT_DURATION_SEC,
  GRINGO_PHRASES,
  GOSSIP_PHRASES,
  SUPERVISOR_ANGRY_PHRASES,
  SUPERVISOR_WARN_PHRASES,
  CLIENT_VISIT_PHRASES,
  SUPERVISOR_RAMPAGE_PHRASES,
} from '../constants'
import { useAchievementStore } from './achievementStore'

let evSeq = 0
const nextEvId = () => `ev-${Date.now().toString(36)}-${evSeq++}`

interface EventStoreState {
  activeEvents: GameEvent[]
  gringoCooldownUntil: number
  lastGossipAt: number
  lastSupervisorWarnAt: number
  // Special events persistent during session
  supervisorRampageActive: boolean
  supervisorRampageUntil: number
  clientVisitActive: boolean
  clientVisitUntil: number
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
  spawnClientVisit: () => void
  spawnSupervisorRampage: () => void
  setSubtitle: (text: string, color: string, durationMs: number) => void
  clearExpiredSubtitles: (now: number) => void
  clearExpiredSpecialEvents: (now: number) => void
  reset: () => void
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  activeEvents: [],
  gringoCooldownUntil: 0,
  lastGossipAt: 0,
  lastSupervisorWarnAt: 0,
  supervisorRampageActive: false,
  supervisorRampageUntil: 0,
  clientVisitActive: false,
  clientVisitUntil: 0,
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

  spawnClientVisit: () => {
    const now = performance.now()
    const phrase = CLIENT_VISIT_PHRASES[Math.floor(Math.random() * CLIENT_VISIT_PHRASES.length)]
    // Client visit lasts 60s during which score is doubled on completed tickets
    set({
      clientVisitActive: true,
      clientVisitUntil: now + 60000,
    })
    get().spawnEvent('client-visit', { phrase })
    get().setSubtitle(`👀 ${phrase}`, 'text-emerald-400', 6000)
    // Track cumulative for achievements
    const achStore = useAchievementStore.getState()
    achStore.addCumulativeStats({ clientVisits: 1 })
  },

  spawnSupervisorRampage: () => {
    const now = performance.now()
    const phrase = SUPERVISOR_RAMPAGE_PHRASES[Math.floor(Math.random() * SUPERVISOR_RAMPAGE_PHRASES.length)]
    // Rampage lasts 45s during which supervisor appears every 20s
    set({
      supervisorRampageActive: true,
      supervisorRampageUntil: now + 45000,
    })
    get().spawnEvent('supervisor-rampage', { phrase })
    get().setSubtitle(`🔥 ${phrase}`, 'text-red-500', 6000)
    // Track cumulative for achievements
    const achStore = useAchievementStore.getState()
    achStore.addCumulativeStats({ supervisorRampages: 1 })
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

  clearExpiredSpecialEvents: (now) =>
    set((s) => {
      const updates: Partial<EventStoreState> = {}
      if (s.supervisorRampageActive && now > s.supervisorRampageUntil) {
        updates.supervisorRampageActive = false
      }
      if (s.clientVisitActive && now > s.clientVisitUntil) {
        updates.clientVisitActive = false
      }
      return updates
    }),

  reset: () =>
    set({
      activeEvents: [],
      gringoCooldownUntil: 0,
      lastGossipAt: 0,
      lastSupervisorWarnAt: 0,
      supervisorRampageActive: false,
      supervisorRampageUntil: 0,
      clientVisitActive: false,
      clientVisitUntil: 0,
      currentSubtitle: null,
    }),
}))
