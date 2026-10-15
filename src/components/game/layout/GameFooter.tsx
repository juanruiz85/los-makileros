'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { T } from '@/lib/i18n'
import { audio } from '@/lib/audio'
import { Sparkles } from 'lucide-react'

export function GameFooter() {
  const [clickCount, setClickCount] = useState(0)
  const [secretActive, setSecretActive] = useState(false)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCreditsClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    clickTimerRef.current = setTimeout(() => setClickCount(0), 2000)

    if (newCount >= 10) {
      setSecretActive((s) => !s)
      audio.play('combo-chime')
      audio.play('combo-chime')
      setClickCount(0)
    }
  }

  return (
    <footer className="mt-auto bg-stone-900 dark:bg-black text-stone-400 px-3 py-2 text-[10px] font-mono flex flex-wrap justify-between items-center gap-2 border-t-2 border-stone-800 relative overflow-hidden">
      {/* Secret rainbow shimmer when active */}
      <AnimatePresence>
        {secretActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(239,68,68,0.1), rgba(249,115,22,0.1), rgba(234,179,8,0.1), rgba(34,197,94,0.1), rgba(59,130,246,0.1), rgba(168,85,247,0.1))',
            }}
          />
        )}
      </AnimatePresence>

      <div
        className="flex items-center gap-2 cursor-pointer select-none hover:text-stone-300 transition-colors relative z-10"
        onClick={handleCreditsClick}
        title={clickCount > 0 ? `${10 - clickCount} clics para activar secreto` : 'Haz clic 10x para un secreto...'}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{T.footer.credits}</span>
        {secretActive && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="inline-flex items-center gap-1 ml-2 text-amber-400"
          >
            <Sparkles className="w-3 h-3" />
            <span className="text-[9px] uppercase tracking-widest">Modo Arcoíris</span>
          </motion.div>
        )}
        {clickCount > 0 && clickCount < 10 && (
          <span className="ml-1 text-[8px] text-stone-500">
            ({10 - clickCount}...)
          </span>
        )}
      </div>
      <div className="relative z-10">{T.footer.version}</div>
    </footer>
  )
}
