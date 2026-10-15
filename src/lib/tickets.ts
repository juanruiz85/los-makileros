// src/lib/tickets.ts
// Generador procedural de tickets

import type { CableColor, CableGauge, Ticket, TerminalType } from '@/game/types'
import { PART_NUMBERS, SAME_SETUP_PROB, TERMINAL_TYPES } from '@/game/constants'
import { SeededRandom } from './random'
import { CABLE_COLORS, CABLE_GAUGES } from '@/game/constants'

let ticketSeq = 0

// Variantes especiales de tickets para dar variedad
export type TicketVariant =
  | 'standard' // ticket normal
  | 'rush' // orden apurada (más puntos, menos tiempo bonus)
  | 'bulk' // muchos circuitos (más puntos base)
  | 'splice-heavy' // requiere splice obligatoriamente
  | 'no-terminal' // cable pelado sin terminal (NONE en ambos)
  | 'long-roll' // cable muy largo (>400mm)

export interface TicketWithVariant extends Ticket {
  variant: TicketVariant
  variantLabel?: string
}

const VARIANT_WEIGHTS: Array<{ value: TicketVariant; weight: number }> = [
  { value: 'standard', weight: 50 },
  { value: 'rush', weight: 12 },
  { value: 'bulk', weight: 10 },
  { value: 'splice-heavy', weight: 8 },
  { value: 'no-terminal', weight: 10 },
  { value: 'long-roll', weight: 10 },
]

export function generateTicket(
  rng: SeededRandom,
  previousSetup?: Ticket | null
): TicketWithVariant {
  const partNumber = rng.pick(PART_NUMBERS)
  const sameSetupAsPrevious = previousSetup ? rng.chance(SAME_SETUP_PROB) : false

  // Decide variant first
  const variant = rng.weighted(VARIANT_WEIGHTS)

  let color: CableColor
  let gauge: CableGauge
  let length_mm: number
  let terminalA: TerminalType
  let terminalB: TerminalType

  if (sameSetupAsPrevious && previousSetup) {
    color = previousSetup.cableColor
    gauge = previousSetup.cableGauge
    length_mm = previousSetup.length_mm
    terminalA = previousSetup.terminalA
    terminalB = previousSetup.terminalB
  } else {
    color = rng.pick(CABLE_COLORS)
    gauge = rng.pick(CABLE_GAUGES)
    if (variant === 'long-roll') {
      length_mm = rng.int(400, 480)
    } else {
      length_mm = rng.int(80, 350)
    }

    if (variant === 'no-terminal') {
      terminalA = 'NONE'
      terminalB = 'NONE'
    } else {
      const hasTerminals = rng.chance(0.85)
      if (hasTerminals) {
        terminalA = rng.pick(TERMINAL_TYPES)
        terminalB = rng.chance(0.5) ? rng.pick(TERMINAL_TYPES) : terminalA
      } else {
        terminalA = 'NONE'
        terminalB = 'NONE'
      }
    }
  }

  // circuitCount based on variant
  let circuitCount: number
  switch (variant) {
    case 'bulk':
      circuitCount = rng.int(18, 24)
      break
    case 'rush':
      circuitCount = rng.int(2, 6) // pocos para que sean rápidos
      break
    case 'standard':
    default:
      circuitCount = rng.int(1, 16)
  }

  const needsSplice = variant === 'splice-heavy' ? true : rng.chance(0.30)
  const needsHarness = variant === 'splice-heavy' || variant === 'bulk' ? true : rng.chance(0.60)

  // Scoring según variant
  const complexity = circuitCount * 5 + (needsSplice ? 30 : 0) + (needsHarness ? 50 : 0)
  let baseScore = 100 + complexity
  let timeBonusOnComplete = 10

  let variantLabel: string | undefined
  if (variant === 'rush') {
    baseScore = Math.floor(baseScore * 1.5)
    timeBonusOnComplete = 5
    variantLabel = '⚡ RUSH'
  } else if (variant === 'bulk') {
    baseScore = Math.floor(baseScore * 1.3)
    variantLabel = '📦 BULK'
  } else if (variant === 'splice-heavy') {
    baseScore = Math.floor(baseScore * 1.4)
    variantLabel = '🔌 SPLICE'
  } else if (variant === 'no-terminal') {
    variantLabel = '🚫 NO TERM'
  } else if (variant === 'long-roll') {
    baseScore = Math.floor(baseScore * 1.15)
    variantLabel = '📏 LONG'
  }

  ticketSeq += 1
  const id = `TK-${Date.now().toString(36)}-${ticketSeq}`

  return {
    id,
    partNumber,
    circuitCount,
    cableColor: color,
    cableGauge: gauge,
    length_mm,
    terminalA,
    terminalB,
    needsSplice,
    needsHarness,
    baseScore,
    timeBonusOnComplete,
    sameSetupAsPrevious,
    status: 'active',
    variant,
    variantLabel,
  }
}

// Helper: setup key para detectar bonus
export function setupKey(t: Ticket): string {
  return `${t.cableColor}-${t.cableGauge}-${t.terminalA}-${t.terminalB}`
}

// Helper: ¿es terminal obligatorio?
export function isTerminalRequired(circuitCount: number): boolean {
  return circuitCount > 10
}
