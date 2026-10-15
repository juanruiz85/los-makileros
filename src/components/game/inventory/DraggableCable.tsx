'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Cable } from '@/game/types'
import { CABLE_COLOR_HEX, CABLE_COLOR_LABEL } from '@/game/constants'
import { motion } from 'framer-motion'

interface DraggableCableProps {
  cable: Cable
  count: number
  interactive: boolean
}

export function DraggableCable({ cable, count, interactive }: DraggableCableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `cable-${cable.id}`,
    data: { kind: 'cable', payload: cable, color: cable.color },
    disabled: !interactive,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: interactive ? 'grab' : 'default',
  }

  const colorHex = CABLE_COLOR_HEX[cable.color]

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={interactive ? { scale: 1.05, y: -2 } : {}}
      whileTap={interactive ? { scale: 0.95 } : {}}
      className="relative flex flex-col items-center gap-1 p-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-300 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow touch-none select-none"
    >
      {/* Carrete */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-4 border-stone-400 dark:border-stone-600"
          style={{ background: `radial-gradient(circle at center, ${colorHex} 30%, rgba(0,0,0,0.5) 100%)` }}
        />
        <div className="absolute inset-2 rounded-full border-2 border-stone-700 dark:border-stone-300" />
        <div className="absolute inset-3 rounded-full" style={{ background: colorHex }} />
        {/* Cable que sale */}
        <div
          className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-1 rounded"
          style={{ background: colorHex }}
        />
      </div>
      {/* Etiqueta */}
      <div className="text-[9px] font-mono text-stone-600 dark:text-stone-400 text-center leading-tight">
        <div className="font-bold">{CABLE_COLOR_LABEL[cable.color]}</div>
        <div className="text-stone-400">{cable.gauge} AWG</div>
      </div>
      {/* Badge de cantidad */}
      {count > 1 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-900 text-[10px] font-bold flex items-center justify-center">
          {count}
        </div>
      )}
    </motion.div>
  )
}
