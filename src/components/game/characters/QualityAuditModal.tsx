'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDraggable, useDroppable, DndContext } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useEventStore } from '@/game/store/eventStore'
import { useGameStore } from '@/game/store/gameStore'
import { audio } from '@/lib/audio'
import { ClipboardCheck, AlertTriangle, CheckCircle2, Trash2, Clock } from 'lucide-react'
import { CABLE_COLOR_HEX } from '@/game/constants'
import type { CableColor } from '@/game/types'

interface AuditCircuit {
  id: string
  color: CableColor
  hasError: boolean
  errorType?: 'wrong-color' | 'broken' | 'no-terminal'
}

const COLORS: CableColor[] = ['red', 'black', 'yellow', 'green', 'white']
let auditSeq = 0

function generateCircuits(): AuditCircuit[] {
  const pick = () => COLORS[Math.floor(Math.random() * COLORS.length)]
  const errorIdx = Math.floor(Math.random() * 3)
  const errorType = (['wrong-color', 'broken', 'no-terminal'] as const)[Math.floor(Math.random() * 3)]
  return Array.from({ length: 3 }).map((_, i) => ({
    id: `audit-${Date.now().toString(36)}-${auditSeq++}`,
    color: pick(),
    hasError: i === errorIdx,
    errorType: i === errorIdx ? errorType : undefined,
  }))
}

