'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, X } from 'lucide-react'

interface TurboModeIndicatorProps {
  active: boolean
  onDismiss?: () => void
}

export function TurboModeIndicator({ active, onDismiss }: TurboModeIndicatorProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] pointer-events-none"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(239,68,68,0.7)',
                '0 0 0 30px rgba(239,68,68,0)',
              ],
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl border-4 border-yellow-400 flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
            >
              <Rocket className="w-8 h-8" />
            </motion.div>
            <div>
              <div className="font-black text-2xl tracking-tight">TURBO MODE</div>
              <div className="text-xs font-mono opacity-90">
                Konami unlocked · score x3
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
