'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { Button } from '@/components/ui/button'
import { Pause, Play, Home } from 'lucide-react'

export function PausedScreen() {
  const resume = useGameStore((s) => s.resume)
  const reset = useGameStore((s) => s.reset)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-stone-950 border-2 border-amber-500 rounded-xl p-6 max-w-xs w-full mx-4 text-center"
      >
        <Pause className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-2xl font-black text-stone-100 mb-1">PAUSA</h2>
        <p className="text-xs text-stone-400 mb-4 font-mono">
          El supervisor te está viendo...
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={resume}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Continuar
          </Button>
          <Button
            variant="outline"
            onClick={reset}
            className="border-stone-600 text-stone-200 hover:bg-stone-800"
          >
            <Home className="w-4 h-4 mr-2" />
            Volver al menú
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
