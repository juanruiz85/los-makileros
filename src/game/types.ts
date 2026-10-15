// src/game/types.ts
// Tipos del dominio del juego "Los Makileros: Sobreviviendo al Piso"

// === Entidades base ===
export type CableColor = 'red' | 'black' | 'yellow' | 'green' | 'white'
export type CableGauge = 18 | 20 | 22
export type TerminalType = 'FASTON-250' | 'FASTON-110' | 'RING-#8' | 'NONE'

export interface Cable {
  id: string
  color: CableColor
  gauge: CableGauge
  length_mm?: number // presente si ya cortado
  cut: boolean // ya pasó por cuchilla
  terminalA?: TerminalType
  terminalB?: TerminalType
  origin: 'inventory' | 'wip' | 'station'
}

export interface Terminal {
  id: string
  type: TerminalType
  used: boolean
}

export interface HeatShrinkTube {
  id: string
  applied: boolean
}

export interface Splice {
  id: string
  cableAId: string
  cableBId: string
  area: 1.0 | 2.0 | 3.0 | 4.0 | 5.0
  welded: boolean
  tubeApplied: boolean
  ovenPassed: boolean
  failedMelted: boolean
}

export interface HarnessCircuit {
  id: string
  sourceCableOrSpliceId: string
  connectorSlot: string // ej. "C1", "C2", "X-1"
  correct: boolean
}

export interface Harness {
  id: string
  circuits: HarnessCircuit[]
  tested: boolean
  testPassed: boolean
}

// === Tickets ===
export type TicketVariant =
  | 'standard'
  | 'rush'
  | 'bulk'
  | 'splice-heavy'
  | 'no-terminal'
  | 'long-roll'
  | 'taco-day'
  | 'client-visit'
  | 'heavy-day'

export interface Ticket {
  id: string
  partNumber: string
  circuitCount: number
  cableColor: CableColor
  cableGauge: CableGauge
  length_mm: number
  terminalA: TerminalType
  terminalB: TerminalType
  needsSplice: boolean
  needsHarness: boolean
  baseScore: number
  timeBonusOnComplete: number
  sameSetupAsPrevious: boolean
  status: 'active' | 'completed' | 'failed'
  variant?: TicketVariant
  variantLabel?: string
}

// === Eventos ===
export type EventKind =
  | 'supervisor-warn'
  | 'supervisor-angry'
  | 'maintenance'
  | 'gringo'
  | 'gossip'
  | 'quality-audit'
  | 'client-visit'
  | 'supervisor-rampage'

export interface GameEvent {
  id: string
  kind: EventKind
  startedAt: number
  duration: number
  resolved: boolean
  payload?: Record<string, unknown>
}

// === Estado global ===
export type GameScreen = 'title' | 'howto' | 'playing' | 'paused' | 'gameover'
export type StationKind = 'cut' | 'splice' | 'press' | 'harness'
export type GameMode = 'normal' | 'chaos' | 'free'

export interface RunStats {
  ticketsCompleted: number
  totalScore: number
  maxCombo: number
  timePlayedSec: number
  gringoEncounters: number
  errors: number
  startedAt: number
}

export interface GameSettings {
  sfxVolume: number // 0..1
  musicVolume: number // 0..1
  musicEnabled: boolean
  sfxEnabled: boolean
  reduceMotion: boolean
}

// === Drag & Drop ===
export type DraggableKind =
  | 'cable'
  | 'terminal'
  | 'tube'
  | 'splice'
  | 'circuit'
  | 'tool'
  | 'powerup'
  | 'ticket'

export type DropZoneId =
  | 'cut-blade'
  | 'cut-termA'
  | 'cut-termB'
  | 'cut-wip'
  | 'splice-machine-a'
  | 'splice-machine-b'
  | 'splice-area-selector'
  | 'splice-tube'
  | 'splice-band'
  | 'press-applicator'
  | 'press-scanner'
  | 'press-cable'
  | 'press-term'
  | 'harness-board'
  | 'harness-test-machine'
  | 'wip-tray'
  | 'trash'
  | 'character'
  | 'warehouse-cart'

export interface DragData {
  kind: DraggableKind
  payload: unknown
}
