'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { T } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronRight, ChevronLeft, Scissors, Package, Gauge, Clock, AlertTriangle } from 'lucide-react'

const slideIcons = [Package, Scissors, Gauge, Clock, AlertTriangle]

export function HowToPlay() {
  const setScreen = useGameStore((s) => s.setScreen)
  const [idx, setIdx] = useState(0)
  const slides = T.howto.slides
  const slide = slides[idx]
  const Icon = slideIcons[idx]

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-950 dark:to-stone-900 p-4">
      <motion.div
        key={idx}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl w-full"
      >
        <Card className="p-8 bg-white dark:bg-stone-900 border-2 border-amber-400 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center text-stone-900">
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-stone-500">
                {T.howto.title} · {idx + 1}/{slides.length}
              </div>
              <h2 className="text-2xl font-bold">{slide.title}</h2>
            </div>
          </div>
          <p className="text-stone-700 dark:text-stone-300 text-lg leading-relaxed">
            {slide.body}
          </p>

          <div className="mt-6 flex justify-between items-center">
            <div className="flex gap-1">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === idx ? 'bg-amber-500 w-8' : 'bg-stone-300 dark:bg-stone-700 w-2'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {idx > 0 && (
                <Button variant="outline" onClick={() => setIdx((i) => i - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {T.howto.prev}
                </Button>
              )}
              {idx < slides.length - 1 ? (
                <Button onClick={() => setIdx((i) => i + 1)} className="bg-amber-500 hover:bg-amber-600 text-stone-900">
                  {T.howto.next}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={() => setScreen('title')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {T.howto.gotIt}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
