// src/game/dragResolver.ts
// Resolutor central de drag & drop para el juego
// Recibe un DragEndEvent de @dnd-kit y aplica la lógica de negocio

'use client'

import type { DragEndEvent } from '@dnd-kit/core'
import type { Cable, HeatShrinkTube, Terminal } from './types'
import { useGameStore } from './store/gameStore'
import { useInventoryStore } from './store/inventoryStore'
import { useStationStore } from './store/stationStore'
import { useEventStore } from './store/eventStore'
import { useAchievementStore } from './store/achievementStore'
import { audio } from '@/lib/audio'
import {
  SCORE,
  TIME_BONUS,
  TIME_PENALTY,
} from './constants'
import { isTerminalRequired } from '@/lib/tickets'

interface DragData {
  kind: string
  payload: unknown
}

export function resolveDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over) return
  const data = active.data.current as DragData | undefined
  if (!data) return
  const zoneId = over.id as string
  const handlerKey = `${data.kind}->${zoneId}`

  switch (handlerKey) {
    // === CORTE ===
    case 'cable->cut-blade':
      return handleCableToBlade(data.payload as Cable)
    case 'terminal->cut-termA':
      return handleTerminalToCut('A', data.payload as Terminal)
    case 'terminal->cut-termB':
      return handleTerminalToCut('B', data.payload as Terminal)
    case 'cable->cut-wip':
      return handleCableToWip(data.payload as Cable)
    case 'cable->wip-tray':
      return handleCableToWip(data.payload as Cable)
    case 'cable->trash':
      return handleCableToTrash(data.payload as Cable)
    case 'terminal->trash':
      return handleTerminalToTrash(data.payload as Terminal)

    // === SPLICES ===
    case 'cable->splice-machine-a':
      return handleCableToSplice('A', data.payload as Cable)
    case 'cable->splice-machine-b':
      return handleCableToSplice('B', data.payload as Cable)
    case 'tube->splice-tube':
      return handleTubeToSplice(data.payload as HeatShrinkTube)
    case 'splice->splice-band':
      return handleSpliceToBand()

    // === PRENSAS ===
    case 'cable->press-cable':
      return handleCableToPress(data.payload as Cable)
    case 'terminal->press-term':
      return handleTerminalToPress(data.payload as Terminal)

    // === HARNESS ===
    case 'cable->harness-board':
      return handleCableToHarness(data.payload as Cable)
    case 'cable->harness-test-machine':
      return handleHarnessTest()

    // === POWERUPS ===
    case 'powerup->character':
      return handlePowerupConsume(data.payload as { type: 'coffee' | 'taco' })

    default:
      // Check for harness-slot-* pattern (dynamic per-slot dropzones)
      if (zoneId.startsWith('harness-slot-') && data.kind === 'cable') {
        return handleCableToHarnessSlot(zoneId, data.payload as Cable)
      }
      // item soltado en zona que no lo acepta: no-op
      return
  }
}

function handleCableToBlade(cable: Cable) {
  const game = useGameStore.getState()
  const station = useStationStore.getState()
  const inv = useInventoryStore.getState()
  if (!game.currentTicket) return

  // Saca el cable del inventario
  inv.removeCable(cable.id)
  // Coloca en la cuchilla
  station.setCutBladeCable({ ...cable, origin: 'station' })
  audio.play('click-ok')
}

function handleTerminalToCut(side: 'A' | 'B', terminal: Terminal) {
  const station = useStationStore.getState()
  const inv = useInventoryStore.getState()
  inv.removeTerminal(terminal.id)
  station.setCutTerm(side, { ...terminal, used: true })
  audio.play('click-ok')
}

