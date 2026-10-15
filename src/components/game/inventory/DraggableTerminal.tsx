'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Terminal } from '@/game/types'
import { TERMINAL_LABEL } from '@/game/constants'
import { motion } from 'framer-motion'

interface DraggableTerminalProps {
  terminal: Terminal
  count: number
  interactive: boolean
}

export function DraggableTerminal({ terminal, count, interactive }: DraggableTerminalProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `terminal-${terminal.id}`,
    data: { kind: 'terminal', payload: terminal },
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
      {/* Forma del terminal */}
      <svg viewBox="0 0 40 24" className="w-10 h-7 text-stone-400 dark:text-stone-500">
        {/* base */}
        <rect x="14" y="4" width="14" height="16" rx="1" fill="currentColor" />
        {/* pestaña */}
        <rect x="0" y="8" width="14" height="8" rx="1" fill="currentColor" />
        {/* pestaña de crimp */}
        <rect x="20" y="0" width="6" height="4" fill="currentColor" />
        <rect x="20" y="20" width="6" height="4" fill="currentColor" />
      </svg>
      <div className="text-[9px] font-mono text-stone-600 dark:text-stone-400 text-center font-bold leading-tight">
        {TERMINAL_LABEL[terminal.type]}
      </div>
      {count > 1 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-900 text-[10px] font-bold flex items-center justify-center">
          {count}
        </div>
      )}
    </motion.div>
  )
}
