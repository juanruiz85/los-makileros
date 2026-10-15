'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { Wrench, Scan, Cable as CableIcon, TerminalSquare, Hammer } from 'lucide-react'

export function PressStation() {
  // Esta estación es un placeholder visual más rico para futura Fase
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="text-xs font-mono text-stone-500 dark:text-stone-400">
        Arrastra el aplicador · escanea Tool ID · prensa cable + terminal
      </div>

      <div className="relative bg-stone-200 dark:bg-stone-950 rounded-xl border-2 border-stone-400 dark:border-stone-700 overflow-hidden p-4 flex flex-col gap-3">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-stone-500 to-amber-400" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-amber-600 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
              Prensa
            </div>
            <div className="font-bold text-sm">Hydraulic Crimper</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StaticSlot icon={<Wrench className="w-6 h-6" />} label="Aplicador" />
          <StaticSlot icon={<Scan className="w-6 h-6" />} label="Scanner Tool ID" />
          <StaticSlot icon={<CableIcon className="w-6 h-6" />} label="Cable" />
          <StaticSlot icon={<TerminalSquare className="w-6 h-6" />} label="Terminal" />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          disabled
          className="px-6 py-3 bg-stone-400 text-white font-black rounded-lg flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
        >
          <Hammer className="w-5 h-5" />
          PRENSAR (próximamente)
        </motion.button>
      </div>

      <div className="bg-stone-100 dark:bg-stone-900 rounded-xl border border-amber-400 p-4 text-center">
        <div className="text-xs font-mono text-amber-600 dark:text-amber-400">
          ⚙ Esta estación estará disponible en una próxima actualización
        </div>
        <div className="text-[10px] text-stone-500 mt-1">
          Puedes usar Corte y Harness para completar tickets ahora mismo
        </div>
      </div>
    </div>
  )
}

function StaticSlot({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 h-20">
      <div className="w-7 h-7 text-stone-400">{icon}</div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">{label}</div>
    </div>
  )
}