function handleCableToWip(cable: Cable) {
  const game = useGameStore.getState()
  const station = useStationStore.getState()
  const inv = useInventoryStore.getState()
  if (!game.currentTicket) return

  // Si el cable está en la cuchilla, validamos el corte
  const bladeCable = station.cutBladeCable
  if (!bladeCable || bladeCable.id !== cable.id) {
    // No está en blade, no se puede cortar
    return
  }

  // Validar el corte
  const ticket = game.currentTicket
  const colorMatch = bladeCable.color === ticket.cableColor
  const gaugeMatch = bladeCable.gauge === ticket.cableGauge

  if (!colorMatch || !gaugeMatch) {
    // Error: cable equivocado cortado
    game.loseTime(TIME_PENALTY.cutWrong)
    game.addScore(SCORE.cutWrong)
    game.registerError()
    game.breakCombo()
    audio.play('buzz-fail')
    useEventStore.getState().spawnSupervisorWarn()
    station.clearCutStation()
    return
  }

  // ¿Terminal obligatorio?
  const terminalReq = isTerminalRequired(ticket.circuitCount)
  const hasTermA = station.cutTermA !== null
  const hasTermB = station.cutTermB !== null
  const terminalMatchesA =
    hasTermA &&
    station.cutTermA!.type === (ticket.terminalA === 'NONE' ? station.cutTermA!.type : ticket.terminalA)
  const terminalMatchesB =
    hasTermB &&
    station.cutTermB!.type === (ticket.terminalB === 'NONE' ? station.cutTermB!.type : ticket.terminalB)

  if (terminalReq && ticket.terminalA !== 'NONE' && !terminalMatchesA) {
    game.loseTime(TIME_PENALTY.missingTerminalGt10)
  }
  if (terminalReq && ticket.terminalB !== 'NONE' && !terminalMatchesB) {
    game.loseTime(TIME_PENALTY.missingTerminalGt10)
  }

  // Puntos
  game.addScore(SCORE.cutCorrect)
  if (terminalMatchesA) game.addScore(SCORE.terminalOptional)
  if (terminalMatchesB) game.addScore(SCORE.terminalOptional)
  game.addTime(TIME_BONUS.cutCorrect)
  game.bumpCombo()
  game.resetConsecutiveErrors()
  audio.play('cut-slice')
  audio.play('click-ok')

  // Mueve el cable cortado al WIP
  const cutCable: Cable = {
    ...bladeCable,
    cut: true,
    length_mm: ticket.length_mm,
    terminalA: station.cutTermA?.type ?? 'NONE',
    terminalB: station.cutTermB?.type ?? 'NONE',
    origin: 'wip',
  }
  inv.moveToWip(cutCable)
  station.clearCutStation()
}

function handleCableToTrash(cable: Cable) {
  const inv = useInventoryStore.getState()
  inv.removeCable(cable.id)
  inv.removeFromWip(cable.id)
  audio.play('click-ok')
}

function handleTerminalToTrash(terminal: Terminal) {
  const inv = useInventoryStore.getState()
  inv.removeTerminal(terminal.id)
  audio.play('click-ok')
}

// === PRENSAS ===

function handleCableToPress(cable: Cable) {
  const station = useStationStore.getState()
  const inv = useInventoryStore.getState()
  // Solo cables cortados
  if (!cable.cut) {
    audio.play('buzz-fail')
    useEventStore.getState().setSubtitle(
      '⚠ Solo cables cortados van a la prensa',
      'text-amber-500',
      3000,
    )
    return
  }
  inv.removeFromWip(cable.id)
  station.setPressCable({ ...cable, origin: 'station' })
  audio.play('click-ok')
}

function handleTerminalToPress(terminal: Terminal) {
  const station = useStationStore.getState()
  const inv = useInventoryStore.getState()
  inv.removeTerminal(terminal.id)
  station.setPressTerminal({ ...terminal, used: true })
  audio.play('click-ok')
}

// === SPLICES ===

