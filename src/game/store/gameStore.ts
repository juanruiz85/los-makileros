// src/game/store/gameStore.ts
// Estado principal del juego: pantalla, timer, score, combo, ticket actual

'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameMode, GameScreen, RunStats, Ticket } from '../types'
import {
  COMBO_FAST_DURATION_SEC,
  COMBO_MULT_IN_FAST,
  COMBO_THRESHOLD_FAST,
  GRINGO_3_ERRORS_TRIGGER,
  GRINGO_RESET_TIME,
  SCORE,
  START_TIME_SEC,
  STORAGE_KEYS,
  TICK_DELTA_SCALE,
  TIME_BONUS,
  TIME_PENALTY,
  TACO_IMMUNITY_DURATION_TICKETS,
} from '../constants'
import { SeededRandom } from '@/lib/random'
import { generateTicket } from '@/lib/tickets'
import { useAchievementStore } from './achievementStore'
import { useDailyChallengeStore } from './dailyChallengeStore'
import { useEventStore } from './eventStore'

interface GameStoreState {
  // Pantalla y modo
  screen: GameScreen
  mode: GameMode
  // Tiempo
  timerSec: number
  timerFrozen: boolean
  speedMult: number // boost moral multiplica
  // Puntaje
  score: number
  combo: number
  maxCombo: number
  comboModeActive: boolean
  comboModeEndsAt: number
  // Ticket actual
  currentTicket: Ticket | null
  ticketHistory: Ticket[]
  lastSetupKey: string | null
  setupChanged: boolean // si el material actual en estación NO coincide con ticket
  // Stats de la run
  runStats: RunStats
  // Errores consecutivos (triggers Gringo)
  consecutiveErrors: number
  gringoImmunityTicketsLeft: number
  // Highscore persistido
  highscore: number
  // Game over
  gameOverReason: 'time' | 'gringo-3x' | null
  // Tiempo real ahora
  lastTickAt: number
  // Turbo mode (Konami code)
  turboMode: boolean
  // Acciones
  setScreen: (s: GameScreen) => void
  start: (mode: GameMode) => void
  pause: () => void
  resume: () => void
  reset: () => void
  tick: (deltaSec: number) => void
  addTime: (sec: number) => void
  loseTime: (sec: number) => void
  addScore: (pts: number) => void
  bumpCombo: () => void
  breakCombo: () => void
  registerError: () => void
  resetConsecutiveErrors: () => void
  triggerGringo: () => void
  consumeGringoImmunity: () => void
  grantGringoImmunity: () => void
  setSpeedMult: (m: number) => void
  setTimerFrozen: (b: boolean) => void
  setTurboMode: (b: boolean) => void
  reportTicketCompleted: () => void
  loadNextTicket: () => void
  gameOver: (reason: 'time' | 'gringo-3x') => void
}

const initialRunStats: RunStats = {
  ticketsCompleted: 0,
  totalScore: 0,
  maxCombo: 0,
  timePlayedSec: 0,
  gringoEncounters: 0,
  errors: 0,
  startedAt: 0,
}

