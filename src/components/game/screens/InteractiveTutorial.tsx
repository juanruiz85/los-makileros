'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { useGameStore } from '@/game/store/gameStore'
import { audio } from '@/lib/audio'

interface TutorialStep {
  title: string
  body: string
  highlight?: string // CSS selector to highlight
  position: 'center' | 'top-left' | 'top-right' | 'bottom-center'
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: '¡Bienvenido a la planta!',
    body: 'Soy el supervisor. Necesito que completes tickets antes de que el timer llegue a 0. Tienes 120 segundos para arrancar. Cada acción correcta te da +3s, cada error -5s. ¿Listo?',
    position: 'center',
  },
  {
    title: '1. Lee el ticket',
    body: 'Arriba a la derecha está el Programa Garnet. Muestra el color de cable, gauge (calibre), longitud, terminales y cantidad de circuitos que necesitas. ¡Léelo antes de cortar!',
    position: 'top-right',
  },
  {
    title: '2. Arrastra el cable',
    body: 'Desde tu inventario izquierdo, arrastra el carrete de cable correcto (color y gauge del ticket) a la cuchilla. ¡Es drag & drop como en la vida real!',
    position: 'top-left',
  },
  {
    title: '3. Pon los terminales',
    body: 'Arrastra los terminales correctos a los lados A y B del cable. Si son ≤10 circuitos son opcionales (pero dan puntos extra). Si son >10, ¡son obligatorios!',
    position: 'center',
  },
  {
    title: '4. CORTAR',
    body: 'Presiona el botón rojo CORTAR. Si el cable es correcto: +50 puntos, +3s, combo sube. Si te equivocas: -80 puntos, -5s, ¡y el supervisor se aparece!',
    position: 'bottom-center',
  },
  {
    title: '5. Reportar terminado',
    body: 'Cuando termines el corte, presiona REPORTAR TERMINADO (abajo). Ganas +10s bonus + el score base del ticket. ¡Luego viene el siguiente ticket!',
    position: 'bottom-center',
  },
  {
    title: '6. Cuidado con El Gringo',
    body: 'Cada 90s aparece "El Gringo Enojado" y reinicia tu timer a 15s. También puede aparecer el Supervisor (enojado si cometes 2 errores seguidos), el Chisme (distracción), Mantenimiento y Calidad.',
    position: 'center',
  },
  {
    title: '7. Combos y Modo Rápido',
    body: 'Cada 3 aciertos seguidos activas Modo Rápido (score x2 por 15s). ¡No falles o se rompe el combo! Existen power-ups: Café ☕ (congela timer 5s) y Taco 🌮 (inmunidad anti-Supervisor).',
    position: 'center',
  },
  {
    title: '8. Atajos de teclado',
    body: 'Teclas 1-4 cambian entre estaciones (Corte/Splices/Prensas/Harness). Tecla P pausa el juego. ¡Úsalos para ser más rápido!',
    position: 'center',
  },
  {
    title: '¡A chambear!',
    body: 'Completa tickets, sube tu score, desbloquea 29 logros, sube al ranking online, mantén racha de Daily Challenges. ¡Demuestra que eres un verdadero Makilero! 🔧',
    position: 'center',
  },
]

const TUTORIAL_KEY = 'makileros:tutorial-seen'

export function InteractiveTutorial() {
  const screen = useGameStore((s) => s.screen)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Auto-open on first play if tutorial not seen
    if (screen === 'playing') {
      try {
        const seen = localStorage.getItem(TUTORIAL_KEY)
        if (!seen) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setOpen(true)
        }
      } catch {
        setOpen(true)
      }
    }
  }, [screen])

  const handleClose = () => {
    setOpen(false)
    try {
      localStorage.setItem(TUTORIAL_KEY, 'true')
    } catch {}
    audio.play('click-ok')
  }

  const handleNext = () => {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep(step + 1)
      audio.play('click-ok', { volume: 0.5 })
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1)
      audio.play('click-ok', { volume: 0.5 })
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  const currentStep = TUTORIAL_STEPS[step]

  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'top-left': 'top-24 left-4',
    'top-right': 'top-24 right-4',
    'bottom-center': 'bottom-24 left-1/2 -translate-x-1/2',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4"
          style={{
            // CSS clip-path spotlight: creates a hole around the tutorial card position
            // For non-center positions, we create a radial gradient spotlight
            background: currentStep.position === 'center'
              ? 'rgba(28, 25, 23, 0.85)'
              : `radial-gradient(circle at ${
                  currentStep.position === 'top-left' ? '15% 30%' :
                  currentStep.position === 'top-right' ? '85% 30%' :
                  '50% 80%'
                }, transparent 0%, transparent 25%, rgba(28, 25, 23, 0.85) 50%)`,
          }}
        >
          {/* Spotlight pulse border */}
          <motion.div
            animate={{ boxShadow: ['0 0 0 0 rgba(245,158,11,0.4)', '0 0 0 8px rgba(245,158,11,0)'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`fixed ${positionClasses[currentStep.position]} pointer-events-none`}
          />

          <motion.div
            key={step}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={`relative bg-stone-900 border-2 border-amber-500 rounded-2xl p-5 max-w-md w-full shadow-2xl ${positionClasses[currentStep.position]}`}
            style={{
              boxShadow: '0 0 30px rgba(245,158,11,0.3), 0 10px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Animated arrow pointing to relevant UI area */}
            {currentStep.position !== 'center' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute text-amber-500 text-2xl ${
                  currentStep.position === 'top-right'
                    ? '-right-2 top-1/2 rotate-180'
                    : currentStep.position === 'top-left'
                      ? '-left-2 top-1/2'
                      : '-bottom-2 left-1/2 -translate-x-1/2 rotate-90'
                }`}
              >
                <motion.span
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  👉
                </motion.span>
              </motion.div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-900 font-black text-sm">
                  {step + 1}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  Tutorial · {step + 1}/{TUTORIAL_STEPS.length}
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-1 rounded text-stone-400 hover:text-stone-100 transition-colors text-xs font-mono"
              >
                Saltar
              </button>
            </div>

            {/* Title with subtle glow */}
            <h2 className="text-lg font-black text-stone-100 mb-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              {currentStep.title}
            </h2>

            {/* Body */}
            <p className="text-sm text-stone-300 mb-4 leading-relaxed">{currentStep.body}</p>

            {/* Progress dots */}
            <div className="flex justify-center gap-1 mb-4">
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'bg-amber-500 w-6' : 'bg-stone-700 w-2'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  className="border-stone-600 text-stone-200 hover:bg-stone-800"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold"
              >
                {step === TUTORIAL_STEPS.length - 1 ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    ¡Entendido!
                  </>
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
