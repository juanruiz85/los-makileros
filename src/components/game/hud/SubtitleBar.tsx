'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEventStore } from '@/game/store/eventStore'

export function SubtitleBar() {
  const subtitle = useEventStore((s) => s.currentSubtitle)

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <AnimatePresence>
        {subtitle && (
          <motion.div
            key={subtitle.text}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="px-4 py-2 bg-stone-950/95 backdrop-blur border-2 border-amber-500 rounded-lg shadow-2xl max-w-md"
          >
            <div className="text-sm font-medium text-stone-100 text-center">
              {subtitle.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
