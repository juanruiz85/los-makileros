// src/lib/tickets.ts
// Generador procedural de tickets

import type { CableColor, CableGauge, Ticket, TerminalType } from '@/game/types'
import { PART_NUMBERS, SAME_SETUP_PROB, TERMINAL_TYPES } from '@/game/constants'
import { SeededRandom } from './random'
import { CABLE_COLORS, CABLE_GAUGES } from '@/game/constants'

let ticketSeq = 0

export function generateTicket(rng: SeededRandom, previousSetup?: Ticket | null): Ticket {
  const partNumber = rng.pick(PART_NUMBERS)
  const sameSetupAsPrevious = previousSetup
    ? rng.chance(SAME_SETUP_PROB)
    : false

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
    length_mm = rng.int(80, 450)
    // 85% de tickets llevan terminales; si no, NONE
    const hasTerminals = rng.chance(0.85)
    if (hasTerminals) {
      terminalA = rng.pick(TERMINAL_TYPES)
      terminalB = rng.chance(0.5) ? rng.pick(TERMINAL_TYPES) : terminalA
    } else {
      terminalA = 'NONE'
      terminalB = 'NONE'
    }
  }

  const circuitCount = rng.int(1, 24)
  const needsSplice = rng.chance(0.30)
  const needsHarness = rng.chance(0.60)

  // Scoring base
  const complexity = circuitCount * 5 + (needsSplice ? 30 : 0) + (needsHarness ? 50 : 0)
  const baseScore = 100 + complexity
  const timeBonusOnComplete = 10

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
