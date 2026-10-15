'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { Clock } from 'lucide-react'

export function Timer() {
  const timerSec = useGameStore((s) => s.timerSec)
  const mode = useGameStore((s) => s.mode)

  if (mode === 'free') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 rounded-lg">
        <Clock className="w-4 h-4 text-stone-400" />
        <span className="font-mono text-2xl font-black text-stone-200">∞</span>
      </div>
    )
  }

  const seconds = Math.max(0, Math.floor(timerSec))
  const mm = Math.floor(seconds / 60)
  const ss = seconds % 60
  const txt = `${mm}:${ss.toString().padStart(2, '0')}`

  // Color según urgencia
  const color =
    timerSec <= 15
      ? 'text-red-500'
      : timerSec <= 30
        ? 'text-amber-400'
        : 'text-emerald-400'
  const bg =
    timerSec <= 15
      ? 'bg-red-950'
      : timerSec <= 30
        ? 'bg-amber-950'
        : 'bg-stone-800'

  return (
    <motion.div
      animate={
        timerSec <= 15
          ? { scale: [1, 1.05, 1] }
          : {}
      }
      transition={{ duration: 0.5, repeat: timerSec <= 15 ? Infinity : 0 }}
      className={`flex items-center gap-2 px-3 py-1.5 ${bg} rounded-lg border-2 ${
        timerSec <= 15 ? 'border-red-500' : 'border-stone-700'
      }`}
    >
      <Clock className={`w-4 h-4 ${color}`} />
      <span className={`font-mono text-2xl font-black ${color} tabular-nums`}>{txt}</span>
    </motion.div>
  )
}
