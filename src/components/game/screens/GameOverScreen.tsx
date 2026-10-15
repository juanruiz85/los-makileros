'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useEventStore } from '@/game/store/eventStore'
import { useStationStore } from '@/game/store/stationStore'
import { audio } from '@/lib/audio'
import { T } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skull, Trophy, RefreshCw, Home } from 'lucide-react'

export function GameOverScreen() {
  const reason = useGameStore((s) => s.gameOverReason)
  const score = useGameStore((s) => s.score)
  const highscore = useGameStore((s) => s.highscore)
  const runStats = useGameStore((s) => s.runStats)
  const start = useGameStore((s) => s.start)
  const setScreen = useGameStore((s) => s.setScreen)
  const reset = useGameStore((s) => s.reset)
  const isNewHigh = score >= highscore && score > 0

  React.useEffect(() => {
    audio.play('game-over')
  }, [])

  const handlePlayAgain = () => {
    const inv = useInventoryStore.getState()
    inv.reset()
    inv.initInventory()
    useEventStore.getState().reset()
    useStationStore.getState().resetAll()
    start(useGameStore.getState().mode)
  }

  const handleMenu = () => {
    reset()
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-gradient-to-br from-stone-900 via-red-950 to-stone-900 p-4 overflow-hidden">
      {/* Efecto de partículas / papeles caídos */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
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

          {/* Score final */}
          <div className="bg-stone-900/80 rounded-lg p-4 border border-stone-700 mb-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400 text-center">
              {T.gameover.finalScore}
            </div>
            <div className="text-5xl font-black text-center font-mono text-amber-400 my-1">
              {score.toLocaleString()}
            </div>
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