function handleCableToSplice(side: 'A' | 'B', cable: Cable) {
  const station = useStationStore.getState()
  const inv = useInventoryStore.getState()
  // Solo aceptamos cables ya cortados (origin = wip)
  if (cable.origin === 'inventory') {
    // Si el jugador arrastra cable sin cortar, devolver con warning
    audio.play('buzz-fail')
    useEventStore.getState().setSubtitle(
      '⚠ Primero corta el cable en la cuchilla',
      'text-amber-500',
      3000
    )
    return
  }
  // Quita el cable del WIP
  inv.removeFromWip(cable.id)
  // Coloca en la máquina de splice
  station.setSpliceCable(side, { ...cable, origin: 'station' })
  audio.play('click-ok')
}

function handleTubeToSplice(tube: HeatShrinkTube) {
  const station = useStationStore.getState()
  const inv = useInventoryStore.getState()
  if (!station.spliceWelded) {
    // Primero hay que soldar
    audio.play('buzz-fail')
    useEventStore.getState().setSubtitle(
      '⚠ Suelda primero con el ultrasonido',
      'text-amber-500',
      3000
    )
    return
  }
  inv.consumeTube(tube.id)
  station.setSpliceTube({ ...tube, applied: true })
  station.setSpliceReady(true)
  audio.play('click-ok')
}

function handleSpliceToBand() {
  const station = useStationStore.getState()
  const game = useGameStore.getState()
  const inv = useInventoryStore.getState()
  if (!station.spliceOnBand) return
  // No tiene tubo → entra al horno derretido
  const failedMelted = !station.spliceTube
  const splice = station.spliceOnBand
  station.addBandItem(splice.id, failedMelted)
  if (failedMelted) {
    audio.play('oven-whoosh')
    useEventStore.getState().setSubtitle(
      '🔥 ¡El ensamble salió fundido!',
      'text-red-500',
      3000
    )
    game.loseTime(TIME_PENALTY.spliceWrong)
    game.addScore(SCORE.spliceWrong)
    game.registerError()
    game.breakCombo()
  } else {
    audio.play('oven-whoosh')
  }
  station.clearSpliceStation()
}

// === HARNESS ===

function handleCableToHarness(cable: Cable) {
  const station = useStationStore.getState()
  const inv = useInventoryStore.getState()
  if (!cable.cut) {
    audio.play('buzz-fail')
    useEventStore.getState().setSubtitle(
      '⚠ Solo circuitos cortados/spliceds van al harness',
      'text-amber-500',
      3000
    )
    return
  }
  // Encuentra el primer slot vacío
  const board = [...station.harnessBoard]
  const emptyIdx = board.findIndex((s) => !s.circuitId)
  if (emptyIdx === -1) {
    audio.play('buzz-fail')
    return
  }
  inv.removeFromWip(cable.id)
  board[emptyIdx] = { ...board[emptyIdx], circuitId: cable.id, correct: true }
  station.setHarnessBoard(board)
  audio.play('click-ok')
}

function handleCableToHarnessSlot(zoneId: string, cable: Cable) {
  const station = useStationStore.getState()
  const inv = useInventoryStore.getState()
  const slotName = zoneId.replace('harness-slot-', '')
  const slotIdx = station.harnessBoard.findIndex((s) => s.slot === slotName)
  if (slotIdx === -1) return
  if (!cable.cut) {
    audio.play('buzz-fail')
    useEventStore.getState().setSubtitle(
      '⚠ Solo circuitos cortados/spliceds van al harness',
      'text-amber-500',
      3000
    )
    return
  }
  const slot = station.harnessBoard[slotIdx]
  if (slot.circuitId) {
    audio.play('buzz-fail')
    useEventStore.getState().setSubtitle(
      `⚠ ${slotName} ya está ocupado`,
      'text-amber-500',
      2000
    )
    return
  }
  inv.removeFromWip(cable.id)
  const board = [...station.harnessBoard]
  board[slotIdx] = { ...slot, circuitId: cable.id, correct: true }
  station.setHarnessBoard(board)
  audio.play('click-ok')
}

