'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { useEventStore } from '@/game/store/eventStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { audio } from '@/lib/audio'
import { T } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Warehouse, CheckCircle2, Pause, Settings, AlertTriangle } from 'lucide-react'
import { WarehouseSheet } from './WarehouseSheet'

export function BottomBar() {
  const screen = useGameStore((s) => s.screen)
  const mode = useGameStore((s) => s.mode)
  const setScreen = useGameStore((s) => s.setScreen)
  const reportCompleted = useGameStore((s) => s.reportTicketCompleted)
  const subtitle = useEventStore((s) => s.currentSubtitle)
  const [warehouseOpen, setWarehouseOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const cables = useInventoryStore((s) => s.cables.length)
  const coffeePending = useInventoryStore((s) => s.coffeePending)
  const tacoPending = useInventoryStore((s) => s.tacoPending)
  const isLowStock = cables < 3

  return (
    <div className="bg-stone-900 dark:bg-black text-stone-100 px-2 py-2 sm:px-4 border-t-4 border-amber-500 flex flex-wrap items-center gap-2">
      {/* Botón almacén */}
      <Button
        variant="outline"
        className="bg-stone-800 border-stone-600 text-stone-100 hover:bg-stone-700 relative"
        onClick={() => setWarehouseOpen(true)}
        disabled={screen !== 'playing'}
      >
        <Warehouse className="w-4 h-4 mr-2" />
        {T.hud.warehouse}
        {isLowStock && screen === 'playing' && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-stone-900"
          />
        )}
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

      {/* Power-ups pending indicator */}
      {(coffeePending || tacoPending) && (
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-400 text-[10px] font-mono font-bold">
          {coffeePending && <span>☕</span>}
          {tacoPending && <span>🌮</span>}
          <span>POWER-UPS</span>
        </div>
      )}

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

      {/* Ajustes */}
      <Button
        variant="outline"
        size="icon"
        className="bg-stone-800 border-stone-600 text-stone-100 hover:bg-stone-700"
        onClick={() => setSettingsOpen(true)}
        disabled={screen !== 'playing'}
        title="Ajustes"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* Warehouse Sheet */}
      <WarehouseSheet open={warehouseOpen} onOpenChange={setWarehouseOpen} />

      {/* Settings Sheet (simple) */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-stone-900 border-2 border-amber-500 rounded-xl p-6 max-w-sm w-full"
            >
              <h2 className="text-xl font-black text-amber-400 mb-3">AJUSTES</h2>
              <p className="text-sm text-stone-300 mb-4 font-mono">
                Volumen, música y tema se agregarán en próxima actualización.
              </p>
              <Button
                onClick={() => setSettingsOpen(false)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900"
              >
                Cerrar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
