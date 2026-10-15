// src/game/dragResolver.ts
// Resolutor central de drag & drop para el juego
// Recibe un DragEndEvent de @dnd-kit y aplica la lógica de negocio

'use client'

import type { DragEndEvent } from '@dnd-kit/core'
import type { Cable, Terminal } from './types'
import { useGameStore } from './store/gameStore'
import { useInventoryStore } from './store/inventoryStore'
import { useStationStore } from './store/stationStore'
import { useEventStore } from './store/eventStore'
import { audio } from '@/lib/audio'
import {
  SCORE,
  TIME_BONUS,
  TIME_PENALTY,
  CABLE_COLOR_LABEL,
  TERMINAL_LABEL,
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
      // Mover cable del blade al WIP (solo si ya está cortado)
      return handleCableToWip(data.payload as Cable)
    case 'cable->wip-tray':
      return handleCableToWip(data.payload as Cable)
    case 'cable->trash':
      return handleCableToTrash(data.payload as Cable)
    case 'terminal->trash':
      return handleTerminalToTrash(data.payload as Terminal)

    // === POWERUPS ===
    case 'powerup->character':
      return handlePowerupConsume(data.payload as { type: 'coffee' | 'taco' })

    default:
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
    // Permite moverlo de vuelta al inventario si el usuario lo quiere
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
    // Limpia la estación
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

  // Penalización si falta terminal obligatorio
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
  // Si el cable está en inventario, lo quitamos
  inv.removeCable(cable.id)
  // Si está en WIP, lo quitamos
  inv.removeFromWip(cable.id)
  audio.play('click-ok')
}

function handleTerminalToTrash(terminal: Terminal) {
  const inv = useInventoryStore.getState()
  inv.removeTerminal(terminal.id)
  audio.play('click-ok')
}

function handlePowerupConsume(payload: { type: 'coffee' | 'taco' }) {
  const game = useGameStore.getState()
  const inv = useInventoryStore.getState()
  if (payload.type === 'coffee') {
    if (!inv.coffeePending) return
    inv.consumeCoffee()
    game.setTimerFrozen(true)
    audio.play('coffee-glug')
    setTimeout(() => {
      useGameStore.getState().setTimerFrozen(false)
    }, 5000)
  } else if (payload.type === 'taco') {
    if (!inv.tacoPending) return
    inv.consumeTaco()
    game.grantGringoImmunity()
    audio.play('taco-bite')
  }
}
