'use client'

import React from 'react'
import { useStationStore } from '@/game/store/stationStore'
import { CutStation } from '../stations/CutStation'
import { Card } from '@/components/ui/card'
import { Wrench, Cable, Grid3x3 } from 'lucide-react'
import { T } from '@/lib/i18n'

export function WorkArea() {
  const active = useStationStore((s) => s.active)

  return (
    <Card className="flex-1 min-h-0 p-3 bg-stone-50 dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-800 shadow-inner relative overflow-hidden">
      {/* Header del área */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center">
            {active === 'cut' && <Wrench className="w-5 h-5 text-stone-900" />}
            {active === 'splice' && <Cable className="w-5 h-5 text-stone-900" />}
            {active === 'press' && <Wrench className="w-5 h-5 text-stone-900" />}
            {active === 'harness' && <Grid3x3 className="w-5 h-5 text-stone-900" />}
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">
              {T.hud.station}
            </div>
            <div className="font-bold text-sm">
              {active === 'cut' && T.hud.cut}
              {active === 'splice' && T.hud.splice}
              {active === 'press' && T.hud.press}
              {active === 'harness' && T.hud.harness}
            </div>
          </div>
        </div>
        <div className="text-[10px] font-mono text-stone-400 uppercase">
          Estación activa
        </div>
      </div>

      <div className="h-[calc(100%-40px)] overflow-y-auto custom-scroll">
        {active === 'cut' && <CutStation />}
        {active === 'splice' && <ComingSoon label="Splices (próximamente)" />}
        {active === 'press' && <ComingSoon label="Prensas (próximamente)" />}
        {active === 'harness' && <ComingSoon label="Harness (próximamente)" />}
      </div>
    </Card>
  )
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-3">
      <div className="w-16 h-16 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center">
        <Wrench className="w-8 h-8" />
      </div>
      <div className="text-sm font-mono uppercase tracking-widest">{label}</div>
      <div className="text-xs">Esta estación está en desarrollo</div>
    </div>
  )
}
