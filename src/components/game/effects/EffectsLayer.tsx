'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEventStore } from '@/game/store/eventStore'

export function EffectsLayer() {
  const activeEvents = useEventStore((s) => s.activeEvents)
  const hasGringo = activeEvents.some(
    (e) => e.kind === 'gringo' && !e.resolved
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {hasGringo && (
          <>
            {/* Screen shake via transform on container */}
            <motion.div
              key="shake"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* Papeles volando */}
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: -100,
                    y: Math.random() * 600,
                    rotate: 0,
                  }}
                  animate={{
                    x: 1500,
                    y: Math.random() * 800 - 200,
                    rotate: 1440,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 1.5,
                    ease: 'linear',
                  }}
                  className="absolute w-10 h-12 bg-white/90 shadow-lg"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, transparent 0px, transparent 4px, rgba(0,0,0,0.05) 4px, rgba(0,0,0,0.05) 5px)',
                  }}
                />
              ))}
              {/* Flash rojo */}
              <motion.div
                animate={{ opacity: [0.0, 0.3, 0.0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute inset-0 bg-red-500"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
