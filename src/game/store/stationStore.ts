// src/game/store/stationStore.ts
// Estado de las estaciones activas

'use client'

import { create } from 'zustand'
import type { Cable, HeatShrinkTube, StationKind, Terminal } from '../types'

interface HarnessSlot {
  slot: string // ej. "C1", "C2", "X-1"
  circuitId?: string
  correct?: boolean
}

interface SpliceResult {
  id: string
  cableAId: string
  cableBId: string
  area: number
  welded: boolean
  tubeApplied: boolean
  ovenPassed: boolean
  failedMelted: boolean
}

interface StationStoreState {
  active: StationKind
  // Corte
  cutBladeCable: Cable | null
  cutTermA: Terminal | null
  cutTermB: Terminal | null
  cutReady: boolean
  // Splices
  spliceCableA: Cable | null
  spliceCableB: Cable | null
  spliceSelectedArea: number | null
  spliceTube: HeatShrinkTube | null
  spliceWelding: boolean // animación de soldadura en curso
  spliceWelded: boolean // ya pasó por la máquina de ultrasonido
  spliceOnBand: SpliceResult | null // ensamble listo para entrar al horno
  spliceReady: boolean // tube aplicado + listo para horno
  // Banda transportadora
  bandItems: Array<{ id: string; type: 'splice'; progress: number; failed: boolean }>
  // Prensas
  pressApplicator: string | null
  pressScannerDone: boolean
  pressCable: Cable | null
  pressTerminal: Terminal | null
  // Harness
  harnessBoard: HarnessSlot[]
  harnessTested: boolean
  harnessTestResult: 'pending' | 'passed' | 'failed' | null
  // Acciones
  setActive: (s: StationKind) => void
  setCutBladeCable: (c: Cable | null) => void
  setCutTerm: (side: 'A' | 'B', t: Terminal | null) => void
  clearCutStation: () => void
  setCutReady: (b: boolean) => void
  setSpliceCable: (side: 'A' | 'B', c: Cable | null) => void
  setSpliceArea: (a: number | null) => void
  setSpliceTube: (t: HeatShrinkTube | null) => void
  setSpliceWelding: (b: boolean) => void
  setSpliceWelded: (b: boolean) => void
  setSpliceOnBand: (s: SpliceResult | null) => void
  setSpliceReady: (b: boolean) => void
  clearSpliceStation: () => void
  addBandItem: (id: string, failed: boolean) => void
  updateBandItems: (deltaSec: number, speed: number) => void
  removeBandItem: (id: string) => void
  clearBand: () => void
  setPressApplicator: (a: string | null) => void
  setPressScannerDone: (b: boolean) => void
  setPressCable: (c: Cable | null) => void
  setPressTerminal: (t: Terminal | null) => void
  clearPressStation: () => void
  setHarnessBoard: (b: HarnessSlot[]) => void
  setHarnessTested: (b: boolean) => void
  setHarnessTestResult: (r: 'pending' | 'passed' | 'failed' | null) => void
  clearHarnessStation: () => void
  resetAll: () => void
}

export const useStationStore = create<StationStoreState>((set) => ({
  active: 'cut',
  cutBladeCable: null,
  cutTermA: null,
  cutTermB: null,
  cutReady: false,
  spliceCableA: null,
  spliceCableB: null,
  spliceSelectedArea: null,
  spliceTube: null,
  spliceWelding: false,
  spliceWelded: false,
  spliceOnBand: null,
  spliceReady: false,
  bandItems: [],
  pressApplicator: null,
  pressScannerDone: false,
  pressCable: null,
  pressTerminal: null,
  harnessBoard: [],
  harnessTested: false,
  harnessTestResult: null,

  setActive: (s) => set({ active: s }),
  setCutBladeCable: (c) => set({ cutBladeCable: c }),
  setCutTerm: (side, t) =>
    set(side === 'A' ? { cutTermA: t } : { cutTermB: t }),
  clearCutStation: () =>
    set({ cutBladeCable: null, cutTermA: null, cutTermB: null, cutReady: false }),
  setCutReady: (b) => set({ cutReady: b }),
  setSpliceCable: (side, c) =>
    set(side === 'A' ? { spliceCableA: c } : { spliceCableB: c }),
  setSpliceArea: (a) => set({ spliceSelectedArea: a }),
  setSpliceTube: (t) => set({ spliceTube: t }),
  setSpliceWelding: (b) => set({ spliceWelding: b }),
  setSpliceWelded: (b) => set({ spliceWelded: b }),
  setSpliceOnBand: (s) => set({ spliceOnBand: s }),
  setSpliceReady: (b) => set({ spliceReady: b }),
  clearSpliceStation: () =>
    set({
      spliceCableA: null,
      spliceCableB: null,
      spliceSelectedArea: null,
      spliceTube: null,
      spliceWelding: false,
      spliceWelded: false,
      spliceOnBand: null,
      spliceReady: false,
    }),
  addBandItem: (id, failed) =>
    set((s) => ({
      bandItems: [...s.bandItems, { id, type: 'splice', progress: 0, failed }],
    })),
  updateBandItems: (deltaSec, speed) =>
    set((s) => ({
      bandItems: s.bandItems.map((item) => ({
        ...item,
        progress: Math.min(1, item.progress + deltaSec * speed),
      })),
    })),
  removeBandItem: (id) =>
    set((s) => ({ bandItems: s.bandItems.filter((i) => i.id !== id) })),
  clearBand: () => set({ bandItems: [] }),
  setPressApplicator: (a) => set({ pressApplicator: a }),
  setPressScannerDone: (b) => set({ pressScannerDone: b }),
  setPressCable: (c) => set({ pressCable: c }),
  setPressTerminal: (t) => set({ pressTerminal: t }),
  clearPressStation: () =>
    set({
      pressApplicator: null,
      pressScannerDone: false,
      pressCable: null,
      pressTerminal: null,
    }),
  setHarnessBoard: (b) => set({ harnessBoard: b }),
  setHarnessTested: (b) => set({ harnessTested: b }),
  setHarnessTestResult: (r) => set({ harnessTestResult: r }),
  clearHarnessStation: () =>
    set({ harnessBoard: [], harnessTested: false, harnessTestResult: null }),
  resetAll: () =>
    set({
      active: 'cut',
      cutBladeCable: null,
      cutTermA: null,
      cutTermB: null,
      cutReady: false,
      spliceCableA: null,
      spliceCableB: null,
      spliceSelectedArea: null,
      spliceTube: null,
      spliceWelding: false,
      spliceWelded: false,
      spliceOnBand: null,
      spliceReady: false,
      bandItems: [],
      pressApplicator: null,
      pressScannerDone: false,
      pressCable: null,
      pressTerminal: null,
      harnessBoard: [],
      harnessTested: false,
      harnessTestResult: null,
    }),
}))
