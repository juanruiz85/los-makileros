'use client'

import React, { useEffect, useCallback } from 'react'
import { useGameStore } from '@/game/store/gameStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useEventStore } from '@/game/store/eventStore'
import { useStationStore } from '@/game/store/stationStore'
import { useGameLoop } from '@/hooks/use-game-loop'
import { useKonamiCode } from '@/hooks/use-konami-code'
import { DndProvider } from '@/components/providers/DndProvider'
import { TitleScreen } from './screens/TitleScreen'
import { HowToPlay } from './screens/HowToPlay'
import { GameScreen } from './screens/GameScreen'
import { GameOverScreen } from './screens/GameOverScreen'
import { PausedScreen } from './screens/PausedScreen'
import { GameFooter } from './layout/GameFooter'
import { CharacterLayer } from './characters/CharacterLayer'
import { EffectsLayer } from './effects/EffectsLayer'
import { SubtitleBar } from './hud/SubtitleBar'
import { MaintenanceModal } from './characters/MaintenanceModal'
import { QualityAuditModal } from './characters/QualityAuditModal'
import { CharacterDropZone } from './characters/CharacterDropZone'
import { AchievementNotification } from './characters/AchievementPanel'
import { SpecialEventsIndicator } from './characters/SpecialEventsIndicator'
import { TurboModeIndicator } from './effects/TurboModeIndicator'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { audio } from '@/lib/audio'

export function GameApp() {
  const screen = useGameStore((s) => s.screen)
  useGameLoop()
  useKeyboardShortcuts()

  // Inicializa inventario al montar
  useEffect(() => {
    const inv = useInventoryStore.getState()
    if (inv.cables.length === 0) {
      inv.initInventory()
    }
  }, [])

  // Reset de stores al llegar a title
  useEffect(() => {
    if (screen === 'title') {
      useEventStore.getState().reset()
      useStationStore.getState().resetAll()
    }
  }, [screen])

  // Konami code handler
  const handleKonamiActivate = useCallback(() => {
    const gameStore = useGameStore.getState()
    const newTurbo = !gameStore.turboMode
    gameStore.setTurboMode(newTurbo)
    if (newTurbo) {
      audio.play('combo-chime')
      audio.play('combo-chime')
      useEventStore.getState().setSubtitle(
        '🚀 TURBO MODE: Score x3 activado!',
        'text-red-500',
        4000,
      )
    } else {
      audio.play('buzz-fail')
      useEventStore.getState().setSubtitle(
        '🚀 Turbo desactivado',
        'text-stone-400',
        2000,
      )
    }
  }, [])

  const konamiState = useKonamiCode(handleKonamiActivate)
  const turboMode = useGameStore((s) => s.turboMode)

  return (
    <DndProvider>
      <div className="min-h-screen flex flex-col bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <main className="flex-1 relative overflow-hidden">
          {screen === 'title' && <TitleScreen />}
          {screen === 'howto' && <HowToPlay />}
          {screen === 'playing' && <GameScreen />}
          {screen === 'paused' && (
            <>
              <GameScreen dimmed />
              <PausedScreen />
            </>
          )}
          {screen === 'gameover' && <GameOverScreen />}

          {/* Capa overlay: personajes + efectos + subtítulos */}
          <CharacterLayer />
          <EffectsLayer />
          <SubtitleBar />
          {/* Drop zone para powerups (café/taco) — visible solo en playing */}
          <CharacterDropZone />
          {/* Modal de mantenimiento (bloqueante) */}
          <MaintenanceModal />
          {/* Modal de auditoría de calidad */}
          <QualityAuditModal />
          {/* Notificaciones de logros */}
          <AchievementNotification />
          {/* Special events indicators (client visit, supervisor rampage) */}
          <SpecialEventsIndicator />
          {/* Turbo Mode indicator (Konami code) */}
          <TurboModeIndicator active={turboMode} />
          {/* Konami progress hint */}
          {konamiState.progress > 0 && !konamiState.activated && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 bg-stone-900/95 border border-amber-500 rounded-lg text-amber-400 text-[10px] font-mono uppercase tracking-widest pointer-events-none">
              Konami: {konamiState.progress}/10
            </div>
          )}
        </main>
        <GameFooter />
      </div>
    </DndProvider>
  )
}
