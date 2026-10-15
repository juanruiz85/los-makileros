'use client'

import React from 'react'
import { useGameStore } from '@/game/store/gameStore'
import { TrendingUp } from 'lucide-react'

export function ScoreBoard() {
  const score = useGameStore((s) => s.score)
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 rounded-lg border-2 border-stone-700">
      <TrendingUp className="w-4 h-4 text-emerald-400" />
      <span className="font-mono text-2xl font-black text-emerald-400 tabular-nums">
        {score.toLocaleString()}
      </span>
    </div>
  )
}
