'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import type { HeatShrinkTube } from '@/game/types'

interface DraggableTubeProps {
  tube: HeatShrinkTube
  count: number
  interactive: boolean
}

export function DraggableTube({ tube, count, interactive }: DraggableTubeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tube-${tube.id}`,
    data: { kind: 'tube', payload: tube },
    disabled: !interactive,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: interactive ? 'grab' : 'default',
  }

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
      {/* Tubo visual */}
      <div className="relative w-12 h-5">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-300 via-red-400 to-orange-300 border-2 border-stone-500 dark:border-stone-600" />
        <motion.div
          animate={{ x: [-2, 2, -2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/2 -translate-y-1/2 left-1 right-1 h-0.5 bg-orange-200/40 rounded-full"
        />
      </div>
      <div className="text-[9px] font-mono text-stone-600 dark:text-stone-400 text-center font-bold leading-tight">
        <Flame className="w-3 h-3 inline mr-0.5" />
        Heat Shrink
      </div>
      {count > 1 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-900 text-[10px] font-bold flex items-center justify-center">
          {count}
        </div>
      )}
    </motion.div>
  )
}