export function QualityAuditModal() {
  const activeEvents = useEventStore((s) => s.activeEvents)
  const resolveEvent = useEventStore((s) => s.resolveEvent)
  const addScore = useGameStore((s) => s.addScore)
  const bumpCombo = useGameStore((s) => s.bumpCombo)
  const breakCombo = useGameStore((s) => s.breakCombo)
  const resetConsecutiveErrors = useGameStore((s) => s.resetConsecutiveErrors)

  const auditEvent = activeEvents.find(
    (e) => e.kind === 'quality-audit' && !e.resolved
  )

  const [circuits, setCircuits] = useState<AuditCircuit[]>([])
  const [result, setResult] = useState<'none' | 'passed' | 'failed'>('none')
  const lastEventIdRef = useRef<string | null>(null)
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize circuits when new audit event
  useEffect(() => {
    if (!auditEvent) return
    if (lastEventIdRef.current === auditEvent.id) return
    lastEventIdRef.current = auditEvent.id
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCircuits(generateCircuits())
    setResult('none')
    useGameStore.getState().setTimerFrozen(true)
  }, [auditEvent?.id])

  // Cleanup
  useEffect(() => {
    return () => {
      useGameStore.getState().setTimerFrozen(false)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  if (!auditEvent) return null

  const handleDrop = (circuitId: string) => {
    if (result !== 'none') return
    const circuit = circuits.find((c) => c.id === circuitId)
    if (!circuit) return

    if (circuit.hasError) {
      // Correct! Found the faulty one
      audio.play('combo-chime')
      audio.play('ticket-done')
      addScore(50)
      bumpCombo()
      resetConsecutiveErrors()
      setResult('passed')
      useEventStore.getState().setSubtitle(
        '✓ Conforme. ¡Buen ojo!',
        'text-emerald-500',
        3000,
      )
    } else {
      // Wrong! Dragged a good one
      audio.play('buzz-fail')
      addScore(-75)
      breakCombo()
      useGameStore.getState().registerError()
      setResult('failed')
      useEventStore.getState().setSubtitle(
        '✗ No Conformidad. Identificaste el circuito incorrecto.',
        'text-red-500',
        4000,
      )
    }

    closeTimerRef.current = setTimeout(() => {
      if (auditEvent) resolveEvent(auditEvent.id)
      useGameStore.getState().setTimerFrozen(false)
    }, 1800)
  }

  return (
    <AnimatePresence>
      {auditEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="bg-stone-900 border-2 border-purple-500 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [-3, 3, -3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center"
                >
                  <ClipboardCheck className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-purple-400">
                    Auditoría de Calidad
                  </div>
                  <div className="text-lg font-black text-stone-100">
                    El de Calidad llegó
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-stone-400 max-w-[140px] text-right">
                Quick Audit
              </div>
            </div>

            {/* Instruction */}
            <div className="mb-4 text-sm text-stone-300 font-mono text-center">
              {result === 'none' && (
                <>
                  <div className="text-stone-300">
                    <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-400" />
                    Identifica el circuito defectuoso y arrástralo a la basura
                  </div>
                </>
              )}
              {result === 'passed' && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center gap-2 text-emerald-400 font-bold"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  ¡CONFORME!
                </motion.div>
              )}
              {result === 'failed' && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center gap-2 text-red-400 font-bold"
                >
                  <AlertTriangle className="w-5 h-5" />
                  NO CONFORMIDAD
                </motion.div>
              )}
            </div>

            {/* Circuit grid */}
            {result === 'none' && (
              <DndContext
                onDragEnd={(event) => {
                  const { active, over } = event
                  if (!over) return
                  if (over.id === 'audit-trash') {
                    handleDrop(active.id as string)
                  }
                }}
              >
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {circuits.map((c) => (
                    <AuditCircuitCard key={c.id} circuit={c} />
                  ))}
                </div>
                {/* Trash dropzone */}
                <div className="flex justify-center">
                  <AuditTrashZone />
                </div>
              </DndContext>
            )}

            {/* Result state visualization */}
            {result !== 'none' && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {circuits.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-2 p-2 ${
                      c.hasError
                        ? result === 'passed'
                          ? 'border-red-500 bg-red-500/20'
                          : 'border-amber-500 bg-amber-500/20'
                        : 'border-stone-600 bg-stone-800/50'
                    }`}
                  >
                    <div className="relative">
                      <div
                        className="w-12 h-3 rounded-full border border-stone-700"
                        style={{ background: CABLE_COLOR_HEX[c.color] }}
                      />
                      {c.errorType === 'broken' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-red-500 rotate-12" />
                      )}
                      {c.errorType === 'no-terminal' && (
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 text-[8px]">
                          🚫
                        </div>
                      )}
                      {c.errorType === 'wrong-color' && (
                        <div className="absolute -top-2 -right-1 text-[8px]">❌</div>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-stone-400">
                      {c.hasError ? 'DEFECTUOSO' : 'OK'}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Hint */}
            {result === 'none' && (
              <div className="mt-3 text-center text-[10px] font-mono text-stone-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                La auditoría congela el timer. ¡Identifica el error rápido!
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AuditCircuitCard({ circuit }: { circuit: AuditCircuit }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: circuit.id,
    data: { kind: 'circuit' },
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      className="aspect-square rounded-lg border-2 border-stone-600 bg-stone-800 flex flex-col items-center justify-center gap-2 p-2 hover:border-purple-400 hover:bg-stone-700 transition-colors"
    >
      <div className="relative">
        {/* Cable visual */}
        <div
          className="w-12 h-3 rounded-full border border-stone-700"
          style={{ background: CABLE_COLOR_HEX[circuit.color] }}
        />
        {/* Hidden error indicators */}
        {circuit.errorType === 'broken' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-red-500 rotate-12" />
        )}
        {circuit.errorType === 'no-terminal' && (
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 text-[8px]">🚫</div>
        )}
        {circuit.errorType === 'wrong-color' && (
          <div className="absolute -top-2 -right-1 text-[8px]">❌</div>
        )}
      </div>
      <div className="text-[9px] font-mono text-stone-400 uppercase">
        Circuito
      </div>
    </motion.div>
  )
}

function AuditTrashZone() {
  const { isOver, setNodeRef } = useDroppable({ id: 'audit-trash' })
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col items-center justify-center gap-1 px-8 py-4 rounded-lg border-2 border-dashed transition-all ${
        isOver
          ? 'border-red-500 bg-red-500/20 scale-105'
          : 'border-stone-500 bg-stone-800/50'
      }`}
    >
      <Trash2 className={`w-8 h-8 ${isOver ? 'text-red-400' : 'text-stone-400'}`} />
      <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
        Arrastra aquí
      </div>
      <div className="text-[8px] font-mono text-stone-500">(solo el defectuoso)</div>
    </div>
  )
}
