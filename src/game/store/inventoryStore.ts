// src/game/store/inventoryStore.ts
// Inventario del jugador: cables, terminales, tubos, WIP, carrito almacén

'use client'

import { create } from 'zustand'
import type { Cable, HeatShrinkTube, Terminal, TerminalType } from '../types'
import { CABLE_COLORS, CABLE_GAUGES, INITIAL_INVENTORY, TERMINAL_TYPES } from '../constants'

type WipItem = Cable | HeatShrinkTube | Terminal | { id: string; kind: 'splice'; spliceId: string }

interface InventoryStoreState {
  cables: Cable[]
  terminals: Terminal[]
  tubes: HeatShrinkTube[]
  wip: WipItem[]
  // powerups pending en inventario
  coffeePending: boolean
  tacoPending: boolean
  // pedido almacén
  cartItems: Array<{ kind: 'cable' | 'terminal' | 'tube'; payload: unknown }>
  deliveryProgress: number // 0..1
  deliveryInProgress: boolean
  // acciones
  initInventory: () => void
  addCable: (c: Cable) => void
  removeCable: (id: string) => void
  addTerminal: (t: Terminal) => void
  removeTerminal: (id: string) => void
  consumeTube: (id: string) => void
  consumeCoffee: () => void
  consumeTaco: () => void
  moveToWip: (item: WipItem) => void
  removeFromWip: (id: string) => void
  clearWip: () => void
  addToCart: (item: { kind: 'cable' | 'terminal' | 'tube'; payload: unknown }) => void
  clearCart: () => void
  startDelivery: (durationSec: number) => void
  updateDelivery: (delta: number, durationSec: number) => void
  finishDelivery: (wrongItemProb: number) => void
  reset: () => void
}

let seq = 0
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${seq++}`

export const useInventoryStore = create<InventoryStoreState>((set, get) => ({
  cables: [],
  terminals: [],
  tubes: [],
  wip: [],
  coffeePending: false,
  tacoPending: false,
  cartItems: [],
  deliveryProgress: 0,
  deliveryInProgress: false,

  initInventory: () => {
    const cables: Cable[] = []
    for (const color of CABLE_COLORS) {
      for (const gauge of CABLE_GAUGES) {
        for (let i = 0; i < INITIAL_INVENTORY.cablesPerColor; i++) {
          cables.push({
            id: nextId('cable'),
            color,
            gauge,
            cut: false,
            origin: 'inventory',
          })
        }
      }
    }
    const terminals: Terminal[] = []
    for (const type of TERMINAL_TYPES) {
      for (let i = 0; i < INITIAL_INVENTORY.terminalsPerType; i++) {
        terminals.push({ id: nextId('term'), type, used: false })
      }
    }
    const tubes: HeatShrinkTube[] = []
    for (let i = 0; i < INITIAL_INVENTORY.tubes; i++) {
      tubes.push({ id: nextId('tube'), applied: false })
    }
    set({ cables, terminals, tubes, wip: [] })
  },

  addCable: (c) => set((s) => ({ cables: [...s.cables, c] })),
  removeCable: (id) => set((s) => ({ cables: s.cables.filter((c) => c.id !== id) })),

  addTerminal: (t) => set((s) => ({ terminals: [...s.terminals, t] })),
  removeTerminal: (id) => set((s) => ({ terminals: s.terminals.filter((t) => t.id !== id) })),

  consumeTube: (id) =>
    set((s) => ({ tubes: s.tubes.map((t) => (t.id === id ? { ...t, applied: true } : t)) })),

  consumeCoffee: () => set({ coffeePending: false }),
  consumeTaco: () => set({ tacoPending: false }),

  moveToWip: (item) =>
    set((s) => {
      if (s.wip.length >= 12) {
        // se cae el más viejo
        return { wip: [...s.wip.slice(1), item] }
      }
      return { wip: [...s.wip, item] }
    }),

  removeFromWip: (id) => set((s) => ({ wip: s.wip.filter((i) => i.id !== id) })),
  clearWip: () => set({ wip: [] }),

  addToCart: (item) => set((s) => ({ cartItems: [...s.cartItems, item] })),
  clearCart: () => set({ cartItems: [] }),

  startDelivery: (durationSec) =>
    set({ deliveryInProgress: true, deliveryProgress: 0 }),

  updateDelivery: (delta, durationSec) =>
    set((s) => {
      if (!s.deliveryInProgress) return {}
      const inc = delta / durationSec
      const np = Math.min(1, s.deliveryProgress + inc)
      if (np >= 1) {
        return { deliveryProgress: 1, deliveryInProgress: false }
      }
      return { deliveryProgress: np }
    }),

  finishDelivery: (wrongItemProb) => {
    const s = get()
    // Resuelve el carrito: agrega items, con posibilidad de error
    const willFail = Math.random() < wrongItemProb
    const newCables: Cable[] = []
    const newTerminals: Terminal[] = []
    const newTubes: HeatShrinkTube[] = []
    let coffee = false
    let taco = false
    // 10% chance café, 5% taco en cualquier pedido
    if (Math.random() < 0.1) coffee = true
    if (Math.random() < 0.05) taco = true

    for (const item of s.cartItems) {
      if (item.kind === 'cable') {
        const payload = item.payload as Cable
        const realCable = willFail
          ? { ...payload, color: pickRandomColor(), id: nextId('cable') }
          : { ...payload, id: nextId('cable') }
        newCables.push(realCable)
      } else if (item.kind === 'terminal') {
        const payload = item.payload as Terminal
        const realTerm = willFail
          ? { ...payload, type: pickRandomTerminal(), id: nextId('term') }
          : { ...payload, id: nextId('term') }
        newTerminals.push(realTerm)
      } else if (item.kind === 'tube') {
        newTubes.push({ id: nextId('tube'), applied: false })
      }
    }
    set({
      cables: [...s.cables, ...newCables],
      terminals: [...s.terminals, ...newTerminals],
      tubes: [...s.tubes, ...newTubes],
      cartItems: [],
      deliveryProgress: 0,
      deliveryInProgress: false,
      coffeePending: coffee,
      tacoPending: taco,
    })
  },

  reset: () =>
    set({
      cables: [],
      terminals: [],
      tubes: [],
      wip: [],
      cartItems: [],
      deliveryProgress: 0,
      deliveryInProgress: false,
      coffeePending: false,
      tacoPending: false,
    }),
}))

function pickRandomColor() {
  const idx = Math.floor(Math.random() * CABLE_COLORS.length)
  return CABLE_COLORS[idx]
}

function pickRandomTerminal(): TerminalType {
  const idx = Math.floor(Math.random() * TERMINAL_TYPES.length)
  return TERMINAL_TYPES[idx]
}