const rng = new SeededRandom()

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      screen: 'title',
      mode: 'normal',
      timerSec: START_TIME_SEC,
      timerFrozen: false,
      speedMult: 1,
      score: 0,
      combo: 0,
      maxCombo: 0,
      comboModeActive: false,
      comboModeEndsAt: 0,
      currentTicket: null,
      ticketHistory: [],
      lastSetupKey: null,
      setupChanged: false,
      runStats: { ...initialRunStats },
      consecutiveErrors: 0,
      gringoImmunityTicketsLeft: 0,
      highscore: 0,
      gameOverReason: null,
      lastTickAt: 0,
      turboMode: false,

      setScreen: (s) => set({ screen: s }),

      start: (mode) => {
        set({
          screen: 'playing',
          mode,
          timerSec: START_TIME_SEC,
          timerFrozen: false,
          speedMult: 1,
          score: 0,
          combo: 0,
          maxCombo: 0,
          comboModeActive: false,
          comboModeEndsAt: 0,
          currentTicket: generateTicket(rng, null),
          ticketHistory: [],
          lastSetupKey: null,
          setupChanged: false,
          runStats: { ...initialRunStats, startedAt: Date.now() },
          consecutiveErrors: 0,
          gringoImmunityTicketsLeft: 0,
          gameOverReason: null,
          lastTickAt: performance.now(),
        })
      },

      pause: () => {
        const s = get()
        if (s.screen === 'playing') set({ screen: 'paused' })
      },

      resume: () => {
        const s = get()
        if (s.screen === 'paused') {
          set({ screen: 'playing', lastTickAt: performance.now() })
        }
      },

      reset: () =>
        set({
          screen: 'title',
          timerSec: START_TIME_SEC,
          score: 0,
          combo: 0,
          currentTicket: null,
          runStats: { ...initialRunStats },
          consecutiveErrors: 0,
        }),

      tick: (deltaSec) => {
        const s = get()
        if (s.screen !== 'playing' || s.timerFrozen) return

        const scale = TICK_DELTA_SCALE[s.mode]
        if (scale === 0) {
          // free mode: solo stats
          set({
            runStats: {
              ...s.runStats,
              timePlayedSec: s.runStats.timePlayedSec + deltaSec,
            },
            lastTickAt: performance.now(),
          })
          return
        }

        const effectiveDelta = deltaSec * scale * (1 / s.speedMult)
        const newTimer = Math.max(0, s.timerSec - effectiveDelta)

        // Combo expiró
        let comboActive = s.comboModeActive
        let comboEnds = s.comboModeEndsAt
        const now = performance.now()
        if (comboActive && now > comboEnds) {
          comboActive = false
        }

        const newRunStats: RunStats = {
          ...s.runStats,
          timePlayedSec: s.runStats.timePlayedSec + deltaSec,
        }

        set({
          timerSec: newTimer,
          comboModeActive: comboActive,
          comboModeEndsAt: comboEnds,
          runStats: newRunStats,
          lastTickAt: now,
        })

        if (newTimer <= 0) {
          get().gameOver('time')
        }
      },

      addTime: (sec) => {
        const s = get()
        if (s.screen !== 'playing') return
        set({ timerSec: Math.min(999, s.timerSec + sec) })
      },

      loseTime: (sec) => {
        const s = get()
        if (s.screen !== 'playing') return
        const newTimer = Math.max(0, s.timerSec - sec)
        set({ timerSec: newTimer })
        if (newTimer <= 0) get().gameOver('time')
      },

      addScore: (pts) => {
        const s = get()
        if (s.screen !== 'playing') return
        const comboMult = s.comboModeActive ? COMBO_MULT_IN_FAST : 1
        const turboMult = s.turboMode ? 3 : 1
        const total = pts * comboMult * turboMult
        set({ score: Math.max(0, s.score + total) })
      },

      bumpCombo: () => {
        const s = get()
        if (s.screen !== 'playing') return
        const newCombo = s.combo + 1
        const shouldFast = newCombo > 0 && newCombo % COMBO_THRESHOLD_FAST === 0
        set({
          combo: newCombo,
          maxCombo: Math.max(s.maxCombo, newCombo),
          comboModeActive: shouldFast ? true : s.comboModeActive,
          comboModeEndsAt: shouldFast
            ? performance.now() + COMBO_FAST_DURATION_SEC * 1000
            : s.comboModeEndsAt,
        })
      },

      breakCombo: () => {
        const s = get()
        set({ combo: 0, comboModeActive: false })
      },

      registerError: () => {
        const s = get()
        const errs = s.consecutiveErrors + 1
        set({
          consecutiveErrors: errs,
          runStats: { ...s.runStats, errors: s.runStats.errors + 1 },
        })
        if (errs >= GRINGO_3_ERRORS_TRIGGER) {
          get().triggerGringo()
        }
      },

      resetConsecutiveErrors: () => set({ consecutiveErrors: 0 }),

      triggerGringo: () => {
        const s = get()
        if (s.screen !== 'playing') return
        if (s.mode === 'free') return
        // Reinicia timer a 15s
        set({
          timerSec: GRINGO_RESET_TIME,
          runStats: {
            ...s.runStats,
            gringoEncounters: s.runStats.gringoEncounters + 1,
          },
          consecutiveErrors: 0,
        })
        // Cumulative gringo encounters for achievements
        const achStore = useAchievementStore.getState()
        achStore.addCumulativeStats({ totalGringosAllTime: 1 })
        const dailyStore = useDailyChallengeStore.getState()
        achStore.checkAchievements({
          score: s.score,
          combo: s.combo,
          maxCombo: s.maxCombo,
          ticketsCompleted: s.runStats.ticketsCompleted,
          gringoEncounters: s.runStats.gringoEncounters + 1,
          errors: s.runStats.errors,
          timePlayedSec: s.runStats.timePlayedSec,
          mode: s.mode,
          perfectTickets: 0,
          splicesCompleted: 0,
          pressesCompleted: 0,
          harnessTestsPassed: 0,
          totalScoreAcrossRuns: achStore.totalScoreAcrossRuns,
          totalTicketsAllTime: achStore.totalTicketsAllTime,
          totalGringosAllTime: achStore.totalGringosAllTime + 1,
          coffeeConsumed: achStore.coffeeConsumed,
          tacosConsumed: achStore.tacosConsumed,
          dailyStreak: dailyStore.streak,
          dailyCompletedTotal: dailyStore.totalCompleted,
          clientVisits: achStore.clientVisits,
          supervisorRampages: achStore.supervisorRampages,
        })
      },

      consumeGringoImmunity: () => {
        const s = get()
        if (s.gringoImmunityTicketsLeft > 0) {
          set({ gringoImmunityTicketsLeft: s.gringoImmunityTicketsLeft - 1 })
        }
      },

      grantGringoImmunity: () =>
        set({ gringoImmunityTicketsLeft: TACO_IMMUNITY_DURATION_TICKETS }),

      setSpeedMult: (m) => set({ speedMult: m }),
      setTimerFrozen: (b) => set({ timerFrozen: b }),
      setTurboMode: (b) => set({ turboMode: b }),

      reportTicketCompleted: () => {
        const s = get()
        if (!s.currentTicket) return
        const bonus = s.currentTicket.timeBonusOnComplete
        const setupBonus = !s.setupChanged && s.lastSetupKey !== null ? SCORE.setupSaved : 0
        const timeAdd = bonus + (setupBonus ? TIME_BONUS.setupSaved : 0)
        // Variant multipliers on ticket completion
        let ticketScore = s.currentTicket.baseScore + setupBonus
        if (s.currentTicket.variant === 'client-visit') {
          ticketScore = Math.floor(ticketScore * 2)
        }
        // Special event: client visit doubles all tickets
        const eventStore = useEventStore.getState()
        if (eventStore.clientVisitActive) {
          ticketScore = Math.floor(ticketScore * 2)
        }
        const newScore = s.score + ticketScore
        // Grant taco power-up for taco-day variant
        if (s.currentTicket.variant === 'taco-day') {
          useInventoryStore.getState().grantTaco?.()
        }
        set({
          score: newScore,
          timerSec: Math.min(999, s.timerSec + timeAdd),
          runStats: {
            ...s.runStats,
            ticketsCompleted: s.runStats.ticketsCompleted + 1,
            totalScore: newScore,
          },
          ticketHistory: [...s.ticketHistory, { ...s.currentTicket, status: 'completed' }],
          consecutiveErrors: 0,
          gringoImmunityTicketsLeft:
            s.gringoImmunityTicketsLeft > 0
              ? s.gringoImmunityTicketsLeft - 1
              : 0,
        })
        // Update achievement store cumulative stats
        const achStore = useAchievementStore.getState()
        achStore.addCumulativeStats({
          totalTicketsAllTime: 1,
          totalScoreAcrossRuns: s.currentTicket.baseScore + setupBonus,
        })
        // Check if this was a daily challenge ticket
        const isDaily = s.currentTicket.id.startsWith('DAILY-')
        const dailyStore = useDailyChallengeStore.getState()
        if (isDaily) {
          dailyStore.recordAttempt(newScore)
          dailyStore.markCompleted(newScore)
        }
        // Check achievements with current stats
        achStore.checkAchievements({
          score: newScore,
          combo: s.combo,
          maxCombo: s.maxCombo,
          ticketsCompleted: s.runStats.ticketsCompleted + 1,
          gringoEncounters: s.runStats.gringoEncounters,
          errors: s.runStats.errors,
          timePlayedSec: s.runStats.timePlayedSec,
          mode: s.mode,
          perfectTickets: s.runStats.errors === 0 ? s.runStats.ticketsCompleted + 1 : 0,
          splicesCompleted: 0,
          pressesCompleted: 0,
          harnessTestsPassed: 0,
          totalScoreAcrossRuns: achStore.totalScoreAcrossRuns,
          totalTicketsAllTime: achStore.totalTicketsAllTime,
          totalGringosAllTime: achStore.totalGringosAllTime,
          coffeeConsumed: achStore.coffeeConsumed,
          tacosConsumed: achStore.tacosConsumed,
          dailyStreak: dailyStore.streak,
          dailyCompletedTotal: dailyStore.totalCompleted,
          clientVisits: achStore.clientVisits,
          supervisorRampages: achStore.supervisorRampages,
        })
        get().loadNextTicket()
      },

      loadNextTicket: () => {
        const s = get()
        const prev = s.currentTicket
        const newTicket = generateTicket(rng, prev)
        const prevKey = prev ? `${prev.cableColor}-${prev.cableGauge}-${prev.terminalA}-${prev.terminalB}` : null
        const newKey = `${newTicket.cableColor}-${newTicket.cableGauge}-${newTicket.terminalA}-${newTicket.terminalB}`
        const setupChanged = prevKey !== newKey
        set({
          currentTicket: newTicket,
          lastSetupKey: newKey,
          setupChanged,
        })
      },

      gameOver: (reason) => {
        const s = get()
        const finalScore = s.score
        const newHigh = Math.max(s.highscore, finalScore)
        set({
          screen: 'gameover',
          gameOverReason: reason,
          highscore: newHigh,
          runStats: {
            ...s.runStats,
            totalScore: finalScore,
          },
        })
      },
    }),
    {
      name: STORAGE_KEYS.run,
      partialize: (s) => ({
        screen: s.screen === 'playing' ? 'paused' : s.screen,
        mode: s.mode,
        score: s.score,
        combo: s.combo,
        maxCombo: s.maxCombo,
        currentTicket: s.currentTicket,
        ticketHistory: s.ticketHistory.slice(-5),
        lastSetupKey: s.lastSetupKey,
        setupChanged: s.setupChanged,
        runStats: s.runStats,
        highscore: s.highscore,
      }),
    }
  )
)
