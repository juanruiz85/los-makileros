'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/game/store/gameStore'
import { useEventStore } from '@/game/store/eventStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { audio } from '@/lib/audio'
import { T } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Warehouse,
  CheckCircle2,
  Pause,
  Settings,
  AlertTriangle,
  Volume2,
  Music,
  Sun,
  Moon,
  Accessibility,
  Zap,
} from 'lucide-react'
import { WarehouseSheet } from './WarehouseSheet'
import { useTheme } from 'next-themes'

interface LocalSettings {
  sfxVolume: number
  musicEnabled: boolean
  reduceMotion: boolean
}

const SETTINGS_KEY = 'makileros:settings'

function loadSettings(): LocalSettings {
  if (typeof window === 'undefined') {
    return { sfxVolume: 0.7, musicEnabled: false, reduceMotion: false }
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { sfxVolume: 0.7, musicEnabled: false, reduceMotion: false }
    return JSON.parse(raw)
  } catch {
    return { sfxVolume: 0.7, musicEnabled: false, reduceMotion: false }
  }
}

function saveSettings(s: LocalSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {}
}

export function BottomBar() {
  const screen = useGameStore((s) => s.screen)
  const mode = useGameStore((s) => s.mode)
  const setScreen = useGameStore((s) => s.setScreen)
  const reportCompleted = useGameStore((s) => s.reportTicketCompleted)
  const subtitle = useEventStore((s) => s.currentSubtitle)
  const comboModeActive = useGameStore((s) => s.comboModeActive)
  const combo = useGameStore((s) => s.combo)
  const score = useGameStore((s) => s.score)
  const [warehouseOpen, setWarehouseOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const cables = useInventoryStore((s) => s.cables.length)
  const coffeePending = useInventoryStore((s) => s.coffeePending)
  const tacoPending = useInventoryStore((s) => s.tacoPending)
  const isLowStock = cables < 3
  const [settings, setSettings] = useState<LocalSettings>(loadSettings)
  const { theme, setTheme } = useTheme()
  const [themeMounted, setThemeMounted] = useState(false)

  // Apply settings to audio
  useEffect(() => {
    audio.setSfxVolume(settings.sfxVolume)
    audio.setMusicEnabled(settings.musicEnabled)
  }, [settings.sfxVolume, settings.musicEnabled])

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  // Avoid hydration mismatch with theme
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeMounted(true)
  }, [])

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="bg-stone-900 dark:bg-black text-stone-100 px-2 py-2 sm:px-4 border-t-4 border-amber-500 flex flex-wrap items-center gap-2">
      {/* Botón almacén */}
      <Button
        variant="outline"
        className="bg-stone-800 border-stone-600 text-stone-100 hover:bg-stone-700 relative"
        onClick={() => setWarehouseOpen(true)}
        disabled={screen !== 'playing'}
      >
        <Warehouse className="w-4 h-4 mr-2" />
        {T.hud.warehouse}
        {isLowStock && screen === 'playing' && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-stone-900"
          />
        )}
      </Button>

      {/* Botón reportar */}
      <Button
        onClick={() => {
          audio.play('ticket-done')
          reportCompleted()
        }}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        disabled={screen !== 'playing'}
      >
        <CheckCircle2 className="w-4 h-4 mr-2" />
        {T.hud.report}
      </Button>

      {/* Mini HUD: Score + Combo (mobile) */}
      <div className="lg:hidden flex items-center gap-2 px-2 py-1 bg-stone-800 rounded">
        <span className="text-emerald-400 font-mono font-bold text-xs tabular-nums">
          {score.toLocaleString()}
        </span>
        {combo > 0 && (
          <span className={`font-mono font-bold text-xs ${comboModeActive ? 'text-amber-400' : 'text-stone-300'}`}>
            x{combo}
          </span>
        )}
      </div>

      {/* Power-ups pending indicator */}
      {(coffeePending || tacoPending) && (
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-400 text-[10px] font-mono font-bold">
          {coffeePending && <span>☕</span>}
          {tacoPending && <span>🌮</span>}
          <span>POWER-UPS</span>
        </div>
      )}

      {/* Modo Rápido badge */}
      {comboModeActive && screen === 'playing' && (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="hidden md:flex items-center gap-1 px-2 py-1 bg-amber-500 text-stone-900 rounded text-[10px] font-mono font-bold uppercase tracking-widest"
        >
          <Zap className="w-3 h-3" />
          Modo Rápido
        </motion.div>
      )}

      <div className="flex-1" />

      {/* Modo actual */}
      <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400 hidden sm:block">
        Modo: <span className="text-amber-400 font-bold">{mode}</span>
      </div>

      {/* Pausa */}
      <Button
        variant="outline"
        size="icon"
        className="bg-stone-800 border-stone-600 text-stone-100 hover:bg-stone-700"
        onClick={() => {
          if (screen === 'playing') {
            setScreen('paused')
          }
        }}
        disabled={screen !== 'playing'}
      >
        <Pause className="w-4 h-4" />
      </Button>

      {/* Ajustes */}
      <Button
        variant="outline"
        size="icon"
        className="bg-stone-800 border-stone-600 text-stone-100 hover:bg-stone-700"
        onClick={() => setSettingsOpen(true)}
        title="Ajustes"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* Warehouse Sheet */}
      <WarehouseSheet open={warehouseOpen} onOpenChange={setWarehouseOpen} />

      {/* Settings Modal */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-stone-900 border-2 border-amber-500 rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-stone-900" />
                </div>
                <h2 className="text-xl font-black text-amber-400">AJUSTES</h2>
              </div>

              {/* Volumen SFX */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-stone-200 text-sm font-mono">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    Efectos
                  </div>
                  <span className="text-xs font-mono text-stone-400 tabular-nums">
                    {Math.round(settings.sfxVolume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.sfxVolume * 100]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(v) => {
                    setSettings((s) => ({ ...s, sfxVolume: v[0] / 100 }))
                    audio.play('click-ok', { volume: v[0] / 100 })
                  }}
                  className="cursor-pointer"
                />
              </div>

              {/* Música */}
              <div className="flex items-center justify-between mb-4 py-2 border-y border-stone-700">
                <div className="flex items-center gap-2 text-stone-200 text-sm font-mono">
                  <Music className="w-4 h-4 text-amber-400" />
                  Música de fondo
                </div>
                <Switch
                  checked={settings.musicEnabled}
                  onCheckedChange={(b) =>
                    setSettings((s) => ({ ...s, musicEnabled: b }))
                  }
                />
              </div>

              {/* Tema */}
              <div className="flex items-center justify-between mb-4 py-2 border-b border-stone-700">
                <div className="flex items-center gap-2 text-stone-200 text-sm font-mono">
                  {themeMounted && theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                  Tema {themeMounted && theme === 'dark' ? 'oscuro' : 'claro'}
                </div>
                <Switch
                  checked={themeMounted && theme === 'dark'}
                  onCheckedChange={handleToggleTheme}
                  disabled={!themeMounted}
                />
              </div>

              {/* Reduce Motion */}
              <div className="flex items-center justify-between mb-5 py-2 border-b border-stone-700">
                <div className="flex items-center gap-2 text-stone-200 text-sm font-mono">
                  <Accessibility className="w-4 h-4 text-amber-400" />
                  Reducir movimiento
                </div>
                <Switch
                  checked={settings.reduceMotion}
                  onCheckedChange={(b) =>
                    setSettings((s) => ({ ...s, reduceMotion: b }))
                  }
                />
              </div>

              <Button
                onClick={() => setSettingsOpen(false)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold"
              >
                Cerrar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner subtítulo */}
      <AnimatePresence>
        {subtitle && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-stone-900/95 backdrop-blur border-2 border-amber-500 rounded-lg shadow-2xl max-w-md ${subtitle.color ?? 'text-stone-100'}`}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-center">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              {subtitle.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
