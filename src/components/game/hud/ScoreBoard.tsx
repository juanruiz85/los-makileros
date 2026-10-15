'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { TrendingUp } from 'lucide-react'

export function ScoreBoard() {
  const score = useGameStore((s) => s.score)
  const prevScoreRef = useRef(score)
  const [floatingDelta, setFloatingDelta] = useState<{ id: number; value: number } | null>(null)
  const deltaIdRef = useRef(0)

  useEffect(() => {
    const delta = score - prevScoreRef.current
    prevScoreRef.current = score
    if (delta !== 0) {
      deltaIdRef.current += 1
      setFloatingDelta({ id: deltaIdRef.current, value: delta })
      const t = setTimeout(() => setFloatingDelta(null), 1500)
      return () => clearTimeout(t)
    }
  }, [score])

  return (
    <div className="relative flex items-center gap-2 px-3 py-1.5 bg-stone-800 rounded-lg border-2 border-stone-700">
      <TrendingUp className="w-4 h-4 text-emerald-400" />
      <motion.span
        key={score > 1000 ? Math.floor(score / 100) : score} // re-anim each chunk
        initial={{ scale: 1.1, color: '#34d399' }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
        className="font-mono text-2xl font-black text-emerald-400 tabular-nums"
      >
        {score.toLocaleString()}
      </motion.span>
      <AnimatePresence>
        {floatingDelta && (
          <motion.div
            key={floatingDelta.id}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={`absolute top-0 right-0 text-xs font-mono font-bold ${
              floatingDelta.value > 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {floatingDelta.value > 0 ? `+${floatingDelta.value}` : floatingDelta.value}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
