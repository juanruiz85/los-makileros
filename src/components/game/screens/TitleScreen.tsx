'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useEventStore } from '@/game/store/eventStore'
import { useStationStore } from '@/game/store/stationStore'
import { audio } from '@/lib/audio'
import { T } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Scissors,
  Zap,
  Wrench,
  TrendingUp,
  BookOpen,
  Cable,
  Hammer,
  Cog,
  Factory,
  FlaskConical,
  Boxes,
} from 'lucide-react'
import type { GameMode } from '@/game/types'

const FLOATING_TOOLS = [
  { Icon: Scissors, x: '8%', y: '20%', delay: 0, duration: 7, color: 'text-amber-500/40' },
  { Icon: Cable, x: '85%', y: '25%', delay: 1, duration: 8, color: 'text-red-500/30' },
  { Icon: Hammer, x: '15%', y: '70%', delay: 2, duration: 9, color: 'text-stone-700/40' },
  { Icon: Wrench, x: '90%', y: '75%', delay: 1.5, duration: 6, color: 'text-orange-500/40' },
  { Icon: Factory, x: '50%', y: '12%', delay: 0.5, duration: 10, color: 'text-stone-700/30' },
  { Icon: Cog, x: '92%', y: '50%', delay: 2.5, duration: 12, color: 'text-stone-700/40' },
  { Icon: FlaskConical, x: '5%', y: '50%', delay: 1.8, duration: 8.5, color: 'text-purple-500/30' },
  { Icon: Boxes, x: '78%', y: '85%', delay: 0.8, duration: 9.5, color: 'text-emerald-500/30' },
]

export function TitleScreen() {
  const start = useGameStore((s) => s.start)
  const setScreen = useGameStore((s) => s.setScreen)
  const highscore = useGameStore((s) => s.highscore)
  const screen = useGameStore((s) => s.screen)
  const persistedMode = useGameStore((s) => s.mode)

  // Si hay una run persistida (currentTicket != null), mostrar "continuar"
  const hasRun = useGameStore((s) => !!s.currentTicket)

  const handleStart = (mode: GameMode) => {
    audio.init()
    audio.resume()
    audio.play('combo-chime')
    const inv = useInventoryStore.getState()
    if (inv.cables.length === 0) inv.initInventory()
    useEventStore.getState().reset()
    useStationStore.getState().resetAll()
    start(mode)
  }

  return (
    <div className="relative min-h-[calc(100vh-60px)] flex flex-col items-center justify-center overflow-hidden">
      {/* Fondo industrial con parallax de bandas */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-200 via-stone-300 to-stone-400 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900" />
      {/* Patrón de bandas transportadoras en el fondo */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
        <div className="absolute -inset-40 animate-[band_30s_linear_infinite] bg-[repeating-linear-gradient(45deg,transparent_0,transparent_40px,currentColor_40px,currentColor_42px)] text-stone-900 dark:text-stone-100" />
      </div>
      {/* Haz amarillo de advertencia */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/30 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"
      />

      {/* Floating tool icons (background ambiance) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOATING_TOOLS.map(({ Icon, x, y, delay, duration, color }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [0, -30, 0],
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
            style={{ left: x, top: y }}
            className={`absolute ${color}`}
          >
            <Icon className="w-12 h-12 md:w-16 md:h-16" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 max-w-4xl w-full">
        {/* Logo / Título */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-amber-400 text-stone-900 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
            <span className="w-2 h-2 bg-stone-900 rounded-full animate-pulse" />
            Modo Arcade
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-stone-900 dark:text-stone-50 drop-shadow-[3px_3px_0_rgba(220,38,38,1)]">
            Los{' '}
            <span className="text-red-600 dark:text-red-500 italic">Makileros</span>
          </h1>
          <p className="mt-2 text-xl sm:text-2xl font-mono text-stone-700 dark:text-stone-300 tracking-tight">
            {T.app.subtitle}
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {T.app.tagline}
          </p>
        </motion.div>

        {/* Caja de modos */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Card className="p-6 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border-2 border-stone-300 dark:border-stone-700 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-mono text-xs uppercase tracking-widest mb-3">
              <TrendingUp className="w-4 h-4" />
              {T.title.mode}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <ModeButton
                label={T.title.normal}
                icon={<Scissors className="w-5 h-5" />}
                description="120s, gringo cada 90s"
                color="emerald"
                onClick={() => handleStart('normal')}
                active={persistedMode === 'normal' && screen === 'title'}
              />
              <ModeButton
                label={T.title.chaos}
                icon={<Zap className="w-5 h-5" />}
                description="Gringo cada 45s, +50% eventos"
                color="red"
                onClick={() => handleStart('chaos')}
                active={persistedMode === 'chaos' && screen === 'title'}
              />
              <ModeButton
                label={T.title.free}
                icon={<Wrench className="w-5 h-5" />}
                description="Sin timer, sin gringo"
                color="amber"
                onClick={() => handleStart('free')}
                active={persistedMode === 'free' && screen === 'title'}
              />
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3 items-stretch">
              {hasRun && (
                <Button
                  variant="outline"
                  className="flex-1 border-stone-400 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                  onClick={() => setScreen('playing')}
                >
                  {T.title.continue}
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1 border-stone-400 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                onClick={() => setScreen('howto')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {T.title.howTo}
              </Button>
            </div>

            {highscore > 0 && (
              <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 text-center">
                <div className="text-xs font-mono text-stone-500 uppercase tracking-widest">
                  {T.title.highscore}
                </div>
                <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                  {highscore.toLocaleString()}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Chips de features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-2 max-w-2xl"
        >
          {[
            { label: 'Drag & Drop', color: 'bg-emerald-500' },
            { label: 'Combos x3 Modo Rápido', color: 'bg-amber-500' },
            { label: 'Supervisor', color: 'bg-orange-500' },
            { label: 'El Gringo', color: 'bg-red-500' },
            { label: 'Chisme 💬', color: 'bg-purple-500' },
            { label: 'Café ☕ & Taco 🌮', color: 'bg-yellow-500' },
          ].map((chip) => (
            <span
              key={chip.label}
              className={`${chip.color} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm`}
            >
              {chip.label}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Advertencia horizontal en el borde */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-[repeating-linear-gradient(45deg,#fbbf24_0,#fbbf24_20px,#1c1917_20px,#1c1917_40px)]" />
    </div>
  )
}

function ModeButton({
  label,
  icon,
  description,
  color,
  onClick,
  active,
}: {
  label: string
  icon: React.ReactNode
  description: string
  color: 'emerald' | 'red' | 'amber'
  onClick: () => void
  active: boolean
}) {
  const colorMap = {
    emerald: 'border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    red: 'border-red-500 hover:bg-red-50 dark:hover:bg-red-950 text-red-700 dark:text-red-300',
    amber: 'border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-300',
  }
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 bg-white dark:bg-stone-900 transition-colors ${colorMap[color]} ${active ? 'ring-2 ring-offset-2 ring-' + color + '-500' : ''}`}
    >
      <div className="text-2xl">{icon}</div>
      <div className="font-bold text-sm">{label}</div>
      <div className="text-[10px] text-stone-500 dark:text-stone-400 text-center leading-tight">
        {description}
      </div>
    </motion.button>
  )
}
