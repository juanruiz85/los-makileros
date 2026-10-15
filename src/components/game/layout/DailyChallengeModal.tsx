'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Calendar,
  X,
  Flame,
  Trophy,
  CheckCircle2,
  Clock,
  Zap,
  Play,
} from 'lucide-react'
import { useDailyChallengeStore } from '@/game/store/dailyChallengeStore'
import { useGameStore } from '@/game/store/gameStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useEventStore } from '@/game/store/eventStore'
import { useStationStore } from '@/game/store/stationStore'
import { useAchievementStore, ACHIEVEMENT_DEFS } from '@/game/store/achievementStore'
import { audio } from '@/lib/audio'
import { CABLE_COLOR_HEX, CABLE_COLOR_LABEL, TERMINAL_LABEL } from '@/game/constants'
import { dailyChallengeToTicket } from '@/game/store/dailyChallengeStore'
import type { GameMode } from '@/game/types'

interface DailyChallengeModalProps {
  open: boolean
  onOpenChange: (b: boolean) => void
}

export function DailyChallengeModal({ open, onOpenChange }: DailyChallengeModalProps) {
  const getTodayChallenge = useDailyChallengeStore((s) => s.getTodayChallenge)
  const streak = useDailyChallengeStore((s) => s.streak)
  const totalCompleted = useDailyChallengeStore((s) => s.totalCompleted)
  const start = useGameStore((s) => s.start)

  const [challenge] = useState(() => getTodayChallenge())

  if (!challenge) return null

  const handleStartDaily = () => {
    audio.init()
    audio.resume()
    audio.play('combo-chime')
    const inv = useInventoryStore.getState()
    if (inv.cables.length === 0) inv.initInventory()
    useEventStore.getState().reset()
    useStationStore.getState().resetAll()
    // Use 'normal' mode but inject the daily ticket
    start('normal' as GameMode)
    // Override current ticket after start
    setTimeout(() => {
      useGameStore.setState({
        currentTicket: dailyChallengeToTicket(challenge),
      })
    }, 0)
    onOpenChange(false)
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
                  <Calendar className="w-6 h-6 text-stone-900" />
                </motion.div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                    {challenge.date}
                  </div>
                  <div className="text-lg font-black text-stone-100">
                    Daily Challenge
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

            {/* Streak badge */}
            <div className="flex items-center justify-between mb-4 px-3 py-2 bg-stone-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={streak > 0 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: streak > 0 ? Infinity : 0 }}
                >
                  <Flame className={`w-5 h-5 ${streak >= 3 ? 'text-orange-500' : streak > 0 ? 'text-amber-500' : 'text-stone-500'}`} />
                </motion.div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                    Racha
                  </div>
                  <div className="font-black text-stone-100">
                    {streak} {streak === 1 ? 'día' : 'días'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                  Total completados
                </div>
                <div className="font-black text-emerald-400">
                  {totalCompleted}
                </div>
              </div>
            </div>

            {/* Story */}
            <Card className="p-3 mb-4 bg-stone-800/50 border-amber-500/50">
              <div className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-1">
                Misión de hoy
              </div>
              <div className="text-sm text-stone-200 italic">{challenge.story}</div>
            </Card>

            {/* Ticket details */}
            <div className="bg-stone-950 border border-stone-700 rounded-lg p-3 mb-4">
              <div className="text-center mb-3 pb-2 border-b border-stone-700">
                <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                  Part Number
                </div>
                <div className="font-mono font-black text-xl text-amber-300">
                  {challenge.partNumber}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <div className="text-stone-400 uppercase text-[10px]">Color</div>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-4 h-4 rounded border border-stone-500"
                      style={{ background: CABLE_COLOR_HEX[challenge.cableColor] }}
                    />
                    <span className="font-bold text-stone-100">
                      {CABLE_COLOR_LABEL[challenge.cableColor]}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-stone-400 uppercase text-[10px]">Gauge</div>
                  <div className="font-bold text-stone-100">{challenge.cableGauge} AWG</div>
                </div>
                <div>
                  <div className="text-stone-400 uppercase text-[10px]">Longitud</div>
                  <div className="font-bold text-stone-100">{challenge.length_mm} mm</div>
                </div>
                <div>
                  <div className="text-stone-400 uppercase text-[10px]">Circuitos</div>
                  <div className="font-bold text-stone-100">{challenge.circuitCount}</div>
                </div>
                <div>
                  <div className="text-stone-400 uppercase text-[10px]">Terminal A</div>
                  <div className="font-bold text-stone-100">{TERMINAL_LABEL[challenge.terminalA]}</div>
                </div>
                <div>
                  <div className="text-stone-400 uppercase text-[10px]">Terminal B</div>
                  <div className="font-bold text-stone-100">{TERMINAL_LABEL[challenge.terminalB]}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-2 pt-2 border-t border-stone-700">
                {challenge.needsSplice && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-mono uppercase rounded">
                    🔌 Splice
                  </span>
                )}
                {challenge.needsHarness && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono uppercase rounded">
                    🧵 Harness
                  </span>
                )}
              </div>
            </div>

            {/* Bonus info */}
            <div className="flex items-center justify-between mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                  Score bonus
                </span>
              </div>
              <span className="font-black text-amber-300 text-lg">x{challenge.bonusMultiplier}</span>
            </div>

            {/* Status / Attempt info */}
            {challenge.completed ? (
              <Card className="p-3 mb-4 bg-emerald-500/10 border-emerald-500/50 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                </motion.div>
                <div className="text-emerald-400 font-bold text-sm">
                  ¡Completado!
                </div>
                <div className="text-xs font-mono text-stone-300">
                  Mejor score: {challenge.bestScore.toLocaleString()} pts
                </div>
                <div className="text-[10px] font-mono text-stone-400 mt-1">
                  {challenge.attempts} {challenge.attempts === 1 ? 'intento' : 'intentos'}
                </div>
              </Card>
            ) : challenge.attempts > 0 ? (
              <Card className="p-3 mb-4 bg-stone-800/50 border-stone-700 text-center">
                <Clock className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                <div className="text-stone-300 font-bold text-sm">
                  {challenge.attempts} {challenge.attempts === 1 ? 'intento' : 'intentos'} sin éxito
                </div>
                <div className="text-xs font-mono text-stone-400">
                  Mejor hasta ahora: {challenge.bestScore.toLocaleString()} pts
                </div>
              </Card>
            ) : null}

            {/* Start button */}
            <Button
              onClick={handleStartDaily}
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold"
            >
              <Play className="w-4 h-4 mr-2" />
              {challenge.completed ? 'Reintentar' : challenge.attempts > 0 ? 'Intentar de nuevo' : 'Empezar Daily Challenge'}
            </Button>

            <div className="mt-3 text-center text-[10px] font-mono text-stone-400">
              ⏰ Nueva challenge cada día a las 00:00 (hora local)
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
