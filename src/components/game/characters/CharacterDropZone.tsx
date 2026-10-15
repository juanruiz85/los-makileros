'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { useGameStore } from '@/game/store/gameStore'
import { useInventoryStore } from '@/game/store/inventoryStore'

export function CharacterDropZone() {
  const screen = useGameStore((s) => s.screen)
  const coffeePending = useInventoryStore((s) => s.coffeePending)
  const tacoPending = useInventoryStore((s) => s.tacoPending)
  const showZone = screen === 'playing' && (coffeePending || tacoPending)
  const { isOver, setNodeRef } = useDroppable({ id: 'character', data: { accept: 'powerup' } })

  if (!showZone) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="absolute bottom-20 right-4 z-20 pointer-events-auto"
    >
      <div
        ref={setNodeRef}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
          isOver
            ? 'bg-amber-500 scale-110 border-4 border-white dark:border-stone-100'
            : 'bg-amber-400/80 border-4 border-amber-600'
        } shadow-2xl`}
      >
        <div className="text-5xl">👷</div>
        <motion.div
          animate={{ y: [-2, -6, -2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-2 -right-2 bg-stone-900 text-amber-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500"
        >
          SUELTA AQUÍ
        </motion.div>
      </div>
    </motion.div>
  )
}