function handleHarnessTest() {
  const station = useStationStore.getState()
  const game = useGameStore.getState()
  const ticket = game.currentTicket
  if (!ticket) return
  if (station.harnessBoard.length === 0) {
    audio.play('buzz-fail')
    useEventStore.getState().setSubtitle(
      '⚠ El harness está vacío',
      'text-amber-500',
      3000
    )
    return
  }
  // Comprueba si todos los slots tienen circuitId
  const filled = station.harnessBoard.filter((s) => s.circuitId).length
  const required = station.harnessBoard.length
  const passed = filled >= required
  station.setHarnessTested(true)
  station.setHarnessTestResult(passed ? 'passed' : 'failed')
  if (passed) {
    audio.play('combo-chime')
    audio.play('ticket-done')
    game.addScore(SCORE.harnessTestPassed)
    game.addTime(TIME_BONUS.harnessTestPassed)
    game.bumpCombo()
    game.resetConsecutiveErrors()
    useEventStore.getState().setSubtitle(
      '✅ ¡Prueba eléctrica OK! Ticket cerrado',
      'text-emerald-500',
      3000
    )
    setTimeout(() => {
      useStationStore.getState().clearHarnessStation()
    }, 1500)
  } else {
    audio.play('buzz-fail')
    game.loseTime(TIME_PENALTY.harnessTestFailed)
    game.addScore(SCORE.harnessTestFailed)
    game.registerError()
    game.breakCombo()
    useEventStore.getState().setSubtitle(
      `❌ BUZZ! Solo ${filled}/${required} circuitos`,
      'text-red-500',
      4000
    )
    setTimeout(() => {
      useStationStore.getState().setHarnessTested(false)
      useStationStore.getState().setHarnessTestResult(null)
    }, 2000)
  }
}

function handlePowerupConsume(payload: { type: 'coffee' | 'taco' }) {
  const game = useGameStore.getState()
  const inv = useInventoryStore.getState()
  const achStore = useAchievementStore.getState()
  if (payload.type === 'coffee') {
    if (!inv.coffeePending) return
    inv.consumeCoffee()
    game.setTimerFrozen(true)
    audio.play('coffee-glug')
    useEventStore.getState().setSubtitle(
      '☕ ¡Timer congelado 5s!',
      'text-yellow-500',
      3000
    )
    achStore.addCumulativeStats({ coffeeConsumed: 1 })
    achStore.checkAchievements({
      score: game.score,
      combo: game.combo,
      maxCombo: game.maxCombo,
      ticketsCompleted: game.runStats.ticketsCompleted,
      gringoEncounters: game.runStats.gringoEncounters,
      errors: game.runStats.errors,
      timePlayedSec: game.runStats.timePlayedSec,
      mode: game.mode,
      perfectTickets: 0,
      splicesCompleted: 0,
      pressesCompleted: 0,
      harnessTestsPassed: 0,
      totalScoreAcrossRuns: achStore.totalScoreAcrossRuns,
      totalTicketsAllTime: achStore.totalTicketsAllTime,
      totalGringosAllTime: achStore.totalGringosAllTime,
      coffeeConsumed: achStore.coffeeConsumed,
      tacosConsumed: achStore.tacosConsumed,
      dailyStreak: 0,
      dailyCompletedTotal: 0,
    })
    setTimeout(() => {
      useGameStore.getState().setTimerFrozen(false)
    }, 5000)
  } else if (payload.type === 'taco') {
    if (!inv.tacoPending) return
    inv.consumeTaco()
    game.grantGringoImmunity()
    audio.play('taco-bite')
    useEventStore.getState().setSubtitle(
      '🌮 ¡Inmunidad anti-Supervisor!',
      'text-orange-500',
      3000
    )
    achStore.addCumulativeStats({ tacosConsumed: 1 })
  }
}

