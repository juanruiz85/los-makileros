'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEventStore } from '@/game/store/eventStore'
import { Eye, Flame, Cookie, Zap, Crown } from 'lucide-react'

export function SpecialEventsIndicator() {
  const clientVisitActive = useEventStore((s) => s.clientVisitActive)
  const clientVisitUntil = useEventStore((s) => s.clientVisitUntil)
  const rampageActive = useEventStore((s) => s.supervisorRampageActive)
  const rampageUntil = useEventStore((s) => s.supervisorRampageUntil)
  const tacoDayActive = useEventStore((s) => s.tacoDayActive)
  const tacoDayUntil = useEventStore((s) => s.tacoDayUntil)
  const ceoVisitActive = useEventStore((s) => s.ceoVisitActive)
  const ceoVisitUntil = useEventStore((s) => s.ceoVisitUntil)
  const shortCircuitActive = useEventStore((s) => s.shortCircuitActive)
  const shortCircuitUntil = useEventStore((s) => s.shortCircuitUntil)
  const [, setTick] = React.useState(0)

  // Re-render every 500ms to update countdown
  React.useEffect(() => {
    const anyActive =
      clientVisitActive || rampageActive || tacoDayActive || ceoVisitActive || shortCircuitActive
    if (!anyActive) return
    const interval = setInterval(() => setTick((t) => t + 1), 500)
    return () => clearInterval(interval)
  }, [clientVisitActive, rampageActive, tacoDayActive, ceoVisitActive, shortCircuitActive])

  const now = performance.now()
  const visitSecsLeft = Math.max(0, Math.ceil((clientVisitUntil - now) / 1000))
  const rampageSecsLeft = Math.max(0, Math.ceil((rampageUntil - now) / 1000))
  const tacoSecsLeft = Math.max(0, Math.ceil((tacoDayUntil - now) / 1000))
  const ceoSecsLeft = Math.max(0, Math.ceil((ceoVisitUntil - now) / 1000))
  const shortCircuitSecsLeft = Math.max(0, Math.ceil((shortCircuitUntil - now) / 1000))

  return (
    <div className="fixed top-20 left-4 z-[55] flex flex-col gap-2 pointer-events-none max-w-[260px]">
      <AnimatePresence>
        {clientVisitActive && (
          <SpecialBadge
            key="client"
            color="emerald"
            icon={<Eye className="w-5 h-5 text-white" />}
            title="Visita del cliente"
            subtitle={`Score x2 · ${visitSecsLeft}s`}
          />
        )}
        {rampageActive && (
          <SpecialBadge
            key="rampage"
            color="red"
            icon={<Flame className="w-5 h-5 text-yellow-400" />}
            title="Supervisor rampage"
            subtitle={`-5s c/20s · ${rampageSecsLeft}s`}
            iconAnim="rotate"
          />
        )}
        {tacoDayActive && (
          <SpecialBadge
            key="taco"
            color="orange"
            icon={<Cookie className="w-5 h-5 text-white" />}
            title="¡Día del Taco!"
            subtitle={`Taco x ticket · ${tacoSecsLeft}s`}
            iconAnim="pulse"
          />
        )}
        {ceoVisitActive && (
          <SpecialBadge
            key="ceo"
            color="amber"
            icon={<Crown className="w-5 h-5 text-white" />}
            title="¡Visita del CEO!"
            subtitle={`Score x3 · ${ceoSecsLeft}s`}
            iconAnim="pulse"
          />
        )}
        {shortCircuitActive && (
          <SpecialBadge
            key="short"
            color="yellow"
            icon={<Zap className="w-5 h-5 text-stone-900" />}
            title="¡Cortocircuito!"
            subtitle={`Timer congelado · ${shortCircuitSecsLeft}s`}
            iconAnim="rotate"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface SpecialBadgeProps {
  color: 'emerald' | 'red' | 'orange' | 'amber' | 'yellow'
  icon: React.ReactNode
  title: string
  subtitle: string
  iconAnim?: 'pulse' | 'rotate' | 'none'
}

function SpecialBadge({ color, icon, title, subtitle, iconAnim = 'pulse' }: SpecialBadgeProps) {
  const colorMap = {
    emerald: 'bg-emerald-500/90 border-emerald-300',
    red: 'bg-red-600/95 border-yellow-400',
    orange: 'bg-orange-500/95 border-orange-300',
    amber: 'bg-amber-500/95 border-amber-300',
    yellow: 'bg-yellow-400/95 border-yellow-200',
  }
  const textColorMap = {
    emerald: 'text-white',
    red: 'text-white',
    orange: 'text-white',
    amber: 'text-white',
    yellow: 'text-stone-900',
  }
  const subColorMap = {
    emerald: 'text-white/80',
    red: 'text-yellow-200',
    orange: 'text-white/80',
    amber: 'text-white/80',
    yellow: 'text-stone-800',
  }

  const iconAnimation =
    iconAnim === 'rotate'
      ? { rotate: [-5, 5, -5], scale: [1, 1.2, 1] }
      : iconAnim === 'pulse'
        ? { scale: [1, 1.15, 1] }
        : {}

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className={`${colorMap[color]} backdrop-blur border-2 rounded-lg px-3 py-2 shadow-2xl flex items-center gap-2`}
    >
      <motion.div
        animate={iconAnimation}
        transition={{ duration: iconAnim === 'rotate' ? 0.4 : 1, repeat: Infinity }}
      >
        {icon}
      </motion.div>
      <div>
        <div className={`text-[9px] font-mono uppercase tracking-widest ${subColorMap[color]}`}>
          {title}
        </div>
        <div className={`text-sm font-black ${textColorMap[color]}`}>{subtitle}</div>
      </div>
    </motion.div>
  )
}
