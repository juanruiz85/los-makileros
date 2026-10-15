'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'

export function ComboIndicator() {
  const combo = useGameStore((s) => s.combo)
  const comboActive = useGameStore((s) => s.comboModeActive)
  const show = combo > 0

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 rounded-lg border-2 border-stone-700 min-w-[80px] justify-center">
      <AnimatePresence mode="popLayout">
        {show ? (
          <motion.div
            key={combo}
            initial={{ scale: 1.4, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`font-mono font-black text-2xl tabular-nums ${
              comboActive ? 'text-amber-400' : 'text-stone-200'
            }`}
          >
            x{combo}
          </motion.div>
        ) : (
          <div className="text-stone-500 font-mono text-sm">COMBO</div>
        )}
      </AnimatePresence>
    </div>
  )
}
