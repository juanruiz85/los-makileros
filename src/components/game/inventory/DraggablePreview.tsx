'use client'

import React from 'react'
import { CABLE_COLOR_HEX } from '@/game/constants'
import { Terminal as TerminalIcon } from 'lucide-react'

interface DraggablePreviewProps {
  kind: string
  color?: string
  label?: string
}

export function DraggablePreview({ kind, color, label }: DraggablePreviewProps) {
  return (
    <div className="pointer-events-none opacity-90 rotate-3">
      {kind === 'cable' && (
        <div
          className="w-14 h-14 rounded-full border-4 border-stone-700 shadow-2xl"
          style={{ background: color ? CABLE_COLOR_HEX[color as keyof typeof CABLE_COLOR_HEX] : '#888' }}
        />
      )}
      {kind === 'terminal' && (
        <div className="w-12 h-12 bg-stone-500 rounded shadow-2xl flex items-center justify-center">
          <TerminalIcon className="w-7 h-7 text-white" />
        </div>
      )}
      {kind === 'powerup' && (
        <div className="px-3 py-2 bg-amber-500 text-stone-900 rounded font-bold shadow-2xl">
          {label}
        </div>
      )}
    </div>
  )
}
