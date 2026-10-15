'use client'

import React from 'react'
import { TopBar } from '../layout/TopBar'
import { InventoryPanel } from '../layout/InventoryPanel'
import { WorkArea } from '../layout/WorkArea'
import { TicketPanel } from '../layout/TicketPanel'
import { BottomBar } from '../layout/BottomBar'
import { WipTray } from '../layout/WipTray'

export function GameScreen({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <div
      className={`relative h-[calc(100vh-60px)] flex flex-col bg-stone-200 dark:bg-stone-900 transition-all ${
        dimmed ? 'brightness-50 blur-[2px] pointer-events-none' : ''
      }`}
    >
      {/* Banda decorativa superior */}
      <div className="h-2 bg-[repeating-linear-gradient(45deg,#fbbf24_0,#fbbf24_20px,#1c1917_20px,#1c1917_40px)]" />

      <TopBar />

      <div className="flex-1 flex flex-col lg:flex-row gap-2 p-2 overflow-hidden">
        {/* Inventario - izquierda */}
        <div className="order-2 lg:order-1 lg:w-64 flex-shrink-0">
          <InventoryPanel />
        </div>

        {/* Área de trabajo - centro */}
        <div className="order-1 lg:order-2 flex-1 flex flex-col gap-2 min-h-0">
          <WorkArea />
          <WipTray />
        </div>

        {/* Ticket - derecha */}
        <div className="order-3 lg:w-72 flex-shrink-0">
          <TicketPanel />
        </div>
      </div>

      <BottomBar />
    </div>
  )
}
