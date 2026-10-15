// src/game/store/achievementStore.ts
// Sistema de logros: detecta y desbloquea achievements basados en stats

'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../constants'

export interface Achievement {
  id: string
  label: string
  description: string
  emoji: string
  unlockedAt?: number
}

export interface AchievementDef {
  id: string
  label: string
  description: string
  emoji: string
  check: (stats: AchievementCheckStats) => boolean
}

export interface AchievementCheckStats {
  score: number
  combo: number
  maxCombo: number
  ticketsCompleted: number
  gringoEncounters: number
  errors: number
  timePlayedSec: number
  mode: 'normal' | 'chaos' | 'free'
  perfectTickets: number // tickets without errors
  splicesCompleted: number
  pressesCompleted: number
  harnessTestsPassed: number
  totalScoreAcrossRuns: number
  totalTicketsAllTime: number
  totalGringosAllTime: number
  coffeeConsumed: number
  tacosConsumed: number
  dailyStreak: number
  dailyCompletedTotal: number
  clientVisits: number
  supervisorRampages: number
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // Tier 1: Primeros pasos
  {
    id: 'first-blood',
    label: 'Primer corte',
    description: 'Completa tu primer corte exitoso',
    emoji: '✂️',
    check: (s) => s.ticketsCompleted >= 1,
  },
  {
    id: 'combo-3',
    label: 'Combo x3',
    description: 'Alcanza un combo de 3',
    emoji: '🔥',
    check: (s) => s.maxCombo >= 3,
  },
  {
    id: 'combo-10',
    label: 'Combo x10',
    description: 'Alcanza un combo de 10',
    emoji: '⚡',
    check: (s) => s.maxCombo >= 10,
  },
  // Tier 2: Operador experimentado
  {
    id: 'tickets-10',
    label: '10 tickets',
    description: 'Completa 10 tickets en una sesión',
    emoji: '🎫',
    check: (s) => s.ticketsCompleted >= 10,
  },
  {
    id: 'tickets-25',
    label: '25 tickets',
    description: 'Completa 25 tickets en una sesión',
    emoji: '📦',
    check: (s) => s.ticketsCompleted >= 25,
  },
  {
    id: 'score-1000',
    label: '1K puntos',
    description: 'Alcanza 1,000 puntos',
    emoji: '💰',
    check: (s) => s.score >= 1000,
  },
  {
    id: 'score-5000',
    label: '5K puntos',
    description: 'Alcanza 5,000 puntos',
    emoji: '💎',
    check: (s) => s.score >= 5000,
  },
  // Tier 3: Power-ups
  {
    id: 'coffee-first',
    label: 'Cafecito ☕',
    description: 'Consume tu primer café',
    emoji: '☕',
    check: (s) => s.coffeeConsumed >= 1,
  },
  {
    id: 'taco-first',
    label: 'Taco de canasta',
    description: 'Consume tu primer taco',
    emoji: '🌮',
    check: (s) => s.tacosConsumed >= 1,
  },
  {
    id: 'coffee-master',
    label: 'Café addict',
    description: 'Consume 10 cafés en total',
    emoji: '☕☕',
    check: (s) => s.coffeeConsumed >= 10,
  },
  // Tier 4: El Gringo
  {
    id: 'survived-gringo',
    label: 'Sobreviviste al Gringo',
    description: 'Encuentra al Gringo por primera vez',
    emoji: '🤬',
    check: (s) => s.gringoEncounters >= 1,
  },
  {
    id: 'gringo-survivor',
    label: 'Veterano del Gringo',
    description: 'Sobrevive a 5 encuentros del Gringo (acumulativo)',
    emoji: '🛡️',
    check: (s) => s.totalGringosAllTime >= 5,
  },
  // Tier 5: Estaciones
  {
    id: 'splice-master',
    label: 'Splice master',
    description: 'Completa 5 splices en total (acumulativo)',
    emoji: '🔌',
    check: (s) => s.splicesCompleted >= 5,
  },
  {
    id: 'press-pro',
    label: 'Prensa pro',
    description: 'Completa 5 prensas en total (acumulativo)',
    emoji: '🔧',
    check: (s) => s.pressesCompleted >= 5,
  },
  {
    id: 'harness-hero',
    label: 'Harness hero',
    description: 'Pasa 3 pruebas eléctricas (acumulativo)',
    emoji: '⚡',
    check: (s) => s.harnessTestsPassed >= 3,
  },
  // Tier 6: Perfeccionista
  {
    id: 'perfect-3',
    label: 'Perfeccionista',
    description: '3 tickets sin errores consecutivos',
    emoji: '⭐',
    check: (s) => s.perfectTickets >= 3,
  },
  // Tier 7: Acumulativos totales
  {
    id: 'total-tickets-50',
    label: '50 tickets totales',
    description: 'Completa 50 tickets acumulados entre sesiones',
    emoji: '🏭',
    check: (s) => s.totalTicketsAllTime >= 50,
  },
  {
    id: 'total-score-10000',
    label: '10K puntos acumulados',
    description: 'Suma 10,000 puntos en total entre todas tus sesiones',
    emoji: '🏆',
    check: (s) => s.totalScoreAcrossRuns >= 10000,
  },
  // Tier 8: Modo Caótico
  {
    id: 'chaos-survivor',
    label: 'Survivor Caótico',
    description: 'Completa 5 tickets en modo Caótico',
    emoji: '💀',
    check: (s) => s.mode === 'chaos' && s.ticketsCompleted >= 5,
  },
  // Tier 9: Daily Challenge
  {
    id: 'daily-first',
    label: 'Primer Daily',
    description: 'Completa tu primer Daily Challenge',
    emoji: '📅',
    check: (s) => s.dailyCompletedTotal >= 1,
  },
  {
    id: 'daily-streak-3',
    label: 'Racha de 3 días',
    description: 'Mantén una racha de 3 días consecutivos',
    emoji: '🔥',
    check: (s) => s.dailyStreak >= 3,
  },
  {
    id: 'daily-streak-7',
    label: 'Racha semanal',
    description: 'Mantén una racha de 7 días consecutivos',
    emoji: '⚡',
    check: (s) => s.dailyStreak >= 7,
  },
  {
    id: 'daily-master-10',
    label: 'Daily Master',
    description: 'Completa 10 Daily Challenges en total',
    emoji: '🏆',
    check: (s) => s.dailyCompletedTotal >= 10,
  },
  // Tier 10: Special events
  {
    id: 'client-visit-first',
    label: 'Cliente satisfecho',
    description: 'Completa un ticket durante una visita del cliente',
    emoji: '👀',
    check: (s) => s.clientVisits >= 1,
  },
  {
    id: 'client-visit-5',
    label: 'Cliente VIP',
    description: 'Sobrevive a 5 visitas del cliente (acumulativo)',
    emoji: '🤝',
    check: (s) => s.clientVisits >= 5,
  },
  {
    id: 'rampage-survivor',
    label: 'Survivor del rampage',
    description: 'Sobrevive a 3 días del supervisor enojado (acumulativo)',
    emoji: '😤',
    check: (s) => s.supervisorRampages >= 3,
  },
]

