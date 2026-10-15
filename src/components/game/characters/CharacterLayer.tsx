'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEventStore } from '@/game/store/eventStore'
import { useGameStore } from '@/game/store/gameStore'

export function CharacterLayer() {
  const activeEvents = useEventStore((s) => s.activeEvents)
  const gringoImmunity = useGameStore((s) => s.gringoImmunityTicketsLeft)

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {activeEvents.map((ev) => {
          if (ev.resolved) return null
          switch (ev.kind) {
            case 'supervisor-warn':
              return <SupervisorBubble key={ev.id} level={1} />
            case 'supervisor-angry':
              return <SupervisorBubble key={ev.id} level={2} />
            case 'gringo':
              return <GringoBackdrop key={ev.id} />
            case 'gossip':
              return <GossipBubble key={ev.id} />
            default:
              return null
          }
        })}
      </AnimatePresence>

      {/* Inmunidad taco visual */}
      {gringoImmunity > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-20 right-4 flex items-center gap-1 px-3 py-1 bg-orange-500/90 backdrop-blur text-white rounded-full text-xs font-bold shadow-lg border-2 border-orange-300"
        >
          🌮 TACO SHIELD x{gringoImmunity}
        </motion.div>
      )}
    </div>
  )
}

function SupervisorBubble({ level }: { level: 1 | 2 }) {
  return (
    <motion.div
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -200, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="absolute top-24 left-4 z-30 pointer-events-none"
    >
      <div className="flex items-end gap-2">
        {/* Personaje supervisor */}
        <motion.div
          animate={level === 2 ? { rotate: [-3, 3, -3] } : {}}
          transition={{ duration: 0.3, repeat: level === 2 ? Infinity : 0 }}
          className={`w-16 h-16 rounded-full border-4 ${
            level === 2 ? 'border-red-500 bg-red-100' : 'border-stone-400 bg-stone-200'
          } flex items-center justify-center text-3xl shadow-xl`}
        >
          {level === 2 ? '😡' : '👔'}
        </motion.div>
        {/* Globo de diálogo */}
        <div
          className={`px-3 py-2 rounded-lg shadow-lg max-w-xs ${
            level === 2
              ? 'bg-red-500 text-white border-2 border-red-700'
              : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-2 border-stone-300 dark:border-stone-700'
          }`}
        >
          <div className="text-[10px] font-mono uppercase opacity-70 mb-0.5">
            {level === 2 ? '😡 El Jefe' : '👔 Supervisor'}
          </div>
          <div className="text-sm font-medium">
            {level === 2 ? '¡Ya vas muy lento, ponle ganas!' : 'Eh, checa el programa...'}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function GossipBubble() {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="absolute bottom-24 right-4 z-30 pointer-events-none"
    >
      <div className="flex items-end gap-2">
        {/* Globo pensamiento */}
        <div className="px-3 py-2 bg-purple-500 text-white rounded-lg shadow-lg border-2 border-purple-300 max-w-xs">
          <div className="text-[10px] font-mono uppercase opacity-70 mb-0.5">
            💬 Compañero chismoso
          </div>
          <div className="text-sm">¿Oíste que el Gringo viene hoy?</div>
        </div>
        {/* Personaje */}
        <motion.div
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-12 h-12 rounded-full bg-purple-200 border-4 border-purple-500 flex items-center justify-center text-2xl shadow-xl"
        >
          🗣️
        </motion.div>
      </div>
    </motion.div>
  )
}

function GringoBackdrop() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 bg-red-950/40 pointer-events-none flex items-center justify-center"
    >
      <motion.div
        animate={{
          x: [0, -10, 10, -8, 8, 0],
          y: [0, 5, -5, 3, -3, 0],
        }}
        transition={{ duration: 0.3, repeat: Infinity }}
        className="flex flex-col items-center"
      >
        <div className="text-8xl mb-2">🤬</div>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 0.4, repeat: Infinity }}
          className="px-6 py-3 bg-red-500 text-white rounded-lg border-4 border-red-700 font-black text-3xl shadow-2xl"
        >
          THE GRINGO
        </motion.div>
        <div className="text-amber-400 font-mono mt-2 text-sm uppercase tracking-widest">
          El Gringo Enojado
        </div>
      </motion.div>
    </motion.div>
  )
}
