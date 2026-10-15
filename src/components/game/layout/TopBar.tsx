'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { useStationStore } from '@/game/store/stationStore'
import { T } from '@/lib/i18n'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Scissors, Cable, Wrench, Grid3x3 } from 'lucide-react'
import { Timer } from '../hud/Timer'
import { ScoreBoard } from '../hud/ScoreBoard'
import { ComboIndicator } from '../hud/ComboIndicator'

const STATIONS = [
  { key: 'cut', label: T.hud.cut, icon: Scissors },
  { key: 'splice', label: T.hud.splice, icon: Cable },
  { key: 'press', label: T.hud.press, icon: Wrench },
  { key: 'harness', label: T.hud.harness, icon: Grid3x3 },
] as const

export function TopBar() {
  const active = useStationStore((s) => s.active)
  const setActive = useStationStore((s) => s.setActive)
  const comboModeActive = useGameStore((s) => s.comboModeActive)
  const gringoImmunity = useGameStore((s) => s.gringoImmunityTicketsLeft)
  const timerFrozen = useGameStore((s) => s.timerFrozen)
  const speedMult = useGameStore((s) => s.speedMult)

  return (
    <div className="bg-stone-900 dark:bg-black text-stone-100 px-2 py-2 sm:px-4 border-b-4 border-amber-500 shadow-lg">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {/* Logo pequeño */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center text-stone-900 font-black">
            M
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
              {T.app.title}
            </div>
            <div className="text-sm font-bold leading-none">{T.app.subtitle}</div>
          </div>
        </div>

        {/* Tabs estaciones */}
        <Tabs
          value={active}
          onValueChange={(v) => setActive(v as typeof active)}
          className="flex-1"
        >
          <TabsList className="bg-stone-800 grid grid-cols-4 w-full sm:w-auto">
            {STATIONS.map((s) => {
              const Icon = s.icon
              return (
                <TabsTrigger
                  key={s.key}
                  value={s.key}
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-stone-900 text-stone-300 gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{s.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        {/* HUD: Timer + Combo + Score */}
        <div className="flex items-center gap-2 sm:gap-3">
          {timerFrozen && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="hidden sm:flex items-center gap-1 px-2 py-1 bg-yellow-400 text-stone-900 rounded font-bold text-xs"
            >
              ☕ FREEZE
            </motion.div>
          )}
          {gringoImmunity > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded font-bold text-xs">
              🌮 SHIELD ({gringoImmunity})
            </div>
          )}
          {speedMult > 1 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="hidden sm:flex items-center gap-1 px-2 py-1 bg-purple-500 text-white rounded font-bold text-xs"
            >
              💪 MORAL x{speedMult.toFixed(1)}
            </motion.div>
          )}
          {comboModeActive && (
            <motion.div
              animate={{
                boxShadow: ['0 0 0 0 rgba(245,158,11,0.6)', '0 0 0 8px rgba(245,158,11,0)'],
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="px-2 py-1 bg-amber-500 text-stone-900 rounded font-bold text-xs"
            >
              ⚡ {T.hud.comboFast}
            </motion.div>
          )}
          <ComboIndicator />
          <ScoreBoard />
          <Timer />
        </div>
      </div>
    </div>
  )
}
