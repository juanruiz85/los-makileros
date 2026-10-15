'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { Clock } from 'lucide-react'

export function Timer() {
  const timerSec = useGameStore((s) => s.timerSec)
  const mode = useGameStore((s) => s.mode)
  const timerFrozen = useGameStore((s) => s.timerFrozen)

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
  const border =
    timerSec <= 15
      ? 'border-red-500'
      : timerSec <= 30
        ? 'border-amber-500'
        : 'border-stone-700'

  return (
    <motion.div
      animate={
        timerSec <= 15
          ? { scale: [1, 1.05, 1] }
          : {}
      }
      transition={{ duration: 0.5, repeat: timerSec <= 15 ? Infinity : 0 }}
      className={`relative flex items-center gap-2 px-3 py-1.5 ${bg} rounded-lg border-2 ${border}`}
      style={
        timerSec <= 15
          ? { boxShadow: '0 0 12px rgba(239,68,68,0.5)' }
          : timerSec <= 30
            ? { boxShadow: '0 0 8px rgba(245,158,11,0.3)' }
            : {}
      }
    >
      <Clock className={`w-4 h-4 ${color} ${timerSec <= 15 ? 'animate-pulse' : ''}`} />
      <span className={`font-mono text-2xl font-black ${color} tabular-nums`}>{txt}</span>
      {timerFrozen && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 text-[10px] font-mono font-bold bg-yellow-400 text-stone-900 px-1.5 py-0.5 rounded-full border border-stone-900"
        >
          ❄
        </motion.span>
      )}
    </motion.div>
  )
}
