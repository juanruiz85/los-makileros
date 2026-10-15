// src/game/store/stationStore.ts
// Estado de las estaciones activas

'use client'

import { create } from 'zustand'
import type { Cable, StationKind, Terminal } from '../types'

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
  spliceTube: boolean
  // Prensas
  pressApplicator: string | null
  pressScannerDone: boolean
  pressCable: Cable | null
  pressTerminal: Terminal | null
  // Harness
  harnessBoard: Array<{ slot: string; circuitId?: string; correct?: boolean }>
  harnessTested: boolean
  // Acciones
  setActive: (s: StationKind) => void
  setCutBladeCable: (c: Cable | null) => void
  setCutTerm: (side: 'A' | 'B', t: Terminal | null) => void
  clearCutStation: () => void
  setCutReady: (b: boolean) => void
  setSpliceCable: (side: 'A' | 'B', c: Cable | null) => void
  setSpliceArea: (a: number | null) => void
  setSpliceTube: (b: boolean) => void
  clearSpliceStation: () => void
  setPressApplicator: (a: string | null) => void
  setPressScannerDone: (b: boolean) => void
  setPressCable: (c: Cable | null) => void
  setPressTerminal: (t: Terminal | null) => void
  clearPressStation: () => void
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
  spliceTube: false,
  pressApplicator: null,
  pressScannerDone: false,
  pressCable: null,
  pressTerminal: null,
  harnessBoard: [],
  harnessTested: false,

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
  setSpliceTube: (b) => set({ spliceTube: b }),
  clearSpliceStation: () =>
    set({
      spliceCableA: null,
      spliceCableB: null,
      spliceSelectedArea: null,
      spliceTube: false,
    }),
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
      spliceTube: false,
      pressApplicator: null,
      pressScannerDone: false,
      pressCable: null,
      pressTerminal: null,
      harnessBoard: [],
      harnessTested: false,
    }),
}))
