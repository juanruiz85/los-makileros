'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { useEventStore } from '@/game/store/eventStore'
import { audio } from '@/lib/audio'
import { T } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Warehouse, CheckCircle2, Pause, Settings, AlertTriangle } from 'lucide-react'

export function BottomBar() {
  const screen = useGameStore((s) => s.screen)
  const mode = useGameStore((s) => s.mode)
  const setScreen = useGameStore((s) => s.setScreen)
  const reportCompleted = useGameStore((s) => s.reportTicketCompleted)
  const subtitle = useEventStore((s) => s.currentSubtitle)

  return (
    <div className="bg-stone-900 dark:bg-black text-stone-100 px-2 py-2 sm:px-4 border-t-4 border-amber-500 flex flex-wrap items-center gap-2">
      {/* Botón almacén */}
      <Button
        variant="outline"
        className="bg-stone-800 border-stone-600 text-stone-100 hover:bg-stone-700"
        disabled
        title="Próximamente"
      >
        <Warehouse className="w-4 h-4 mr-2" />
        {T.hud.warehouse}
      </Button>

      {/* Botón reportar */}
      <Button
        onClick={() => {
          audio.play('ticket-done')
          reportCompleted()
        }}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        disabled={screen !== 'playing'}
      >
        <CheckCircle2 className="w-4 h-4 mr-2" />
        {T.hud.report}
      </Button>

      <div className="flex-1" />

      {/* Modo actual */}
      <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400 hidden sm:block">
        Modo: <span className="text-amber-400 font-bold">{mode}</span>
      </div>

      {/* Pausa */}
      <Button
        variant="outline"
        size="icon"
        className="bg-stone-800 border-stone-600 text-stone-100 hover:bg-stone-700"
        onClick={() => {
          if (screen === 'playing') {
            setScreen('paused')
          }
        }}
        disabled={screen !== 'playing'}
      >
        <Pause className="w-4 h-4" />
      </Button>

      {/* Ajustes (placeholder) */}
      <Button
        variant="outline"
        size="icon"
        className="bg-stone-800 border-stone-600 text-stone-100 hover:bg-stone-700"
        disabled
        title="Próximamente"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* Banner subtítulo */}
      <AnimatePresence>
        {subtitle && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-stone-900/95 backdrop-blur border-2 border-amber-500 rounded-lg shadow-2xl max-w-md ${subtitle.color ?? 'text-stone-100'}`}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-center">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              {subtitle.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
