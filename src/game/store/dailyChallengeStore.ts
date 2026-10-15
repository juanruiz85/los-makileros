// src/game/store/dailyChallengeStore.ts
// Sistema de Daily Challenge: un ticket especial por día con bonus y achievement

'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SeededRandom } from '@/lib/random'
import { STORAGE_KEYS } from '../constants'
import type { CableColor, CableGauge, TerminalType, Ticket } from '../types'

export interface DailyChallenge {
  date: string // YYYY-MM-DD
  partNumber: string
  circuitCount: number
  cableColor: CableColor
  cableGauge: CableGauge
  length_mm: number
  terminalA: TerminalType
  terminalB: TerminalType
  needsSplice: boolean
  needsHarness: boolean
  baseScore: number
  timeBonusOnComplete: number
  bonusMultiplier: number // x2 or x3 for daily
  story: string // flavor text
  attempts: number // # of tries today
  bestScore: number // best score on this challenge
  completed: boolean
  completedAt?: number
}

interface DailyChallengeStoreState {
  current: DailyChallenge | null
  lastPlayedDate: string | null
  streak: number // consecutive days played
  totalCompleted: number
  // Actions
  getTodayChallenge: () => DailyChallenge
  recordAttempt: (score: number) => void
  markCompleted: (score: number) => void
  reset: () => void
}

// Story templates for flavor
const DAILY_STORIES = [
  'El cliente VIP necesita este lote para mañana temprano. ¡No falles!',
  'Visita sorpresa del auditor. Quiere ver este ticket perfecto.',
  'Última orden del turno. ¡Cierra con broche de oro!',
  'El Gringo personally va a revisar este. Ponte las pilas.',
  'Orden especial para el cliente nuevo. ¡Deméstrate!',
  'Reposición urgente de stock. ¡El cliente espera!',
  'Ticket prioritario: el supervisor lo quiere YA.',
  'Lote para el envío de las 6am. ¡No se puede retrasar!',
]

const PART_NUMBERS_DAILY = [
  'VIP-001', 'VIP-002', 'VIP-003', 'URG-001', 'URG-002', 'SPC-001', 'SPC-002',
  'FIN-001', 'FIN-002', 'BOSS-001', 'CLIENT-001',
]

const CABLE_COLORS: CableColor[] = ['red', 'black', 'yellow', 'green', 'white']
const CABLE_GAUGES: CableGauge[] = [18, 20, 22]
const TERMINAL_TYPES_DAILY: TerminalType[] = ['FASTON-250', 'FASTON-110', 'RING-#8']

// Deterministic daily seed from date string
function dateToSeed(dateStr: string): number {
  let h = 0
  for (let i = 0; i < dateStr.length; i++) {
    h = (h * 31 + dateStr.charCodeAt(i)) >>> 0
  }
  return h
}

function getTodayDateString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function generateDailyChallenge(dateStr: string): DailyChallenge {
  const seed = dateToSeed(dateStr)
  const rng = new SeededRandom(seed)
  const partNumber = rng.pick(PART_NUMBERS_DAILY)
  const color = rng.pick(CABLE_COLORS)
  const gauge = rng.pick(CABLE_GAUGES)
  const length_mm = rng.int(150, 450)
  const hasTerminals = rng.chance(0.9)
  const terminalA: TerminalType = hasTerminals ? rng.pick(TERMINAL_TYPES_DAILY) : 'NONE'
  const terminalB: TerminalType = hasTerminals
    ? (rng.chance(0.5) ? rng.pick(TERMINAL_TYPES_DAILY) : terminalA)
    : 'NONE'
  const circuitCount = rng.int(6, 20)
  const needsSplice = rng.chance(0.4)
  const needsHarness = rng.chance(0.7)
  const complexity = circuitCount * 8 + (needsSplice ? 40 : 0) + (needsHarness ? 60 : 0)
  const baseScore = 200 + complexity
  const timeBonusOnComplete = 15
  const bonusMultiplier = rng.chance(0.3) ? 3 : 2
  const story = rng.pick(DAILY_STORIES)
  return {
    date: dateStr,
    partNumber,
    circuitCount,
    cableColor: color,
    cableGauge: gauge,
    length_mm,
    terminalA,
    terminalB,
    needsSplice,
    needsHarness,
    baseScore,
    timeBonusOnComplete,
    bonusMultiplier,
    story,
    attempts: 0,
    bestScore: 0,
    completed: false,
  }
}

// Convert DailyChallenge to a regular Ticket (for game store)
export function dailyChallengeToTicket(dc: DailyChallenge): Ticket {
  return {
    id: `DAILY-${dc.date}`,
    partNumber: dc.partNumber,
    circuitCount: dc.circuitCount,
    cableColor: dc.cableColor,
    cableGauge: dc.cableGauge,
    length_mm: dc.length_mm,
    terminalA: dc.terminalA,
    terminalB: dc.terminalB,
    needsSplice: dc.needsSplice,
    needsHarness: dc.needsHarness,
    baseScore: dc.baseScore * dc.bonusMultiplier,
    timeBonusOnComplete: dc.timeBonusOnComplete,
    sameSetupAsPrevious: false,
    status: 'active',
    variant: 'client-visit', // reuse variant for the badge
    variantLabel: `📅 DAILY x${dc.bonusMultiplier}`,
  }
}

export const useDailyChallengeStore = create<DailyChallengeStoreState>()(
  persist(
    (set, get) => ({
      current: null,
      lastPlayedDate: null,
      streak: 0,
      totalCompleted: 0,

      getTodayChallenge: () => {
        const today = getTodayDateString()
        const state = get()
        if (state.current && state.current.date === today) {
          return state.current
        }
        // New day - generate new challenge
        const newChallenge = generateDailyChallenge(today)
        // Streak calculation: if lastPlayedDate is yesterday, streak +1; else reset to 1
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
        const newStreak = state.lastPlayedDate === yStr ? state.streak + 1 : 1
        set({
          current: newChallenge,
          lastPlayedDate: today,
          streak: newStreak,
        })
        return newChallenge
      },

      recordAttempt: (score) => {
        const state = get()
        if (!state.current) return
        const newBest = Math.max(state.current.bestScore, score)
        set({
          current: {
            ...state.current,
            attempts: state.current.attempts + 1,
            bestScore: newBest,
          },
        })
      },

      markCompleted: (score) => {
        const state = get()
        if (!state.current) return
        if (state.current.completed) return // already done
        set({
          current: {
            ...state.current,
            attempts: state.current.attempts + 1,
            bestScore: Math.max(state.current.bestScore, score),
            completed: true,
            completedAt: Date.now(),
          },
          totalCompleted: state.totalCompleted + 1,
        })
      },

      reset: () => set({ current: null, lastPlayedDate: null, streak: 0, totalCompleted: 0 }),
    }),
    {
      name: STORAGE_KEYS.stats + ':daily',
      partialize: (s) => ({
        current: s.current,
        lastPlayedDate: s.lastPlayedDate,
        streak: s.streak,
        totalCompleted: s.totalCompleted,
      }),
    }
  )
)