interface AchievementStoreState {
  unlocked: Record<string, number> // id -> unlockedAt timestamp
  // Cumulative stats (persisted across runs)
  totalTicketsAllTime: number
  totalScoreAcrossRuns: number
  totalGringosAllTime: number
  coffeeConsumed: number
  tacosConsumed: number
  splicesCompleted: number
  pressesCompleted: number
  harnessTestsPassed: number
  clientVisits: number
  supervisorRampages: number
  // Live tracking for current run
  consecutiveErrors: number
  perfectTickets: number
  // Actions
  checkAchievements: (stats: AchievementCheckStats) => string[]
  addCumulativeStats: (delta: Partial<Pick<AchievementStoreState, 'totalTicketsAllTime' | 'totalScoreAcrossRuns' | 'totalGringosAllTime' | 'coffeeConsumed' | 'tacosConsumed' | 'splicesCompleted' | 'pressesCompleted' | 'harnessTestsPassed' | 'clientVisits' | 'supervisorRampages'>>) => void
  reset: () => void
}

export const useAchievementStore = create<AchievementStoreState>()(
  persist(
    (set, get) => ({
      unlocked: {},
      totalTicketsAllTime: 0,
      totalScoreAcrossRuns: 0,
      totalGringosAllTime: 0,
      coffeeConsumed: 0,
      tacosConsumed: 0,
      splicesCompleted: 0,
      pressesCompleted: 0,
      harnessTestsPassed: 0,
      clientVisits: 0,
      supervisorRampages: 0,
      consecutiveErrors: 0,
      perfectTickets: 0,

      checkAchievements: (stats) => {
        const state = get()
        const newlyUnlocked: string[] = []
        for (const def of ACHIEVEMENT_DEFS) {
          if (state.unlocked[def.id]) continue
          if (def.check(stats)) {
            newlyUnlocked.push(def.id)
          }
        }
        if (newlyUnlocked.length > 0) {
          const now = Date.now()
          const newUnlocked = { ...state.unlocked }
          for (const id of newlyUnlocked) {
            newUnlocked[id] = now
          }
          set({ unlocked: newUnlocked })
        }
        return newlyUnlocked
      },

      addCumulativeStats: (delta) =>
        set((s) => ({
          totalTicketsAllTime: s.totalTicketsAllTime + (delta.totalTicketsAllTime ?? 0),
          totalScoreAcrossRuns: s.totalScoreAcrossRuns + (delta.totalScoreAcrossRuns ?? 0),
          totalGringosAllTime: s.totalGringosAllTime + (delta.totalGringosAllTime ?? 0),
          coffeeConsumed: s.coffeeConsumed + (delta.coffeeConsumed ?? 0),
          tacosConsumed: s.tacosConsumed + (delta.tacosConsumed ?? 0),
          splicesCompleted: s.splicesCompleted + (delta.splicesCompleted ?? 0),
          pressesCompleted: s.pressesCompleted + (delta.pressesCompleted ?? 0),
          harnessTestsPassed: s.harnessTestsPassed + (delta.harnessTestsPassed ?? 0),
        })),

      reset: () => set({ consecutiveErrors: 0, perfectTickets: 0 }),
    }),
    {
      name: STORAGE_KEYS.stats,
      partialize: (s) => ({
        unlocked: s.unlocked,
        totalTicketsAllTime: s.totalTicketsAllTime,
        totalScoreAcrossRuns: s.totalScoreAcrossRuns,
        totalGringosAllTime: s.totalGringosAllTime,
        coffeeConsumed: s.coffeeConsumed,
        tacosConsumed: s.tacosConsumed,
        splicesCompleted: s.splicesCompleted,
        pressesCompleted: s.pressesCompleted,
        harnessTestsPassed: s.harnessTestsPassed,
        clientVisits: s.clientVisits,
        supervisorRampages: s.supervisorRampages,
      }),
    }
  )
)
