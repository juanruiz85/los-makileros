'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { useStationStore } from '@/game/store/stationStore'
import { useGameStore } from '@/game/store/gameStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useEventStore } from '@/game/store/eventStore'
import { audio } from '@/lib/audio'
import { T } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Scissors, TerminalSquare, Trash2 } from 'lucide-react'
import { CABLE_COLOR_HEX, CABLE_COLOR_LABEL, TERMINAL_LABEL } from '@/game/constants'
import { isTerminalRequired } from '@/lib/tickets'
import type { Cable, Terminal } from '@/game/types'

export function CutStation() {
  const bladeCable = useStationStore((s) => s.cutBladeCable)
  const termA = useStationStore((s) => s.cutTermA)
  const termB = useStationStore((s) => s.cutTermB)
  const clearCut = useStationStore((s) => s.clearCutStation)
  const currentTicket = useGameStore((s) => s.currentTicket)
  const moveCableToWip = useInventoryStore((s) => s.moveToWip)

  const handleCut = () => {
    if (!bladeCable) return
    audio.play('cut-slice')
    // Simula el corte arrastrando cable al WIP
    // La lógica real de validación está en dragResolver.handleCableToWip
    const cutCable: Cable = {
      ...bladeCable,
      cut: true,
      length_mm: currentTicket?.length_mm,
      terminalA: termA?.type ?? 'NONE',
      terminalB: termB?.type ?? 'NONE',
      origin: 'wip',
    }
    moveCableToWip(cutCable)

    // Validación inline
    const ticket = currentTicket
    if (ticket) {
      const colorMatch = bladeCable.color === ticket.cableColor
      const gaugeMatch = bladeCable.gauge === ticket.cableGauge
      if (!colorMatch || !gaugeMatch) {
        useGameStore.getState().loseTime(5)
        useGameStore.getState().addScore(-80)
        useGameStore.getState().registerError()
        useGameStore.getState().breakCombo()
        audio.play('buzz-fail')
        useEventStore.getState().spawnSupervisorWarn()
      } else {
        useGameStore.getState().addScore(50)
        useGameStore.getState().addTime(3)
        useGameStore.getState().bumpCombo()
        useGameStore.getState().resetConsecutiveErrors()
        audio.play('click-ok')
      }
    }
    clearCut()
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Programa resumen */}
      <div className="text-xs font-mono text-stone-500 dark:text-stone-400">
        {T.cut.dragCableHint} → {T.cut.dragTerminalHint}
      </div>

      {/* Máquina de corte */}
      <div className="flex-1 relative bg-stone-200 dark:bg-stone-950 rounded-xl border-2 border-stone-400 dark:border-stone-700 overflow-hidden p-4 flex flex-col gap-4">
        {/* Banner superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-red-500 to-amber-400" />

        {/* Zona del carrete + cuchilla */}
        <div className="flex items-center gap-4 justify-center pt-4">
          {/* Slot cable en cuchilla */}
          <DropZone
            id="cut-blade"
            accept="cable"
            active={!!bladeCable}
            className="w-32 h-32"
          >
            {bladeCable ? (
              <CableReelVisual cable={bladeCable} />
            ) : (
              <EmptySlot icon={<Scissors className="w-8 h-8" />} label="Cuchilla" />
            )}
          </DropZone>

          {/* Flecha animada */}
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-amber-500"
          >
            <Scissors className="w-8 h-8" />
          </motion.div>

          {/* Zona Terminal A */}
          <div className="flex flex-col gap-2">
            <DropZone id="cut-termA" accept="terminal" active={!!termA} className="w-24 h-16">
              {termA ? (
                <TerminalVisual terminal={termA} />
              ) : (
                <EmptySlot
                  icon={<TerminalSquare className="w-6 h-6" />}
                  label="Terminal A"
                  small
                />
              )}
            </DropZone>
            <DropZone id="cut-termB" accept="terminal" active={!!termB} className="w-24 h-16">
              {termB ? (
                <TerminalVisual terminal={termB} />
              ) : (
                <EmptySlot
                  icon={<TerminalSquare className="w-6 h-6" />}
                  label="Terminal B"
                  small
                />
              )}
            </DropZone>
          </div>
        </div>

        {/* Botón CORTAR */}
        <div className="flex justify-center">
          <motion.div whileHover={bladeCable ? { scale: 1.05 } : {}} whileTap={bladeCable ? { scale: 0.95 } : {}}>
            <Button
              disabled={!bladeCable}
              onClick={handleCut}
              className="bg-red-600 hover:bg-red-700 disabled:bg-stone-400 text-white font-black text-lg px-8 py-6 shadow-lg"
            >
              <Scissors className="w-6 h-6 mr-2" />
              {T.cut.cutBtn}
            </Button>
          </motion.div>
        </div>

        {/* Indicador de terminales requeridos */}
        {currentTicket && (
          <div className="text-center text-xs font-mono">
            {isTerminalRequired(currentTicket.circuitCount) ? (
              <span className="text-red-500 font-bold">
                ⚠ {T.cut.terminalRequired}
              </span>
            ) : (
              <span className="text-amber-500">{T.cut.terminalOptional}</span>
            )}
          </div>
        )}
      </div>

      {/* Basura */}
      <div className="flex justify-center">
        <DropZone id="trash" accept="any" active={false} className="w-40 h-12">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-mono">
            <Trash2 className="w-4 h-4" />
            Basura / Devolución
          </div>
        </DropZone>
      </div>
    </div>
  )
}

