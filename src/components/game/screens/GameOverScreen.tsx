'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useEventStore } from '@/game/store/eventStore'
import { useStationStore } from '@/game/store/stationStore'
import { audio } from '@/lib/audio'
import { T } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skull, Trophy, RefreshCw, Home, Send, Clock, Share2 } from 'lucide-react'
import { LeaderboardModal } from '@/components/game/layout/LeaderboardModal'
import { ShareModal } from '@/components/game/layout/ShareModal'

export function GameOverScreen() {
  const reason = useGameStore((s) => s.gameOverReason)
  const score = useGameStore((s) => s.score)
  const highscore = useGameStore((s) => s.highscore)
  const runStats = useGameStore((s) => s.runStats)
  const mode = useGameStore((s) => s.mode)
  const start = useGameStore((s) => s.start)
  const setScreen = useGameStore((s) => s.setScreen)
  const reset = useGameStore((s) => s.reset)
  const isNewHigh = score >= highscore && score > 0

  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [tierInfo, setTierInfo] = useState<{ label: string; emoji: string }>({ label: 'OPERADOR', emoji: '🔧' })
  const handleTierChange = useCallback((info: { label: string; emoji: string }) => {
    setTierInfo(info)
  }, [])
  const [pendingSubmit, setPendingSubmit] = useState<{
    score: number
    tickets: number
    maxCombo: number
    mode: 'normal' | 'chaos' | 'free'
    durationSec: number
    gringoEncounters: number
  } | null>(null)
  const sessionLoggedRef = useRef(false)

  // Play game-over sound once
  useEffect(() => {
    audio.play('game-over')
  }, [])

  // Auto-log session to backend (anonymous balance analytics)
  useEffect(() => {
    if (sessionLoggedRef.current) return
    sessionLoggedRef.current = true
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode,
        durationSec: Math.floor(runStats.timePlayedSec),
        ticketsCompleted: runStats.ticketsCompleted,
        finalScore: score,
        errors: runStats.errors,
        gringoEncounters: runStats.gringoEncounters,
      }),
    }).catch((e) => console.warn('Failed to log session:', e))
  }, [mode, runStats, score])

  // Auto-open leaderboard with submit form for new high scores > 0
  useEffect(() => {
    if (score > 0) {
      setPendingSubmit({
        score,
        tickets: runStats.ticketsCompleted,
        maxCombo: runStats.maxCombo,
        mode,
        durationSec: Math.floor(runStats.timePlayedSec),
        gringoEncounters: runStats.gringoEncounters,
      })
      // Auto-open if new high (but allow user to close)
      if (isNewHigh) {
        const t = setTimeout(() => setLeaderboardOpen(true), 1500)
        return () => clearTimeout(t)
      }
    }
  }, [score, runStats, mode, isNewHigh])

  const handlePlayAgain = () => {
    const inv = useInventoryStore.getState()
    inv.reset()
    inv.initInventory()
    useEventStore.getState().reset()
    useStationStore.getState().resetAll()
    sessionLoggedRef.current = false
    start(useGameStore.getState().mode)
  }

  const handleMenu = () => {
    reset()
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-gradient-to-br from-stone-900 via-red-950 to-stone-900 p-4 overflow-hidden">
      {/* Efecto de partículas / papeles caídos */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: -50,
              x: Math.random() * 1200 - 200,
              rotate: Math.random() * 360,
            }}
            animate={{ y: 800, rotate: 360 * 5 }}
            transition={{
              duration: 5 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            className="absolute w-8 h-8 bg-stone-200/30 rounded"
          />
        ))}
      </div>

      {/* Red flash on entering */}
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-red-500 pointer-events-none"
      />

      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120 }}
        className="relative z-10 max-w-md w-full"
      >
        <Card className="p-6 bg-stone-950/80 backdrop-blur border-2 border-red-500 shadow-2xl">
          {/* Skull grande */}
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="flex justify-center mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center border-4 border-red-500">
              <Skull className="w-12 h-12 text-red-500" />
            </div>
          </motion.div>

          <h1 className="text-4xl font-black text-center text-red-500 mb-1 tracking-tight">
            {T.gameover.title}
          </h1>
          <p className="text-center text-stone-400 text-sm font-mono mb-4">
            {reason === 'time'
              ? T.gameover.reasonTime
              : T.gameover.reasonGringo}
          </p>

          {/* Performance tier message */}
          <PerformanceTier score={score} tickets={runStats.ticketsCompleted} onTier={handleTierChange} />

          {/* Score final */}
          <div className="bg-stone-900/80 rounded-lg p-4 border border-stone-700 mb-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400 text-center">
              {T.gameover.finalScore}
            </div>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-5xl font-black text-center font-mono text-amber-400 my-1"
            >
              {score.toLocaleString()}
            </motion.div>
            {isNewHigh && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="flex items-center justify-center gap-1 text-amber-400 font-bold text-sm"
              >
                <Trophy className="w-4 h-4" />
                {T.gameover.newHigh}
              </motion.div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono">
            <StatBox label={T.gameover.tickets} value={runStats.ticketsCompleted} />
            <StatBox label={T.gameover.maxCombo} value={`x${runStats.maxCombo}`} />
            <StatBox label={T.gameover.time} value={`${Math.floor(runStats.timePlayedSec)}s`} />
            <StatBox label={T.gameover.gringoEncounters} value={runStats.gringoEncounters} />
          </div>

          {/* Submit to leaderboard button */}
          {score > 0 && (
            <div className="flex gap-2 mb-2">
              <Button
                onClick={() => {
                  setPendingSubmit({
                    score,
                    tickets: runStats.ticketsCompleted,
                    maxCombo: runStats.maxCombo,
                    mode,
                    durationSec: Math.floor(runStats.timePlayedSec),
                    gringoEncounters: runStats.gringoEncounters,
                  })
                  setLeaderboardOpen(true)
                }}
                variant="outline"
                className="flex-1 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-stone-900"
              >
                <Send className="w-4 h-4 mr-2" />
                Ranking
              </Button>
              <Button
                onClick={() => setShareOpen(true)}
                variant="outline"
                className="flex-1 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            <Button
              onClick={handlePlayAgain}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {T.gameover.playAgain}
            </Button>
            <Button
              variant="outline"
              onClick={handleMenu}
              className="border-stone-600 text-stone-200 hover:bg-stone-800"
            >
              <Home className="w-4 h-4 mr-2" />
              {T.gameover.menu}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        open={leaderboardOpen}
        onOpenChange={setLeaderboardOpen}
        pendingSubmit={pendingSubmit}
      />

      {/* Share Modal */}
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        score={score}
        tickets={runStats.ticketsCompleted}
        maxCombo={runStats.maxCombo}
        mode={mode}
        tierLabel={tierInfo.label}
        tierEmoji={tierInfo.emoji}
      />
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-stone-900/60 rounded p-2 border border-stone-800">
      <div className="text-stone-400 uppercase text-[10px] tracking-widest mb-0.5">
        {label}
      </div>
      <div className="font-bold text-stone-100 text-sm">{value}</div>
    </div>
  )
}

function PerformanceTier({ score, tickets, onTier }: { score: number; tickets: number; onTier?: (info: { label: string; emoji: string }) => void }) {
  let tier: { label: string; emoji: string; color: string; message: string }
  if (score === 0) {
    tier = {
      label: 'NOVATO',
      emoji: '😴',
      color: 'text-stone-400 border-stone-600',
      message: '¿En serio? ¡Ni un ticket! Vamos, inténtalo de nuevo.',
    }
  } else if (score < 500) {
    tier = {
      label: 'APRENDIZ',
      emoji: '📖',
      color: 'text-amber-400 border-amber-600',
      message: 'Buen inicio. El supervisor te está vigilando.',
    }
  } else if (score < 1500) {
    tier = {
      label: 'OPERADOR',
      emoji: '🔧',
      color: 'text-emerald-400 border-emerald-600',
      message: 'Ya le agarraste la onda. Sigue practicando.',
    }
  } else if (score < 3000) {
    tier = {
      label: 'EXPERTO',
      emoji: '⭐',
      color: 'text-purple-400 border-purple-600',
      message: '¡Eres un crack! El Gringo te respeta.',
    }
  } else if (score < 5000) {
    tier = {
      label: 'MAESTRO',
      emoji: '🏆',
      color: 'text-amber-400 border-amber-500',
      message: '¡Te mereces un taco de canasta gigante!',
    }
  } else {
    tier = {
      label: 'LEYENDA',
      emoji: '👑',
      color: 'text-yellow-400 border-yellow-500',
      message: '¡El Jefe te quiere de supervisor! ¿Aceptas?',
    }
  }

  useEffect(() => {
    onTier?.({ label: tier.label, emoji: tier.emoji })
  }, [tier.label, tier.emoji, onTier])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`mb-4 p-3 rounded-lg border-2 bg-stone-900/60 text-center ${tier.color}`}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-2xl">{tier.emoji}</span>
        <span className="font-mono font-black text-sm uppercase tracking-widest">
          {tier.label}
        </span>
      </div>
      <div className="text-xs font-mono text-stone-300">{tier.message}</div>
    </motion.div>
  )
}
