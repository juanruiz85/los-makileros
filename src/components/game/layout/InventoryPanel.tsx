'use client'

import React from 'react'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useGameStore } from '@/game/store/gameStore'
import { T } from '@/lib/i18n'
import { Card } from '@/components/ui/card'
import { DraggableCable } from '../inventory/DraggableCable'
import { DraggableTerminal } from '../inventory/DraggableTerminal'
import { DraggablePowerup } from '../inventory/DraggablePowerup'
import { DraggableTube } from '../inventory/DraggableTube'
import { Package, Boxes } from 'lucide-react'

export function InventoryPanel() {
  const cables = useInventoryStore((s) => s.cables)
  const terminals = useInventoryStore((s) => s.terminals)
  const tubes = useInventoryStore((s) => s.tubes)
  const coffeePending = useInventoryStore((s) => s.coffeePending)
  const tacoPending = useInventoryStore((s) => s.tacoPending)
  const screen = useGameStore((s) => s.screen)

  // Agrupar cables por color+gauge para mostrar carretes
  const cablesByGroup = new Map<string, typeof cables>()
  for (const c of cables) {
    const key = `${c.color}-${c.gauge}`
    const arr = cablesByGroup.get(key) ?? []
    arr.push(c)
    cablesByGroup.set(key, arr)
  }

  return (
    <Card className="h-full p-3 bg-stone-100 dark:bg-stone-950 border-2 border-stone-300 dark:border-stone-800 flex flex-col gap-2 max-h-[35vh] lg:max-h-none overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
            {T.hud.inventory}
          </span>
        </div>
        <span className="text-xs text-stone-400 font-mono">
          {cables.length} cables
        </span>
      </div>

      {/* Cables agrupados */}
      <div className="flex-1 overflow-y-auto custom-scroll min-h-0">
        <div className="text-[10px] font-mono text-stone-400 uppercase mb-1">Carretes</div>
        {cablesByGroup.size === 0 ? (
          <div className="text-xs text-stone-400 italic py-2">Sin cable en stock</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {Array.from(cablesByGroup.entries()).map(([key, items]) => (
              <DraggableCable
                key={key}
                cable={items[0]}
                count={items.length}
                interactive={screen === 'playing'}
              />
            ))}
          </div>
        )}

        <div className="text-[10px] font-mono text-stone-400 uppercase mt-3 mb-1">Terminales</div>
        {terminals.length === 0 ? (
          <div className="text-xs text-stone-400 italic py-2">Sin terminales</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {groupTerminals(terminals).map((g) => (
              <DraggableTerminal
                key={g.type}
                terminal={g.items[0]}
                count={g.items.length}
                interactive={screen === 'playing'}
              />
            ))}
          </div>
        )}

        <div className="text-[10px] font-mono text-stone-400 uppercase mt-3 mb-1">Tubos</div>
        {tubes.filter((t) => !t.applied).length === 0 ? (
          <div className="text-xs text-stone-400 italic py-2">Sin tubos</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {groupTubes(tubes.filter((t) => !t.applied)).map((g) => (
              <DraggableTube
                key={g.items[0].id}
                tube={g.items[0]}
                count={g.items.length}
                interactive={screen === 'playing'}
              />
            ))}
          </div>
        )}

        {/* Power-ups */}
        {(coffeePending || tacoPending) && (
          <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800">
            <div className="text-[10px] font-mono text-stone-400 uppercase mb-1">Power-ups</div>
            <div className="flex gap-2">
              {coffeePending && (
                <DraggablePowerup type="coffee" interactive={screen === 'playing'} />
              )}
              {tacoPending && (
                <DraggablePowerup type="taco" interactive={screen === 'playing'} />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 text-[10px] text-stone-400 font-mono">
        <Package className="w-3 h-3" />
        Arrastra a la estación
      </div>
    </Card>
  )
}

function groupTerminals(terminals: ReturnType<typeof useInventoryStore.getState>['terminals']) {
  const map = new Map<string, typeof terminals>()
  for (const t of terminals) {
    const arr = map.get(t.type) ?? []
    arr.push(t)
    map.set(t.type, arr)
  }
  return Array.from(map.entries()).map(([type, items]) => ({ type, items }))
}

function groupTubes(tubes: ReturnType<typeof useInventoryStore.getState>['tubes']) {
  // Group all tubes together (no subtype)
  if (tubes.length === 0) return []
  return [{ items: tubes }]
}