function CableReelVisual({ cable }: { cable: Cable }) {
  const colorHex = CABLE_COLOR_HEX[cable.color]
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="relative w-24 h-24 flex items-center justify-center"
      >
        <div
          className="absolute inset-0 rounded-full border-4 border-stone-700"
          style={{ background: `radial-gradient(circle, ${colorHex} 30%, rgba(0,0,0,0.6) 100%)` }}
        />
        <div className="absolute inset-2 rounded-full border-2 border-stone-900" />
        <div
          className="absolute inset-3 rounded-full"
          style={{ background: colorHex }}
        />
        {/* Cable saliendo */}
        <motion.div
          animate={{ scaleX: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-2 rounded"
          style={{ background: colorHex }}
        />
      </motion.div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-stone-900 text-amber-400 px-2 py-0.5 rounded">
        {CABLE_COLOR_LABEL[cable.color]} · {cable.gauge} AWG
      </div>
    </div>
  )
}

function TerminalVisual({ terminal }: { terminal: Terminal }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-0.5">
      <svg viewBox="0 0 40 24" className="w-12 h-7 text-stone-700 dark:text-stone-300">
        <rect x="14" y="4" width="14" height="16" rx="1" fill="currentColor" />
        <rect x="0" y="8" width="14" height="8" rx="1" fill="currentColor" />
        <rect x="20" y="0" width="6" height="4" fill="currentColor" />
        <rect x="20" y="20" width="6" height="4" fill="currentColor" />
      </svg>
      <div className="text-[9px] font-mono font-bold text-stone-700 dark:text-stone-200">
        {TERMINAL_LABEL[terminal.type]}
      </div>
    </div>
  )
}

function EmptySlot({ icon, label, small }: { icon: React.ReactNode; label: string; small?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-1 text-stone-400">
      <div className={small ? 'w-6 h-6' : 'w-10 h-10'}>{icon}</div>
      <div className="text-[10px] font-mono uppercase tracking-wider">{label}</div>
    </div>
  )
}

function DropZone({
  id,
  accept,
  active,
  className,
  children,
}: {
  id: string
  accept: string
  active: boolean
  className?: string
  children?: React.ReactNode
}) {
  const { isOver, setNodeRef } = useDroppable({ id, data: { accept } })
  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-xl border-2 border-dashed transition-colors flex items-center justify-center ${
        isOver
          ? 'border-amber-500 bg-amber-100 dark:bg-amber-950 scale-105'
          : active
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
            : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900'
      } ${className ?? ''}`}
    >
      {children}
    </div>
  )
}

// Helper para evitar import circular
// (no longer needed - we import directly)
