'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Trophy,
  Medal,
  Crown,
  X,
  Send,
  Loader2,
  RefreshCw,
  Award,
} from 'lucide-react'
import { useGameStore } from '@/game/store/gameStore'
import { useEventStore } from '@/game/store/eventStore'
import { audio } from '@/lib/audio'

interface ScoreEntry {
  id: string
  initials: string
  score: number
  tickets: number
  maxCombo: number
  mode: string
  durationSec: number
  gringoEncounters: number
  createdAt: string
}

interface SubmitResult {
  ok: boolean
  id?: string
  rank?: number
  error?: string
}

interface LeaderboardModalProps {
  open: boolean
  onOpenChange: (b: boolean) => void
  // Optional: score to submit on open (from GameOverScreen)
  pendingSubmit?: {
    score: number
    tickets: number
    maxCombo: number
    mode: 'normal' | 'chaos' | 'free'
    durationSec: number
    gringoEncounters: number
  } | null
  onSubmitted?: () => void
}

export function LeaderboardModal({
  open,
  onOpenChange,
  pendingSubmit,
  onSubmitted,
}: LeaderboardModalProps) {
  const [initials, setInitials] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null)
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [filterMode, setFilterMode] = useState<'normal' | 'chaos' | 'free'>('normal')
  const [error, setError] = useState<string | null>(null)
  const highscore = useGameStore((s) => s.highscore)

  // Set filter mode from pendingSubmit
  useEffect(() => {
    if (pendingSubmit) {
      setFilterMode(pendingSubmit.mode)
      setInitials(loadSavedInitials())
      setSubmitResult(null)
    }
  }, [pendingSubmit])

  // Fetch scores when open or filterMode changes
  const fetchScores = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`api/scores?mode=${filterMode}&limit=10`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setScores(data.scores ?? [])
    } catch (e) {
      console.warn('API not available, falling back to local scores')
      // Fallback to localStorage when API is not available (GitHub Pages)
      const localScores = loadLocalScores(filterMode)
      setScores(localScores)
    } finally {
      setLoading(false)
    }
  }, [filterMode])

  useEffect(() => {
    if (open) fetchScores()
  }, [open, fetchScores])

  const handleSubmit = async () => {
    if (!pendingSubmit) return
    if (initials.length !== 3) return
    setSubmitting(true)
    setError(null)
    saveInitials(initials.toUpperCase())
    try {
      const res = await fetch('api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initials: initials.toUpperCase(),
          score: pendingSubmit.score,
          tickets: pendingSubmit.tickets,
          maxCombo: pendingSubmit.maxCombo,
          mode: pendingSubmit.mode,
          durationSec: pendingSubmit.durationSec,
          gringoEncounters: pendingSubmit.gringoEncounters,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Failed to submit')
      }
      const data: SubmitResult = await res.json()
      setSubmitResult(data)
      audio.play('combo-chime')
      audio.play('ticket-done')
      onSubmitted?.()
      fetchScores()
    } catch (e) {
      console.warn('API not available, saving to local scores')
      // Fallback: save to localStorage when API is not available (GitHub Pages)
      const rank = saveLocalScore({
        initials: initials.toUpperCase(),
        score: pendingSubmit.score,
        tickets: pendingSubmit.tickets,
        maxCombo: pendingSubmit.maxCombo,
        mode: pendingSubmit.mode,
        durationSec: pendingSubmit.durationSec,
        gringoEncounters: pendingSubmit.gringoEncounters,
        id: `local-${Date.now()}`,
        createdAt: new Date().toISOString(),
      })
      setSubmitResult({ ok: true, id: `local-${Date.now()}`, rank })
      audio.play('combo-chime')
      audio.play('ticket-done')
      onSubmitted?.()
      fetchScores()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-[60] bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border-2 border-amber-500 rounded-2xl p-5 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [-3, 3, -3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center"
                >
                  <Trophy className="w-6 h-6 text-stone-900" />
                </motion.div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                    Ranking
                  </div>
                  <div className="text-lg font-black text-stone-100">
                    Leaderboard
                  </div>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submit form (only when there's a pending submit) */}
            {pendingSubmit && !submitResult && (
              <Card className="p-4 mb-4 bg-stone-800/50 border-amber-500/50">
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">
                  Tu score
                </div>
                <div className="text-4xl font-black font-mono text-amber-300 text-center mb-3">
                  {pendingSubmit.score.toLocaleString()}
                </div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1">
                  Tus iniciales (3 letras)
                </label>
                <input
                  type="text"
                  value={initials}
                  onChange={(e) =>
                    setInitials(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 3)
                    )
                  }
                  maxLength={3}
                  placeholder="AAA"
                  className="w-full text-center text-3xl font-mono font-black tracking-[0.5em] bg-stone-950 border-2 border-stone-700 focus:border-amber-500 rounded-lg p-2 text-amber-300 outline-none uppercase"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={initials.length !== 3 || submitting}
                  className="w-full mt-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-stone-900 font-bold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar al Ranking
                    </>
                  )}
                </Button>
              </Card>
            )}

            {/* Submit result */}
            {submitResult && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-4 p-4 bg-emerald-500/10 border-2 border-emerald-500 rounded-lg text-center"
              >
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-emerald-400 font-bold mb-1">¡Score enviado!</div>
                {submitResult.rank && submitResult.rank <= 10 ? (
                  <div className="text-amber-400 text-sm font-mono font-bold">
                    ¡Top {submitResult.rank}! 🎉
                  </div>
                ) : (
                  <div className="text-stone-300 text-sm font-mono">
                    Posición #{submitResult.rank}
                  </div>
                )}
              </motion.div>
            )}

            {/* Mode filter */}
            <div className="flex gap-1 mb-3 p-1 bg-stone-800 rounded-lg">
              {(['normal', 'chaos', 'free'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  className={`flex-1 py-1.5 px-2 rounded text-[10px] font-mono uppercase tracking-widest font-bold transition-colors ${
                    filterMode === m
                      ? 'bg-amber-500 text-stone-900'
                      : 'text-stone-400 hover:text-stone-100'
                  }`}
                >
                  {m === 'normal' ? 'Normal' : m === 'chaos' ? 'Caótico' : 'Libre'}
                </button>
              ))}
            </div>

            {/* Refresh button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={fetchScores}
                disabled={loading}
                className="text-[10px] font-mono text-stone-400 hover:text-amber-400 flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refrescar
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-red-400 font-mono text-center p-2 bg-red-500/10 border border-red-500/30 rounded mb-2">
                {error}
              </div>
            )}

            {/* Scores list */}
            <div className="space-y-1">
              {loading && scores.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
                  <div className="text-xs font-mono">Cargando...</div>
                </div>
              ) : scores.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <div className="text-xs font-mono">Sin scores todavía. ¡Sé el primero!</div>
                </div>
              ) : (
                scores.map((s, idx) => (
                  <ScoreRow
                    key={s.id}
                    rank={idx + 1}
                    score={s}
                    isYou={submitResult?.id === s.id}
                  />
                ))
              )}
            </div>

            {/* Your best */}
            <div className="mt-4 pt-3 border-t border-stone-700 text-center text-[10px] font-mono text-stone-400">
              Tu mejor (local):{' '}
              <span className="text-amber-400 font-bold">
                {highscore.toLocaleString()}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ScoreRow({
  rank,
  score,
  isYou,
}: {
  rank: number
  score: ScoreEntry
  isYou: boolean
}) {
  const rankIcon =
    rank === 1 ? (
      <Crown className="w-4 h-4 text-amber-400" />
    ) : rank === 2 ? (
      <Medal className="w-4 h-4 text-stone-300" />
    ) : rank === 3 ? (
      <Medal className="w-4 h-4 text-amber-700" />
    ) : null

  const date = new Date(score.createdAt)
  const dateStr = `${date.getDate()}/${date.getMonth() + 1}`

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
        isYou
          ? 'bg-amber-500/20 border border-amber-500'
          : rank <= 3
            ? 'bg-stone-800/60'
            : 'bg-stone-800/30'
      }`}
    >
      {/* Rank */}
      <div className="w-7 text-center flex-shrink-0">
        {rankIcon ?? (
          <span className="text-xs font-mono text-stone-400">{rank}</span>
        )}
      </div>
      {/* Initials */}
      <div className="w-12 font-mono font-black text-stone-100 text-sm tracking-widest">
        {score.initials}
      </div>
      {/* Score */}
      <div className="flex-1 text-right font-mono font-bold text-amber-300 tabular-nums">
        {score.score.toLocaleString()}
      </div>
      {/* Tickets */}
      <div className="w-8 text-center text-[10px] font-mono text-stone-400">
        {score.tickets}T
      </div>
      {/* Date */}
      <div className="w-10 text-center text-[10px] font-mono text-stone-500">
        {dateStr}
      </div>
      {isYou && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-[9px] font-mono font-bold text-amber-400 uppercase"
        >
          TÚ
        </motion.span>
      )}
    </motion.div>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

const INITIALS_KEY = 'makileros:initials'

function loadSavedInitials(): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(INITIALS_KEY) ?? ''
  } catch {
    return ''
  }
}

function saveInitials(initials: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(INITIALS_KEY, initials)
  } catch {}
}

// === localStorage fallback for GitHub Pages (no server) ===
const LOCAL_SCORES_KEY = 'makileros:local-scores'

function loadLocalScores(mode: string): ScoreEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_SCORES_KEY)
    if (!raw) return []
    const all: ScoreEntry[] = JSON.parse(raw)
    return all
      .filter((s) => s.mode === mode)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  } catch {
    return []
  }
}

function saveLocalScore(entry: ScoreEntry): number {
  if (typeof window === 'undefined') return 1
  try {
    const raw = localStorage.getItem(LOCAL_SCORES_KEY)
    const all: ScoreEntry[] = raw ? JSON.parse(raw) : []
    all.push(entry)
    // Keep only top 50 per mode to avoid unbounded growth
    const trimmed = all
      .sort((a, b) => b.score - a.score)
      .slice(0, 100)
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(trimmed))
    // Compute rank
    const modeScores = trimmed.filter((s) => s.mode === entry.mode)
    const rank = modeScores.findIndex((s) => s.id === entry.id) + 1
    return rank || 1
  } catch {
    return 1
  }
}
