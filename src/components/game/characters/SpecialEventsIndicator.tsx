'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEventStore } from '@/game/store/eventStore'
import { Eye, Flame } from 'lucide-react'

export function SpecialEventsIndicator() {
  const clientVisitActive = useEventStore((s) => s.clientVisitActive)
  const clientVisitUntil = useEventStore((s) => s.clientVisitUntil)
  const rampageActive = useEventStore((s) => s.supervisorRampageActive)
  const rampageUntil = useEventStore((s) => s.supervisorRampageUntil)
  const [, setTick] = React.useState(0)

  // Re-render every 500ms to update countdown
  React.useEffect(() => {
    if (!clientVisitActive && !rampageActive) return
    const interval = setInterval(() => setTick((t) => t + 1), 500)
    return () => clearInterval(interval)
  }, [clientVisitActive, rampageActive])

  const now = performance.now()
  const visitSecsLeft = Math.max(0, Math.ceil((clientVisitUntil - now) / 1000))
  const rampageSecsLeft = Math.max(0, Math.ceil((rampageUntil - now) / 1000))

  return (
    <div className="fixed top-20 left-4 z-[55] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {clientVisitActive && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="bg-emerald-500/90 backdrop-blur border-2 border-emerald-300 rounded-lg px-3 py-2 shadow-2xl flex items-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Eye className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-white/80">
                Visita del cliente
              </div>
              <div className="text-sm font-black text-white">
                Score x2 · {visitSecsLeft}s
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {rampageActive && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="bg-red-600/95 backdrop-blur border-2 border-yellow-400 rounded-lg px-3 py-2 shadow-2xl flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: [-5, 5, -5], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            >
              <Flame className="w-5 h-5 text-yellow-400" />
            </motion.div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-yellow-200">
                Supervisor rampage
              </div>
              <div className="text-sm font-black text-white">
                -2x errores · {rampageSecsLeft}s
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
