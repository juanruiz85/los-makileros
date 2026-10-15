'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { T } from '@/lib/i18n'
import { Card } from '@/components/ui/card'
import { CABLE_COLOR_HEX, CABLE_COLOR_LABEL, TERMINAL_LABEL } from '@/game/constants'
import { isTerminalRequired } from '@/lib/tickets'
import { RefreshCw, Recycle, Package2 } from 'lucide-react'

export function TicketPanel() {
  const ticket = useGameStore((s) => s.currentTicket)
  const setupChanged = useGameStore((s) => s.setupChanged)
  const reportCompleted = useGameStore((s) => s.reportTicketCompleted)

  return (
    <Card className="h-full flex flex-col bg-amber-50 dark:bg-stone-900 border-2 border-amber-500 shadow-xl">
      {/* Header Garnet */}
      <div className="flex items-center justify-between px-3 py-2 bg-amber-500 text-stone-900 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-700 rounded-full animate-pulse" />
          <span className="font-mono font-bold text-xs uppercase tracking-widest">
            Programa Garnet
          </span>
        </div>
        <Package2 className="w-4 h-4" />
      </div>

      {ticket ? (
        <motion.div
          key={ticket.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-3 flex-1 flex flex-col gap-2 overflow-y-auto custom-scroll"
        >
          {/* Part number */}
          <div className="text-center pb-2 border-b border-amber-300 dark:border-stone-700">
            <div className="text-[10px] font-mono uppercase text-stone-500 dark:text-stone-400">
              Ticket / Part Number
            </div>
            <div className="font-mono font-black text-xl text-stone-900 dark:text-amber-300">
              {ticket.partNumber}
            </div>
            <div className="flex flex-wrap justify-center gap-1 mt-1">
              {ticket.variantLabel && ticket.variant !== 'standard' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    ticket.variant === 'rush'
                      ? 'bg-red-500 text-white animate-pulse'
                      : ticket.variant === 'bulk'
                        ? 'bg-blue-500 text-white'
                        : ticket.variant === 'splice-heavy'
                          ? 'bg-purple-500 text-white'
                          : ticket.variant === 'no-terminal'
                            ? 'bg-stone-500 text-white'
                            : ticket.variant === 'long-roll'
                              ? 'bg-cyan-500 text-white'
                              : 'bg-stone-500 text-white'
                  }`}
                >
                  {ticket.variantLabel}
                </motion.div>
              )}
              {ticket.sameSetupAsPrevious && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold">
                  <Recycle className="w-3 h-3" /> Setup Ahorrable
                </div>
              )}
            </div>
          </div>

          {/* Datos del ticket */}
          <DataRow label="Color de cable">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded border border-stone-400"
                style={{ background: CABLE_COLOR_HEX[ticket.cableColor] }}
              />
              <span className="font-mono font-bold">
                {CABLE_COLOR_LABEL[ticket.cableColor]}
              </span>
            </div>
          </DataRow>

          <DataRow label="Gauge (calibre)">
            <span className="font-mono font-bold text-lg">{ticket.cableGauge} AWG</span>
          </DataRow>

          <DataRow label="Longitud">
            <span className="font-mono font-bold text-lg">{ticket.length_mm} mm</span>
          </DataRow>

          <DataRow label="Circuitos">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-2xl">{ticket.circuitCount}</span>
              <span className={`text-[10px] font-bold ${
                isTerminalRequired(ticket.circuitCount)
                  ? 'text-red-500'
                  : 'text-stone-400'
              }`}>
                {isTerminalRequired(ticket.circuitCount) ? 'TERMINAL OBLIGATORIO' : 'terminal opcional'}
              </span>
            </div>
          </DataRow>

          <DataRow label="Terminal A">
            <span className={`font-mono font-bold ${
              ticket.terminalA === 'NONE' ? 'text-stone-400' : 'text-stone-900 dark:text-amber-300'
            }`}>
              {TERMINAL_LABEL[ticket.terminalA]}
            </span>
          </DataRow>

          <DataRow label="Terminal B">
            <span className={`font-mono font-bold ${
              ticket.terminalB === 'NONE' ? 'text-stone-400' : 'text-stone-900 dark:text-amber-300'
            }`}>
              {TERMINAL_LABEL[ticket.terminalB]}
            </span>
          </DataRow>

          {/* Procesos */}
          <div className="grid grid-cols-2 gap-1 pt-2 border-t border-amber-300 dark:border-stone-700">
            <ProcessBadge label="Splice" required={ticket.needsSplice} />
            <ProcessBadge label="Harness" required={ticket.needsHarness} />
          </div>

          {/* Puntos y bonus */}
          <div className="mt-auto pt-2 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-500">Puntos base</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{ticket.baseScore}
              </span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-500">Bonus tiempo</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                +{ticket.timeBonusOnComplete}s
              </span>
            </div>
            {setupChanged && (
              <div className="flex justify-between text-xs font-mono">
                <span className="text-red-500">Cambio de setup</span>
                <span className="text-stone-500">0 bonus</span>
              </div>
            )}
          </div>

          {/* Botón Reportar */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={reportCompleted}
            className="mt-2 w-full px-3 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            {T.hud.report}
          </motion.button>
        </motion.div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-stone-400 p-4">
          Sin ticket activo
        </div>
      )}
    </Card>
  )
}

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-stone-500 dark:text-stone-400 font-mono uppercase tracking-wide">
        {label}
      </span>
      {children}
    </div>
  )
}

function ProcessBadge({ label, required }: { label: string; required: boolean }) {
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase ${
        required
          ? 'bg-amber-200 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold'
          : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
      }`}
    >
      <span>{label}</span>
      <span>{required ? 'SÍ' : 'no'}</span>
    </div>
  )
}
