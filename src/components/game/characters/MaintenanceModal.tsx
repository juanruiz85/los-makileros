'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable, DndContext } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useEventStore } from '@/game/store/eventStore'
import { useGameStore } from '@/game/store/gameStore'
import { audio } from '@/lib/audio'
import { Wrench, Hammer, PenTool, AlertTriangle } from 'lucide-react'

const TOOLS = [
  { id: 'wrench', name: 'Llave', icon: Wrench, slot: 'slot-1' },
  { id: 'hammer', name: 'Martillo', icon: Hammer, slot: 'slot-2' },
  { id: 'screwdriver', name: 'Desarmador', icon: PenTool, slot: 'slot-3' },
]

export function MaintenanceModal() {
  const activeEvents = useEventStore((s) => s.activeEvents)
  const resolveEvent = useEventStore((s) => s.resolveEvent)
  const loseTime = useGameStore((s) => s.loseTime)

  const maintenanceEvent = activeEvents.find(
    (e) => e.kind === 'maintenance' && !e.resolved
  )

  const [placed, setPlaced] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(8)
  const [failed, setFailed] = useState(false)
  const [completed, setCompleted] = useState(false)
  const lastEventIdRef = useRef<string | null>(null)
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Reset state when new event (only when id changes)
  useEffect(() => {
    if (!maintenanceEvent) return
    if (lastEventIdRef.current === maintenanceEvent.id) return
    lastEventIdRef.current = maintenanceEvent.id
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaced(new Set())
    setTimeLeft(8)
    setFailed(false)
    setCompleted(false)
  }, [maintenanceEvent?.id])

  // Freeze/unfreeze based on modal state
  useEffect(() => {
    const isActive = !!maintenanceEvent && !completed && !failed
    useGameStore.getState().setTimerFrozen(isActive)
    return () => {
      useGameStore.getState().setTimerFrozen(false)
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current)
    }
  }, [maintenanceEvent, completed, failed])

  // Countdown
  useEffect(() => {
    if (!maintenanceEvent || completed || failed) return
    if (timeLeft <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFailed(true)
      loseTime(15)
      audio.play('buzz-fail')
      completionTimerRef.current = setTimeout(() => {
        if (maintenanceEvent) resolveEvent(maintenanceEvent.id)
        useGameStore.getState().setTimerFrozen(false)
      }, 1500)
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [maintenanceEvent, timeLeft, completed, failed, loseTime, resolveEvent])

  if (!maintenanceEvent) return null

  const handleDrop = (toolId: string, slotId: string) => {
    const tool = TOOLS.find((t) => t.id === toolId)
    if (!tool) return
    if (tool.slot !== slotId) {
      audio.play('buzz-fail')
      return
    }
    audio.play('click-ok')
    setPlaced((prev) => {
      const next = new Set(prev)
      next.add(toolId)
      if (next.size === TOOLS.length) {
        setCompleted(true)
        audio.play('combo-chime')
        completionTimerRef.current = setTimeout(() => {
          if (maintenanceEvent) resolveEvent(maintenanceEvent.id)
          useGameStore.getState().setTimerFrozen(false)
        }, 1200)
      }
      return next
    })
  }

  return (
    <AnimatePresence>
      {maintenanceEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-stone-900 border-2 border-orange-500 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center"
                >
                  <Wrench className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-orange-400">
                    Mantenimiento
                  </div>
                  <div className="text-lg font-black text-stone-100">El Chido llegó</div>
                </div>
              </div>
              {/* Countdown */}
              <div className={`px-3 py-1.5 rounded-lg font-mono font-black text-2xl ${
                timeLeft <= 3 ? 'bg-red-500 text-white animate-pulse' : 'bg-stone-800 text-amber-400'
              }`}>
                {timeLeft}s
              </div>
            </div>

            {/* Mensaje */}
            <div className="mb-4 text-sm text-stone-300 font-mono">
              {failed
                ? '❌ No le atinaste a tiempo. Te comes 15s.'
                : completed
                  ? '✅ ¡Máquina reparada! Puedes seguir.'
                  : 'Coloca cada herramienta en su contorno correcto:'}
            </div>

            {/* Estado fallido / éxito */}
            {(failed || completed) && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`text-center text-3xl font-black mb-3 ${failed ? 'text-red-500' : 'text-emerald-500'}`}
              >
                {failed ? 'FALLIDO' : 'REPARADO ✓'}
              </motion.div>
            )}

            {/* Slots y herramientas */}
            {!failed && !completed && (
              <DndContext
                onDragEnd={(event) => {
                  const { active, over } = event
                  if (!over) return
                  handleDrop(active.id as string, over.id as string)
                }}
              >
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {TOOLS.map((tool) => (
                    <ToolSlot
                      key={tool.slot}
                      id={tool.slot}
                      placed={placed.has(tool.id)}
                      tool={tool}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {TOOLS.filter((t) => !placed.has(t.id)).map((tool) => (
                    <Tool key={tool.id} tool={tool} />
                  ))}
                </div>
              </DndContext>
            )}

            {/* Hint */}
            {!failed && !completed && (
              <div className="mt-3 text-center text-[10px] font-mono text-stone-400 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Arrastra cada herramienta a su contorno
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ToolSlot({
  id,
  placed,
  tool,
}: {
  id: string
  placed: boolean
  tool: (typeof TOOLS)[number]
}) {
  const { isOver, setNodeRef } = useDroppable({ id })
  const Icon = tool.icon
  return (
    <div
      ref={setNodeRef}
      className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-colors ${
        placed
          ? 'border-emerald-500 bg-emerald-500/20'
          : isOver
            ? 'border-amber-500 bg-amber-500/20 border-dashed'
            : 'border-stone-600 border-dashed bg-stone-800/50'
      }`}
    >
      {placed ? (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Icon className="w-8 h-8 text-emerald-400" />
        </motion.div>
      ) : (
        <div className="w-10 h-10 rounded border-2 border-dashed border-stone-600 opacity-30" />
      )}
    </div>
  )
}

function Tool({ tool }: { tool: (typeof TOOLS)[number] }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tool.id,
    data: { kind: 'tool' },
  })
  const Icon = tool.icon
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  }
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="aspect-square rounded-lg bg-stone-700 border-2 border-stone-500 flex flex-col items-center justify-center gap-1 hover:bg-stone-600 transition-colors"
    >
      <Icon className="w-8 h-8 text-amber-400" />
      <div className="text-[10px] font-mono text-stone-300">{tool.name}</div>
    </motion.div>
  )
}
