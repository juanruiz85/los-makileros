'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { T } from '@/lib/i18n'
import { Card } from '@/components/ui/card'
import { CABLE_COLOR_HEX } from '@/game/constants'
import { Layers } from 'lucide-react'
import type { Cable } from '@/game/types'

export function WipTray() {
  const wip = useInventoryStore((s) => s.wip)
  const { isOver, setNodeRef } = useDroppable({ id: 'wip-tray', data: { accept: 'cable' } })

  return (
    <Card
      className={`h-24 p-2 flex-shrink-0 border-2 transition-colors ${
        isOver ? 'border-amber-500 bg-amber-50 dark:bg-amber-950' : 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-950'
      }`}
    >
      <div ref={setNodeRef} className="h-full flex flex-col">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1">
          <div className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {T.hud.wip}
          </div>
          <span className={wip.length >= 12 ? 'text-red-500 font-bold' : ''}>
            {wip.length}/12
          </span>
        </div>
        <div className="flex-1 flex gap-1 overflow-x-auto custom-scroll items-center">
          {wip.length === 0 ? (
            <div className="text-xs text-stone-400 italic flex-1 text-center self-center">
              Vacío — arrastra aquí los cables cortados
            </div>
          ) : (
            wip.map((item) => {
              if ((item as Cable).color) {
                const cable = item as Cable
                return (
                  <div
                    key={cable.id}
                    className="flex flex-col items-center gap-0.5 px-2 py-1 rounded bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 flex-shrink-0"
                  >
                    <div
                      className="w-8 h-2 rounded"
                      style={{ background: CABLE_COLOR_HEX[cable.color] }}
                    />
                    <div className="text-[9px] font-mono text-stone-500">
                      {cable.length_mm}mm
                    </div>
                  </div>
                )
              }
              return (
                <div
                  key={(item as { id: string }).id}
                  className="px-2 py-1 rounded bg-stone-300 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-mono flex-shrink-0"
                >
                  ?
                </div>
              )
            })
          )}
        </div>
      </div>
    </Card>
  )
}
