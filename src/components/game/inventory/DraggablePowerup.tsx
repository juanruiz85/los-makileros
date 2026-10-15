'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Coffee, Cookie } from 'lucide-react'

interface DraggablePowerupProps {
  type: 'coffee' | 'taco'
  interactive: boolean
}

export function DraggablePowerup({ type, interactive }: DraggablePowerupProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `powerup-${type}`,
    data: { kind: 'powerup', payload: { type } },
    disabled: !interactive,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: interactive ? 'grab' : 'default',
  }

  const isCoffee = type === 'coffee'
  const Icon = isCoffee ? Coffee : Cookie
  const label = isCoffee ? 'Café' : 'Taco'
  const bg = isCoffee ? 'from-yellow-500 to-amber-700' : 'from-orange-400 to-red-600'
  const tooltip = isCoffee
    ? 'Arrástrame a tu personaje para congelar el timer 5s'
    : 'Arrástrame para inmunidad anti-Supervisor 1 ticket'

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={interactive ? { scale: 1.08, y: -3 } : {}}
      whileTap={interactive ? { scale: 0.95 } : {}}
      title={tooltip}
      className={`relative flex flex-col items-center gap-1 p-2 rounded-lg bg-gradient-to-br ${bg} text-white shadow-md touch-none select-none`}
    >
      <div className="animate-pulse">
        <Icon className="w-10 h-10" />
      </div>
      <div className="text-[10px] font-mono font-bold">{label}</div>
    </motion.div>
  )
}
