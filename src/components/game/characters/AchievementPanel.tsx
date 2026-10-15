'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAchievementStore, ACHIEVEMENT_DEFS } from '@/game/store/achievementStore'
import { audio } from '@/lib/audio'
import { X } from 'lucide-react'

// Hook to subscribe to newly unlocked achievements
function useAchievementWatcher() {
  const unlocked = useAchievementStore((s) => s.unlocked)
  const [newlyUnlockedIds, setNewlyUnlockedIds] = useState<string[]>([])
  const seenRef = React.useRef<Set<string>>(new Set())

  // Initialize seen set on first render (don't fire for previously unlocked)
  useEffect(() => {
    Object.keys(unlocked).forEach((id) => seenRef.current.add(id))
  }, [])

  useEffect(() => {
    const newIds: string[] = []
    for (const id of Object.keys(unlocked)) {
      if (!seenRef.current.has(id)) {
        seenRef.current.add(id)
        newIds.push(id)
      }
    }
    if (newIds.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewlyUnlockedIds((prev) => [...prev, ...newIds])
    }
  }, [unlocked])

  const clearAchievement = (id: string) => {
    setNewlyUnlockedIds((prev) => prev.filter((x) => x !== id))
  }

  return { newlyUnlockedIds, clearAchievement }
}

export function AchievementNotification() {
  const { newlyUnlockedIds, clearAchievement } = useAchievementWatcher()
  const [activeQueue, setActiveQueue] = useState<string[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Pick first achievement to show, queue others (max 3 visible at once)
  useEffect(() => {
    if (newlyUnlockedIds.length > 0 && activeQueue.length < 3) {
      const next = newlyUnlockedIds.filter((id) => !activeQueue.includes(id) && !dismissed.has(id))[0]
      if (next) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveQueue((q) => [...q, next])
        audio.play('combo-chime')
        const t = setTimeout(() => {
          // Mark as dismissed and remove from queue
          setDismissed((s) => new Set(s).add(next))
          setActiveQueue((q) => q.filter((x) => x !== next))
          clearAchievement(next)
        }, 4500)
        timersRef.current.set(next, t)
      }
    }
  }, [newlyUnlockedIds, activeQueue, dismissed, clearAchievement])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t))
      timersRef.current.clear()
    }
  }, [])

  return (
    <div className="fixed top-20 right-4 z-[55] max-w-xs pointer-events-none flex flex-col gap-2">
      <AnimatePresence>
        {activeQueue.map((id, idx) => {
          const def = ACHIEVEMENT_DEFS.find((a) => a.id === id)
          if (!def) return null
          return (
            <motion.div
              key={def.id}
              initial={{ x: 400, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 400, opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: idx * 0.1 }}
            >
              <div className="bg-stone-900 border-2 border-amber-500 rounded-xl p-3 shadow-2xl flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [-5, 5, -5, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 rounded-lg bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-2xl flex-shrink-0"
                >
                  {def.emoji}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-amber-400">
                    Logro desbloqueado
                  </div>
                  <div className="font-black text-stone-100 text-sm truncate">
                    {def.label}
                  </div>
                  <div className="text-xs text-stone-400 truncate">
                    {def.description}
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-amber-400 text-lg flex-shrink-0"
                >
                  ✨
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

interface AchievementPanelProps {
  open: boolean
  onOpenChange: (b: boolean) => void
}

export function AchievementPanel({ open, onOpenChange }: AchievementPanelProps) {
  const unlocked = useAchievementStore((s) => s.unlocked)
  const totalUnlocked = Object.keys(unlocked).length
  const totalAchievements = ACHIEVEMENT_DEFS.length
  const progressPct = Math.round((totalUnlocked / totalAchievements) * 100)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-[60] bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border-2 border-amber-500 rounded-2xl p-5 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  Logros
                </div>
                <div className="text-lg font-black text-stone-100">
                  Achievements
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-4 p-3 bg-stone-800/50 rounded-lg">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-stone-400">Progreso</span>
                <span className="text-amber-400 font-bold">
                  {totalUnlocked}/{totalAchievements}
                </span>
              </div>
              <div className="h-2 bg-stone-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                />
              </div>
              <div className="text-right text-[10px] font-mono text-stone-500 mt-1">
                {progressPct}% completado
              </div>
            </div>

            {/* Grid of achievements */}
            <div className="grid grid-cols-2 gap-2">
              {ACHIEVEMENT_DEFS.map((def) => {
                const isUnlocked = !!unlocked[def.id]
                return (
                  <motion.div
                    key={def.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-2 rounded-lg border-2 flex items-center gap-2 ${
                      isUnlocked
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-stone-700 bg-stone-800/30 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded flex items-center justify-center text-xl flex-shrink-0 ${
                        isUnlocked ? 'bg-amber-500/20' : 'bg-stone-900 grayscale'
                      }`}
                    >
                      {isUnlocked ? def.emoji : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-bold truncate ${
                          isUnlocked ? 'text-amber-300' : 'text-stone-400'
                        }`}
                      >
                        {def.label}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate">
                        {def.description}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
