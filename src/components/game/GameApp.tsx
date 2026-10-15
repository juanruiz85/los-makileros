'use client'

import React, { useEffect } from 'react'
import { useGameStore } from '@/game/store/gameStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useEventStore } from '@/game/store/eventStore'
import { useStationStore } from '@/game/store/stationStore'
import { useGameLoop } from '@/hooks/use-game-loop'
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

export function GameApp() {
  const screen = useGameStore((s) => s.screen)
  useGameLoop()

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
        </main>
        <GameFooter />
      </div>
    </DndProvider>
  )
}
