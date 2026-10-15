'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { useStationStore } from '@/game/store/stationStore'
import { useGameStore } from '@/game/store/gameStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useEventStore } from '@/game/store/eventStore'
import { audio } from '@/lib/audio'
import { Grid3x3, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Cable } from '@/game/types'

const HARNESS_SLOTS = 5 // para tickets con needsHarness

export function HarnessStation() {
  const board = useStationStore((s) => s.harnessBoard)
  const setHarnessBoard = useStationStore((s) => s.setHarnessBoard)
  const harnessTested = useStationStore((s) => s.harnessTested)
  const harnessTestResult = useStationStore((s) => s.harnessTestResult)
  const clearHarnessStation = useStationStore((s) => s.clearHarnessStation)
  const ticket = useGameStore((s) => s.currentTicket)
  const wip = useInventoryStore((s) => s.wip)

  // Initialize board when entering harness (or ticket changes)
  useEffect(() => {
    if (ticket && ticket.needsHarness && board.length === 0) {
      const slots = Array.from({ length: HARNESS_SLOTS }).map((_, i) => ({
        slot: `C${i + 1}`,
      }))
      setHarnessBoard(slots)
    }
    if (!ticket?.needsHarness && board.length > 0) {
      clearHarnessStation()
    }
  }, [ticket, board.length, setHarnessBoard, clearHarnessStation])

  const filled = board.filter((s) => s.circuitId).length
  const required = board.length
  const allFilled = filled >= required && required > 0

  // Auto-drop helper: clicks first WIP cable into next empty slot (for accessibility/testing)
  const handleQuickFill = () => {
    if (allFilled || wip.length === 0) return
    const firstWipCable = wip.find((i) => (i as Cable).cut) as Cable | undefined
    if (!firstWipCable) return
    const board2 = [...board]
    const emptyIdx = board2.findIndex((s) => !s.circuitId)
    if (emptyIdx === -1) return
    useInventoryStore.getState().removeFromWip(firstWipCable.id)
    board2[emptyIdx] = { ...board2[emptyIdx], circuitId: firstWipCable.id, correct: true }
    setHarnessBoard(board2)
    audio.play('click-ok')
  }

  const handleTest = () => {
    if (!allFilled) {
      audio.play('buzz-fail')
      useEventStore.getState().setSubtitle(
        `⚠ Faltan ${required - filled} circuitos`,
        'text-amber-500',
        3000
      )
      return
    }
    const station = useStationStore.getState()
    station.setHarnessTested(true)
    station.setHarnessTestResult('passed')
    audio.play('combo-chime')
    audio.play('ticket-done')
    const game = useGameStore.getState()
    game.addScore(200)
    game.addTime(10)
    game.bumpCombo()
    game.resetConsecutiveErrors()
    useEventStore.getState().setSubtitle(
      '✅ ¡Prueba eléctrica OK! Ticket cerrado',
      'text-emerald-500',
      3500
    )
    setTimeout(() => {
      useStationStore.getState().clearHarnessStation()
    }, 2000)
  }

  if (!ticket?.needsHarness) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-3">
        <Grid3x3 className="w-16 h-16" />
        <div className="text-sm font-mono uppercase tracking-widest">
          Este ticket no requiere harness
        </div>
        <div className="text-xs">Solo corta o presiona REPORTAR TERMINADO</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="text-xs font-mono text-stone-500 dark:text-stone-400 flex items-center justify-between">
        <span>Arrastra cada circuito del WIP a un conector</span>
        <button
          onClick={handleQuickFill}
          disabled={allFilled || wip.length === 0}
          className="px-2 py-0.5 text-[10px] bg-stone-700 text-amber-400 rounded hover:bg-stone-600 disabled:opacity-40 font-mono uppercase tracking-widest"
        >
          ⚡ Auto-rellenar
        </button>
      </div>

      {/* Tablero harness con slots individuales arrastrables */}
      <div className="bg-stone-100 dark:bg-stone-950 rounded-xl border-2 border-stone-300 dark:border-stone-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center">
              <Grid3x3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
                Tablero
              </div>
              <div className="font-bold text-sm">Harness Connectors</div>
            </div>
          </div>
          <div className="text-xs font-mono">
            <span className={allFilled ? 'text-emerald-500 font-bold' : 'text-stone-500'}>
              {filled}
            </span>
            <span className="text-stone-400"> / {required}</span>
          </div>
        </div>

        {/* Grid de conectores - cada uno es un dropzone individual */}
        <div className="grid grid-cols-5 gap-2">
          {board.map((slot, idx) => (
            <ConnectorSlot
              key={slot.slot}
              slot={slot}
              idx={idx}
              circuitId={slot.circuitId}
              correct={slot.correct}
              onDrop={(cable) => {
                const board2 = [...board]
                board2[idx] = { ...slot, circuitId: cable.id, correct: true }
                setHarnessBoard(board2)
                audio.play('click-ok')
              }}
            />
          ))}
        </div>
      </div>

      {/* Máquina de prueba eléctrica */}
      <div
        className={`relative rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${
          harnessTested
            ? harnessTestResult === 'passed'
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
              : 'border-red-500 bg-red-50 dark:bg-red-950'
            : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={
              harnessTestResult === 'failed'
                ? { x: [-5, 5, -5, 5, 0] }
                : { rotate: [0, -5, 5, 0] }
            }
            transition={{ duration: 0.5, repeat: harnessTested ? Infinity : 0 }}
            className="w-12 h-12 rounded-full bg-stone-900 dark:bg-stone-200 flex items-center justify-center"
          >
            <Zap className={`w-7 h-7 ${harnessTestResult === 'passed' ? 'text-emerald-400' : 'text-amber-400'}`} />
          </motion.div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
              Prueba Eléctrica
            </div>
            <div className="font-bold text-sm">Continuity Tester</div>
          </div>
        </div>

        {/* Botón rojo TEST */}
        <motion.button
          whileHover={allFilled && !harnessTested ? { scale: 1.05 } : {}}
          whileTap={allFilled && !harnessTested ? { scale: 0.95 } : {}}
          onClick={handleTest}
          disabled={!allFilled || harnessTested}
          className="relative px-8 py-6 rounded-full bg-red-600 hover:bg-red-700 disabled:bg-stone-400 text-white font-black shadow-2xl"
        >
          <motion.div
            animate={
              allFilled && !harnessTested
                ? { boxShadow: ['0 0 0 0 rgba(220,38,38,0.6)', '0 0 0 12px rgba(220,38,38,0)'] }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
          />
          <span className="relative text-2xl">TEST</span>
        </motion.button>

        <AnimatePresence>
          {harnessTestResult === 'passed' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-emerald-500 font-bold text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              ¡CONFORME! Ticket cerrado
            </motion.div>
          )}
          {harnessTestResult === 'failed' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-500 font-bold text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              ¡BUZZ! Faltan circuitos
            </motion.div>
          )}
        </AnimatePresence>

        {!allFilled && (
          <div className="text-[10px] font-mono text-amber-500">
            Completa {required - filled} circuito(s) más
          </div>
        )}
      </div>

      {/* Basura */}
      <DropZone id="trash" accept="any" active={false} className="w-40 h-10 self-center">
        <div className="text-xs font-mono text-stone-500">🗑 Basura</div>
      </DropZone>
    </div>
  )
}

function ConnectorSlot({
  slot,
  idx,
  circuitId,
  onDrop,
}: {
  slot: { slot: string; circuitId?: string; correct?: boolean }
  idx: number
  circuitId?: string
  correct?: boolean
  onDrop: (cable: Cable) => void
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `harness-slot-${slot.slot}`,
    data: { accept: 'cable' },
  })

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    // Try to read the cable from drag data (browser drag-and-drop fallback)
    // For dnd-kit, the actual drop is handled by the global DndContext
  }

  return (
    <motion.div
      ref={setNodeRef}
      onDrop={handleDrop}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: idx * 0.05 }}
      className={`relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${
        circuitId
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
          : isOver
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950 scale-105'
            : 'border-stone-400 dark:border-stone-600 border-dashed bg-stone-50 dark:bg-stone-900'
      }`}
    >
      <div className="text-[10px] font-mono text-stone-500 absolute top-1 left-1">
        {slot.slot}
      </div>
      {circuitId ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <CheckCircle2 className="w-7 h-7 text-emerald-500" />
        </motion.div>
      ) : (
        <div className="text-stone-400">
          <Grid3x3 className="w-6 h-6 opacity-50" />
        </div>
      )}
    </motion.div>
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
      className={`relative rounded-lg border-2 border-dashed transition-all flex items-center justify-center ${
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
