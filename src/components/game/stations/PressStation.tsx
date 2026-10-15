'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { useStationStore } from '@/game/store/stationStore'
import { useGameStore } from '@/game/store/gameStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useEventStore } from '@/game/store/eventStore'
import { audio } from '@/lib/audio'
import { CABLE_COLOR_HEX, CABLE_COLOR_LABEL, TERMINAL_LABEL } from '@/game/constants'
import {
  Wrench,
  Scan,
  Cable as CableIcon,
  TerminalSquare,
  Hammer,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react'
import type { Cable, Terminal as TerminalType } from '@/game/types'

const APPLICATOR_TYPES = ['FT-250-A', 'FT-110-A', 'RING-8-A']

export function PressStation() {
  const applicator = useStationStore((s) => s.pressApplicator)
  const scannerDone = useStationStore((s) => s.pressScannerDone)
  const cable = useStationStore((s) => s.pressCable)
  const terminal = useStationStore((s) => s.pressTerminal)
  const setApplicator = useStationStore((s) => s.setPressApplicator)
  const setScannerDone = useStationStore((s) => s.setPressScannerDone)
  const setCable = useStationStore((s) => s.setPressCable)
  const setTerminal = useStationStore((s) => s.setPressTerminal)
  const clearPress = useStationStore((s) => s.clearPressStation)
  const ticket = useGameStore((s) => s.currentTicket)

  const [pressing, setPressing] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [showScanning, setShowScanning] = useState(false)
  const scanTimerRef = useRef<NodeJS.Timeout | null>(null)

  const isApplicatorValid = !applicator || isApplicatorCorrect(applicator, ticket)
  const canPress = applicator && scannerDone && cable && terminal && !pressed

  const handleScan = () => {
    if (!applicator || scannerDone) return
    setShowScanning(true)
    setScanProgress(0)
    audio.play('ultrasonic-hum', { volume: 0.3 })
    if (scanTimerRef.current) clearInterval(scanTimerRef.current)
    scanTimerRef.current = setInterval(() => {
      setScanProgress((p) => {
        const np = p + 0.1
        if (np >= 1) {
          if (scanTimerRef.current) clearInterval(scanTimerRef.current)
          // Defer store updates to next tick to avoid "update during render" warning
          setTimeout(() => {
            setShowScanning(false)
            setScannerDone(true)
            audio.play('click-ok')
            useEventStore.getState().setSubtitle(
              '✓ Tool ID validado',
              'text-emerald-500',
              2000,
            )
          }, 0)
          return 1
        }
        return np
      })
    }, 100)
  }

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current)
    }
  }, [])

  const handlePress = () => {
    if (!canPress) return
    setPressing(true)
    audio.play('press-thunk')

    setTimeout(() => {
      setPressing(false)
      setPressed(true)

      const game = useGameStore.getState()
      const inv = useInventoryStore.getState()
      const event = useEventStore.getState()

      if (!isApplicatorValid) {
        // Aplicador incorrecto → falla
        audio.play('buzz-fail')
        game.loseTime(5)
        game.addScore(-100)
        game.registerError()
        game.breakCombo()
        event.setSubtitle(
          '❌ Aplicador equivocado. ¡Cable mal crimpado!',
          'text-red-500',
          4000,
        )
        // trigger maintenance
        event.spawnMaintenance()
        // Mover cable defectuoso al WIP
        if (cable) {
          inv.moveToWip({ ...cable, terminalA: 'NONE', terminalB: 'NONE', origin: 'wip' })
        }
      } else {
        // Éxito
        audio.play('click-ok')
        audio.play('combo-chime')
        game.addScore(70)
        game.addTime(4)
        game.bumpCombo()
        game.resetConsecutiveErrors()
        event.setSubtitle(
          '✓ ¡Cable prensado correctamente!',
          'text-emerald-500',
          2000,
        )
        // Mover cable prensado al WIP con terminal aplicado
        if (cable && terminal) {
          const prensedCable: Cable = {
            ...cable,
            terminalA: terminal.type,
            terminalB: 'NONE',
            origin: 'wip',
          }
          inv.moveToWip(prensedCable)
        }
      }

      setTimeout(() => {
        clearPress()
        setPressed(false)
      }, 1200)
    }, 600)
  }

  // Clear state when applicator changes (reset scanner)
  useEffect(() => {
    if (applicator === null && scannerDone) {
      setScannerDone(false)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScanProgress(0)
    }
  }, [applicator, scannerDone, setScannerDone])

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="text-xs font-mono text-stone-500 dark:text-stone-400 flex items-center gap-2">
        <span>1. Aplicador</span>
        <span className="text-stone-300">→</span>
        <span>2. Escanea Tool ID</span>
        <span className="text-stone-300">→</span>
        <span>3. Cable + Terminal</span>
        <span className="text-stone-300">→</span>
        <span>4. PRENSAR</span>
      </div>

      {/* Máquina prensa */}
      <div className="relative bg-stone-200 dark:bg-stone-950 rounded-xl border-2 border-stone-400 dark:border-stone-700 overflow-hidden p-4 flex flex-col gap-3">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-stone-500 to-amber-400" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={pressing ? { rotate: [-2, 2, -2, 0] } : {}}
              transition={{ duration: 0.3, repeat: pressing ? Infinity : 0 }}
              className="w-8 h-8 rounded bg-amber-600 flex items-center justify-center"
            >
              <Wrench className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
                Prensa
              </div>
              <div className="font-bold text-sm">Hydraulic Crimper</div>
            </div>
          </div>
          {pressed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-bold ${
                isApplicatorValid
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500'
                  : 'bg-red-500/20 text-red-500 border border-red-500'
              }`}
            >
              {isApplicatorValid ? (
                <><CheckCircle2 className="w-3 h-3" /> PRENSADO</>
              ) : (
                <><AlertTriangle className="w-3 h-3" /> FALLIDO</>
              )}
            </motion.div>
          )}
        </div>

        {/* Selector de aplicador */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-1">
            Aplicador (selecciona)
          </div>
          <div className="grid grid-cols-3 gap-2">
            {APPLICATOR_TYPES.map((a) => {
              const isCorrect = isApplicatorCorrect(a, ticket)
              const isSelected = applicator === a
              return (
                <motion.button
                  key={a}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setApplicator(a)
                    setScannerDone(false)
                    setScanProgress(0)
                    audio.play('click-ok', { volume: 0.5 })
                  }}
                  disabled={pressing || pressed}
                  className={`p-2 rounded-lg border-2 font-mono font-bold text-[10px] transition-colors ${
                    isSelected
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                      : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-amber-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {a}
                </motion.button>
              )
            })}
          </div>
          {ticket && (
            <div className="text-[10px] font-mono text-stone-500 mt-1 text-center">
              Sugerido: {suggestApplicator(ticket)} · Aceptar sólo: {TERMINAL_LABEL[ticket.terminalA]}
            </div>
          )}
        </div>

        {/* Scanner Tool ID */}
        <div className="bg-stone-100 dark:bg-stone-900 rounded-lg p-3 border-2 border-stone-300 dark:border-stone-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Scan className={`w-4 h-4 ${scannerDone ? 'text-emerald-500' : 'text-stone-500'}`} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
                Scanner Tool ID
              </span>
            </div>
            {scannerDone && (
              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-500 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                VALIDADO
              </div>
            )}
          </div>
          {showScanning ? (
            <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded overflow-hidden relative">
              <motion.div
                className="h-full bg-amber-500"
                animate={{ width: `${scanProgress * 100}%` }}
              />
              <motion.div
                animate={{ x: ['0%', '100%', '0%'] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"
              />
            </div>
          ) : (
            <motion.button
              whileHover={applicator && !scannerDone ? { scale: 1.02 } : {}}
              whileTap={applicator && !scannerDone ? { scale: 0.98 } : {}}
              onClick={handleScan}
              disabled={!applicator || scannerDone || pressing || pressed}
              className="w-full px-3 py-2 bg-stone-700 hover:bg-stone-600 disabled:bg-stone-400 disabled:cursor-not-allowed text-white text-xs font-mono font-bold rounded flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4" />
              {scannerDone ? 'ESCANEADO ✓' : 'ESCANEAR TOOL ID'}
            </motion.button>
          )}
        </div>

        {/* Dropzones para cable y terminal */}
        <div className="grid grid-cols-2 gap-2">
          <PressDropZone id="press-cable" accept="cable" active={!!cable} label="Cable" icon={<CableIcon className="w-6 h-6" />}>
            {cable ? <CableVisual cable={cable} /> : null}
          </PressDropZone>
          <PressDropZone id="press-term" accept="terminal" active={!!terminal} label="Terminal" icon={<TerminalSquare className="w-6 h-6" />}>
            {terminal ? <TerminalVisual terminal={terminal} /> : null}
          </PressDropZone>
        </div>

        {/* Botón PRENSAR */}
        <div className="flex justify-center pt-2">
          <motion.button
            whileHover={canPress ? { scale: 1.05 } : {}}
            whileTap={canPress ? { scale: 0.95 } : {}}
            onClick={handlePress}
            disabled={!canPress}
            className="relative px-10 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-400 text-white font-black text-lg rounded-lg flex items-center gap-3 shadow-2xl overflow-hidden"
          >
            {canPress && !pressing && !pressed && (
              <motion.div
                animate={{ boxShadow: ['0 0 0 0 rgba(245,158,11,0.6)', '0 0 0 12px rgba(245,158,11,0)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-lg"
              />
            )}
            <motion.div
              animate={pressing ? { y: [0, 6, 0] } : {}}
              transition={{ duration: 0.3, repeat: pressing ? Infinity : 0 }}
            >
              <Hammer className="w-6 h-6" />
            </motion.div>
            <span className="relative">
              {pressing ? 'PRENSANDO...' : pressed ? 'COMPLETADO ✓' : 'PRENSAR'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Basura */}
      <div className="flex justify-center">
        <PressDropZone id="trash" accept="any" active={false} className="w-40 h-10" label="" icon={<Trash2 className="w-4 h-4" />}>
          <div className="text-xs font-mono text-stone-500">🗑 Basura</div>
        </PressDropZone>
      </div>
    </div>
  )
}

function isApplicatorCorrect(applicator: string, ticket: TicketShape | null): boolean {
  if (!ticket) return true
  if (applicator === 'FT-250-A') return ticket.terminalA === 'FASTON-250'
  if (applicator === 'FT-110-A') return ticket.terminalA === 'FASTON-110'
  if (applicator === 'RING-8-A') return ticket.terminalA === 'RING-#8'
  return false
}

function suggestApplicator(ticket: TicketShape | null): string {
  if (!ticket) return '—'
  switch (ticket.terminalA) {
    case 'FASTON-250':
      return 'FT-250-A'
    case 'FASTON-110':
      return 'FT-110-A'
    case 'RING-#8':
      return 'RING-8-A'
    default:
      return '—'
  }
}

type TicketShape = {
  terminalA: 'FASTON-250' | 'FASTON-110' | 'RING-#8' | 'NONE'
}

function CableVisual({ cable }: { cable: Cable }) {
  const colorHex = CABLE_COLOR_HEX[cable.color]
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        initial={{ scale: 0.5, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        className="w-12 h-3 rounded-full border-2 border-stone-700"
        style={{ background: colorHex }}
      />
      <div className="text-[9px] font-mono text-stone-700 dark:text-stone-200">
        {CABLE_COLOR_LABEL[cable.color]} {cable.gauge} · {cable.length_mm}mm
      </div>
    </div>
  )
}

function TerminalVisual({ terminal }: { terminal: TerminalType }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 40 24" className="w-10 h-7 text-stone-700 dark:text-stone-300">
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

function PressDropZone({
  id,
  accept,
  active,
  className,
  label,
  icon,
  children,
}: {
  id: string
  accept: string
  active: boolean
  className?: string
  label: string
  icon: React.ReactNode
  children?: React.ReactNode
}) {
  const { isOver, setNodeRef } = useDroppable({ id, data: { accept } })
  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 min-h-[80px] ${
        isOver
          ? 'border-amber-500 bg-amber-100 dark:bg-amber-950 scale-105'
          : active
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
            : 'border-stone-300 dark:border-stone-700 border-dashed bg-stone-50 dark:bg-stone-900'
      } ${className ?? ''}`}
    >
      {!active && (
        <>
          <div className="text-stone-400">{icon}</div>
          {label && (
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              {label}
            </div>
          )}
        </>
      )}
      {children}
    </div>
  )
}
