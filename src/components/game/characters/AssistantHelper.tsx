'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { audio } from '@/lib/audio'
import { AssistantCharacter } from './CharacterSVGs'
import { X, ChevronRight } from 'lucide-react'

interface AssistantTip {
  id: string
  text: string
  trigger: 'start' | 'first-ticket' | 'first-error' | 'low-time' | 'first-combo' | 'first-warehouse'
}

const TIPS: { [key: string]: AssistantTip } = {
  start: {
    id: 'start',
    text: '¡Hola! Soy tu asistente. Te voy a ayudar en tus primeros turnos. Tienes 150 segundos. ¡Lee el ticket a la derecha y arrastra el cable correcto a la cuchilla!',
    trigger: 'start',
  },
  'first-ticket': {
    id: 'first-ticket',
    text: '¡Bien hecho! Cada ticket completado te da +10s. Sigue así. Si los materiales no cambian entre tickets, ganas bonus de Setup Ahorrado (+150 pts).',
    trigger: 'first-ticket',
  },
  'first-error': {
    id: 'first-error',
    text: '¡Cuidado! Te equivocaste de cable. Revisa el Programa Garnet: el color y gauge deben coincidir. ¡Cada error te cuesta -5s!',
    trigger: 'first-error',
  },
  'low-time': {
    id: 'low-time',
    text: '¡Te queda poco tiempo! Si necesitas material, abre el Almacén (botón abajo a la izquierda). Y recuerda: los power-ups ☕ y 🌮 vienen en los pedidos.',
    trigger: 'low-time',
  },
  'first-combo': {
    id: 'first-combo',
    text: '¡Combo x3! Activaste Modo Rápido: score x2 por 15 segundos. ¡No falles o se rompe el combo!',
    trigger: 'first-combo',
  },
  'first-warehouse': {
    id: 'first-warehouse',
    text: '¡Buen movimiento! Si tu inventario está vacío, el almacenista se estresa y manda cosas equivocadas. ¡Pide con tiempo!',
    trigger: 'first-warehouse',
  },
}

const SEEN_KEY = 'makileros:assistant-tips-seen'

function loadSeenTips(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveSeenTips(tips: Set<string>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...tips]))
  } catch {}
}

export function AssistantHelper() {
  const screen = useGameStore((s) => s.screen)
  const runStats = useGameStore((s) => s.runStats)
  const timerSec = useGameStore((s) => s.timerSec)
  const combo = useGameStore((s) => s.combo)

  const [currentTip, setCurrentTip] = useState<AssistantTip | null>(null)
  const seenTipsRef = useRef<Set<string>>(loadSeenTips())
  const prevTicketsRef = useRef(0)
  const prevErrorsRef = useRef(0)
  const prevComboRef = useRef(0)
  const startShownRef = useRef(false)

  // Show start tip when game begins
  useEffect(() => {
    if (screen === 'playing' && !startShownRef.current && !seenTipsRef.current.has('start')) {
      startShownRef.current = true
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentTip(TIPS.start)
      audio.play('click-ok', { volume: 0.5 })
    }
  }, [screen])

  // Watch for first ticket completed
  useEffect(() => {
    if (
      screen === 'playing' &&
      runStats.ticketsCompleted > prevTicketsRef.current &&
      !seenTipsRef.current.has('first-ticket')
    ) {
      prevTicketsRef.current = runStats.ticketsCompleted
      seenTipsRef.current.add('first-ticket')
      saveSeenTips(seenTipsRef.current)
      setTimeout(() => {
        setCurrentTip(TIPS['first-ticket'])
        audio.play('combo-chime', { volume: 0.5 })
      }, 1000)
    }
    prevTicketsRef.current = runStats.ticketsCompleted
  }, [runStats.ticketsCompleted, screen])

  // Watch for first error
  useEffect(() => {
    if (
      screen === 'playing' &&
      runStats.errors > prevErrorsRef.current &&
      !seenTipsRef.current.has('first-error')
    ) {
      prevErrorsRef.current = runStats.errors
      seenTipsRef.current.add('first-error')
      saveSeenTips(seenTipsRef.current)
      setTimeout(() => {
        setCurrentTip(TIPS['first-error'])
        audio.play('buzz-fail', { volume: 0.3 })
      }, 500)
    }
    prevErrorsRef.current = runStats.errors
  }, [runStats.errors, screen])

  // Watch for low time (first time below 30s)
  useEffect(() => {
    if (
      screen === 'playing' &&
      timerSec <= 30 &&
      timerSec > 25 &&
      !seenTipsRef.current.has('low-time')
    ) {
      seenTipsRef.current.add('low-time')
      saveSeenTips(seenTipsRef.current)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentTip(TIPS["low-time"])
      audio.play('click-ok', { volume: 0.5 })
    }
  }, [timerSec, screen])

  // Watch for first combo x3
  useEffect(() => {
    if (
      screen === 'playing' &&
      combo >= 3 &&
      prevComboRef.current < 3 &&
      !seenTipsRef.current.has('first-combo')
    ) {
      seenTipsRef.current.add('first-combo')
      saveSeenTips(seenTipsRef.current)
      setTimeout(() => {
        setCurrentTip(TIPS['first-combo'])
        audio.play('combo-chime', { volume: 0.5 })
      }, 500)
    }
    prevComboRef.current = combo
  }, [combo, screen])

  const handleDismiss = () => {
    setCurrentTip(null)
    audio.play('click-ok', { volume: 0.3 })
  }

  return (
    <AnimatePresence>
      {currentTip && screen === 'playing' && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="fixed bottom-24 left-4 z-[55] max-w-xs pointer-events-auto"
        >
          <div className="bg-stone-900 border-2 border-emerald-500 rounded-xl p-3 shadow-2xl flex items-start gap-3">
            {/* Personaje asistente */}
            <div className="flex-shrink-0">
              <AssistantCharacter size={70} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[9px] font-mono uppercase tracking-widest text-emerald-400">
                  🤝 Asistente
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-stone-400 hover:text-stone-100 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-stone-200 leading-relaxed">{currentTip.text}</p>
              <button
                onClick={handleDismiss}
                className="mt-2 flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 uppercase tracking-widest"
              >
                Entendido
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
