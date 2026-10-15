// src/hooks/use-game-loop.ts
'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/game/store/gameStore'
import { useEventStore } from '@/game/store/eventStore'
import {
  EVENT_SPAWN_TABLE,
  GRINGO_INTERVAL_SEC,
  computeDifficulty,
} from '@/game/constants'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { audio } from '@/lib/audio'

export function useGameLoop() {
  const tick = useGameStore((s) => s.tick)

  useEffect(() => {
    let raf: number
    let last = performance.now()
    let eventCheckAccum = 0
    let gringoCheckAccum = 0

    const loop = (now: number) => {
      const delta = (now - last) / 1000
      last = now

      const { screen, mode, timerFrozen } = useGameStore.getState()

      // Tick del juego (timer)
      if (screen === 'playing' && !timerFrozen) {
        tick(delta)
      }

      // Limpia subtítulos expirados
      useEventStore.getState().clearExpiredSubtitles(now)

      // Spawnea eventos aleatorios cada 5s
      if (screen === 'playing') {
        eventCheckAccum += delta
        if (eventCheckAccum >= 5) {
          eventCheckAccum = 0
          const elapsed = useGameStore.getState().runStats.timePlayedSec
          const difficulty = computeDifficulty(elapsed, mode)
          const roll = Math.random()
          let acc = 0
          for (const ev of EVENT_SPAWN_TABLE) {
            if (elapsed < ev.minElapsedSec) continue
            const mult = mode === 'chaos' ? ev.chaosMult : mode === 'free' ? ev.freeMult : 1
            const p = ev.baseProb * (0.5 + difficulty * 0.8) * mult
            acc += p
            if (roll < acc) {
              triggerEvent(ev.kind)
              break
            }
          }
        }

        // Gringo cada intervalo
        gringoCheckAccum += delta
        if (gringoCheckAccum >= 1) {
          gringoCheckAccum = 0
          const interval = GRINGO_INTERVAL_SEC[mode]
          const elapsed = useGameStore.getState().runStats.timePlayedSec
          const gringoCooldown = useEventStore.getState().gringoCooldownUntil
          const nowMs = performance.now()
          // Si ya pasó el intervalo y no está en cooldown reciente
          if (
            elapsed > interval &&
            nowMs > gringoCooldown &&
            !useGameStore.getState().timerFrozen
          ) {
            // dispara
            useEventStore.getState().spawnGringo()
            audio.play('siren-alarm')
            audio.play('gringo-yell')
            // Aplica el reinicio del timer
            useGameStore.getState().triggerGringo()
            useGameStore.getState().breakCombo()
          }
        }
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [tick])
}

function triggerEvent(kind: string) {
  const eventStore = useEventStore.getState()
  const gameStore = useGameStore.getState()
  const invStore = useInventoryStore.getState()
  switch (kind) {
    case 'gossip':
      eventStore.spawnGossip()
      break
    case 'supervisor-warn':
      eventStore.spawnSupervisorWarn()
      break
    case 'supervisor-angry':
      // Solo si hay errores consecutivos
      if (gameStore.consecutiveErrors >= 2) {
        eventStore.spawnSupervisorAngry()
        audio.play('supervisor-angry')
        gameStore.loseTime(10)
      } else {
        eventStore.spawnSupervisorWarn()
      }
      break
    case 'maintenance':
      eventStore.spawnMaintenance()
      break
    case 'quality-audit':
      // Solo si se han completado tickets
      if (gameStore.runStats.ticketsCompleted >= 2) {
        eventStore.spawnQualityAudit()
      }
      break
    // 'gringo' se maneja en el loop por intervalo, no random
    default:
      break
  }
  void invStore
}
