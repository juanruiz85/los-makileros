'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useGameStore } from '@/game/store/gameStore'
import { audio } from '@/lib/audio'
import { CABLE_COLORS, CABLE_GAUGES, TERMINAL_TYPES } from '@/game/constants'
import { CABLE_COLOR_HEX, CABLE_COLOR_LABEL, TERMINAL_LABEL } from '@/game/constants'
import { Button } from '@/components/ui/button'
import { WAREHOUSE_DELIVERY_SEC, WAREHOUSE_RUSHED_ERROR_PROB } from '@/game/constants'
import { Package, ShoppingCart, Truck, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface WarehouseSheetProps {
  open: boolean
  onOpenChange: (b: boolean) => void
}

export function WarehouseSheet({ open, onOpenChange }: WarehouseSheetProps) {
  const cartItems = useInventoryStore((s) => s.cartItems)
  const addToCart = useInventoryStore((s) => s.addToCart)
  const clearCart = useInventoryStore((s) => s.clearCart)
  const finishDelivery = useInventoryStore((s) => s.finishDelivery)
  const deliveryProgress = useInventoryStore((s) => s.deliveryProgress)
  const deliveryInProgress = useInventoryStore((s) => s.deliveryInProgress)
  const startDelivery = useInventoryStore((s) => s.startDelivery)
  const updateDelivery = useInventoryStore((s) => s.updateDelivery)
  const cables = useInventoryStore((s) => s.cables)
  const terminals = useInventoryStore((s) => s.terminals)
  const tubes = useInventoryStore((s) => s.tubes)

  const mode = useGameStore((s) => s.mode)
  // Rushed: cuando inventario está vacío
  const rushed = cables.length === 0 || terminals.length === 0
  const duration = rushed ? WAREHOUSE_DELIVERY_SEC.rushed : WAREHOUSE_DELIVERY_SEC.normal

  // Update delivery progress
  useEffect(() => {
    if (!deliveryInProgress) return
    let raf: number
    let last = performance.now()
    const loop = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      const inv = useInventoryStore.getState()
      inv.updateDelivery(delta, duration)
      if (useInventoryStore.getState().deliveryProgress >= 1) {
        audio.play('click-ok')
        const errorProb = rushed ? WAREHOUSE_RUSHED_ERROR_PROB : 0.05
        finishDelivery(errorProb)
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [deliveryInProgress, duration, rushed, finishDelivery])

  const handleSendOrder = () => {
    if (cartItems.length === 0) return
    audio.play('click-ok')
    startDelivery(duration)
  }

  const handleAddCable = (color: typeof CABLE_COLORS[number], gauge: typeof CABLE_GAUGES[number]) => {
    addToCart({
      kind: 'cable',
      payload: { id: 'cart-cable', color, gauge, cut: false, origin: 'inventory' },
    })
    audio.play('click-ok')
  }

  const handleAddTerminal = (type: typeof TERMINAL_TYPES[number]) => {
    addToCart({ kind: 'terminal', payload: { id: 'cart-term', type, used: false } })
    audio.play('click-ok')
  }

  const handleAddTube = () => {
    addToCart({ kind: 'tube', payload: {} })
    audio.play('click-ok')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-stone-50 dark:bg-stone-950 border-amber-500 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
            <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            Almacén
          </SheetTitle>
          <SheetDescription>
            Pide material. Si tu inventario está vacío, el almacenista se estresa y manda cosas equivocadas.
          </SheetDescription>
        </SheetHeader>

        {rushed && !deliveryInProgress && (
          <div className="mt-3 px-3 py-2 bg-red-100 dark:bg-red-950 border border-red-400 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="font-mono">¡APURADO! El almacenista se estresa (+30% error)</span>
          </div>
        )}

        {/* Catálogo de cables */}
        <div className="mt-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-2">
            Cables (carretes)
          </div>
          <div className="grid grid-cols-3 gap-2">
            {CABLE_COLORS.map((color) =>
              CABLE_GAUGES.map((gauge) => (
                <button
                  key={`${color}-${gauge}`}
                  onClick={() => handleAddCable(color, gauge)}
                  disabled={deliveryInProgress}
                  className="flex items-center gap-1 p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div
                    className="w-5 h-5 rounded-full border border-stone-400"
                    style={{ background: CABLE_COLOR_HEX[color] }}
                  />
                  <div className="text-[10px] font-mono">
                    <div className="font-bold">{CABLE_COLOR_LABEL[color].slice(0, 3)}</div>
                    <div className="text-stone-400">{gauge}</div>
                  </div>
                  <span className="ml-auto text-stone-400 text-lg">+</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Catálogo de terminales */}
        <div className="mt-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-2">
            Terminales
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TERMINAL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleAddTerminal(type)}
                disabled={deliveryInProgress}
                className="p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-[10px] font-mono font-bold text-stone-700 dark:text-stone-200">
                  {TERMINAL_LABEL[type]}
                </div>
                <div className="text-right text-stone-400 text-lg">+</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tubos */}
        <div className="mt-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-2">
            Tubos Heat Shrink
          </div>
          <button
            onClick={handleAddTube}
            disabled={deliveryInProgress}
            className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <div className="w-12 h-3 rounded-full bg-gradient-to-r from-orange-300 via-red-400 to-orange-300 border border-stone-500" />
            <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-200">
              Tubo
            </span>
            <span className="ml-auto text-stone-400 text-lg">+</span>
          </button>
        </div>

        {/* Carrito */}
        <div className="mt-6 pt-4 border-t-2 border-stone-300 dark:border-stone-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-stone-500" />
              <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
                Carrito
              </span>
            </div>
            <button
              onClick={clearCart}
              disabled={cartItems.length === 0 || deliveryInProgress}
              className="text-[10px] font-mono text-red-500 hover:underline disabled:opacity-50"
            >
              Vaciar
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-xs text-stone-400 italic py-3 text-center">
              Carrito vacío. Agrega material arriba.
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 mb-3">
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="text-[10px] font-mono px-2 py-1 bg-stone-200 dark:bg-stone-800 rounded text-stone-700 dark:text-stone-200"
                >
                  {item.kind}
                </div>
              ))}
            </div>
          )}

          {deliveryInProgress && (
            <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950 border border-amber-400 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-mono text-amber-700 dark:text-amber-300">
                  En camino... {Math.round(deliveryProgress * 100)}%
                </span>
              </div>
              <div className="h-2 bg-stone-200 dark:bg-stone-800 rounded overflow-hidden">
                <motion.div
                  animate={{ width: `${deliveryProgress * 100}%` }}
                  className="h-full bg-amber-500"
                />
              </div>
            </div>
          )}

          <SheetFooter>
            <Button
              onClick={handleSendOrder}
              disabled={cartItems.length === 0 || deliveryInProgress}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              <Truck className="w-4 h-4 mr-2" />
              Enviar Pedido ({cartItems.length})
            </Button>
          </SheetFooter>
        </div>

        {/* Stock actual */}
        <div className="mt-4 p-3 bg-stone-100 dark:bg-stone-900 rounded-lg">
          <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-2">
            Stock actual
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold font-mono text-stone-700 dark:text-stone-200">
                {cables.length}
              </div>
              <div className="text-[10px] text-stone-400">Cables</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-stone-700 dark:text-stone-200">
                {terminals.length}
              </div>
              <div className="text-[10px] text-stone-400">Terminales</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-stone-700 dark:text-stone-200">
                {tubes.filter((t) => !t.applied).length}
              </div>
              <div className="text-[10px] text-stone-400">Tubos</div>
            </div>
          </div>
        </div>

        {mode === 'chaos' && (
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-950 border border-red-400 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-mono">Modo Caótico: almacenista 2x más lento</span>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
