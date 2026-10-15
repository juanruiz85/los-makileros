'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { useStationStore } from '@/game/store/stationStore'
import { useGameStore } from '@/game/store/gameStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useEventStore } from '@/game/store/eventStore'
import { audio } from '@/lib/audio'
import { CABLE_COLOR_HEX, CABLE_COLOR_LABEL } from '@/game/constants'
import { Cable as CableIcon, Flame, Waves, TriangleAlert } from 'lucide-react'
import type { Cable } from '@/game/types'

let spliceIdSeq = 0
const nextSpliceId = () => `splice-${Date.now().toString(36)}-${spliceIdSeq++}`

const AREA_OPTIONS = [1.0, 2.0, 3.0, 4.0, 5.0]

export function SpliceStation() {
  const cableA = useStationStore((s) => s.spliceCableA)
  const cableB = useStationStore((s) => s.spliceCableB)
  const selectedArea = useStationStore((s) => s.spliceSelectedArea)
  const tube = useStationStore((s) => s.spliceTube)
  const welded = useStationStore((s) => s.spliceWelded)
  const welding = useStationStore((s) => s.spliceWelding)
  const setSpliceArea = useStationStore((s) => s.setSpliceArea)
  const setSpliceWelding = useStationStore((s) => s.setSpliceWelding)
  const setSpliceWelded = useStationStore((s) => s.setSpliceWelded)
  const setSpliceOnBand = useStationStore((s) => s.setSpliceOnBand)
  const clearSpliceStation = useStationStore((s) => s.clearSpliceStation)
  const bandItems = useStationStore((s) => s.bandItems)
  const updateBandItems = useStationStore((s) => s.updateBandItems)
  const removeBandItem = useStationStore((s) => s.removeBandItem)
  const addBandItem = useStationStore((s) => s.addBandItem)
  const game = useGameStore.getState()
  const inv = useInventoryStore.getState()

  // Update band items (animation loop)
  useEffect(() => {
    if (bandItems.length === 0) return
    let raf: number
    let last = performance.now()
    const loop = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      updateBandItems(delta, 0.4) // 0.4 progress per second -> ~2.5s to cross
      // Remove completed items
      const station = useStationStore.getState()
      station.bandItems.forEach((item) => {
        if (item.progress >= 1) {
          // Item completed the band journey
          if (item.failed) {
            // Was already failed, just remove
            removeBandItem(item.id)
          } else {
            // Successful splice, move to WIP
            const splicedCable: Cable = {
              id: nextSpliceId(),
              color: 'black', // splice color
              gauge: 20,
              cut: true,
              length_mm: game.currentTicket?.length_mm ?? 100,
              terminalA: 'NONE',
              terminalB: 'NONE',
              origin: 'wip',
            }
            useInventoryStore.getState().moveToWip(splicedCable)
            game.addScore(80) // spliceCorrect
            game.addTime(4)
            game.bumpCombo()
            game.resetConsecutiveErrors()
            audio.play('combo-chime')
            audio.play('click-ok')
            removeBandItem(item.id)
          }
        }
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [bandItems.length, updateBandItems, removeBandItem])

  const canWeld = cableA && cableB && selectedArea !== null && !welded
  const canGoToBand = welded && !welding

  const handleWeld = () => {
    if (!canWeld) return
    setSpliceWelding(true)
    audio.play('ultrasonic-hum')
    setTimeout(() => {
      // Validate area
      const sumGauge = (cableA!.gauge + cableB!.gauge) / 10 // 18+20=3.8
      const correctArea = Math.min(5, Math.max(1, Math.ceil(sumGauge)))
      if (selectedArea !== correctArea) {
        audio.play('buzz-fail')
        useEventStore.getState().spawnMaintenance()
        useEventStore.getState().setSubtitle(
          `⚠ Área incorrecta. Máquina atorada. ¡Mantenimiento!`,
          'text-red-500',
          4000
        )
        clearSpliceStation()
        return
      }
      setSpliceWelding(false)
      setSpliceWelded(true)
      audio.play('click-ok')
      const spliceId = nextSpliceId()
      setSpliceOnBand({
        id: spliceId,
        cableAId: cableA!.id,
        cableBId: cableB!.id,
        area: selectedArea as 1.0 | 2.0 | 3.0 | 4.0 | 5.0,
        welded: true,
        tubeApplied: !!tube,
        ovenPassed: false,
        failedMelted: false,
      })
    }, 1500)
  }

  const handleSendToBand = () => {
    if (!canGoToBand) return
    const splice = useStationStore.getState().spliceOnBand
    if (!splice) return
    const failed = !tube
    addBandItem(splice.id, failed)
    if (failed) {
      audio.play('oven-whoosh')
      useEventStore.getState().setSubtitle(
        '🔥 ¡El ensamble salió fundido! Sin tubo de encoge',
        'text-red-500',
        3000
      )
      game.loseTime(5)
      game.addScore(-120)
      game.registerError()
      game.breakCombo()
    } else {
      audio.play('oven-whoosh')
    }
    clearSpliceStation()
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="text-xs font-mono text-stone-500 dark:text-stone-400">
        Arrastra 2 cables del WIP · selecciona el Área · suelda · pon tubo · envía al horno
      </div>

      {/* Máquina ultrasonido */}
      <div className="relative bg-stone-200 dark:bg-stone-950 rounded-xl border-2 border-stone-400 dark:border-stone-700 overflow-hidden p-4 flex flex-col gap-3">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-amber-500 to-purple-400" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${welding ? 'bg-purple-500 animate-pulse' : 'bg-stone-700'}`}>
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Máquina</div>
              <div className="font-bold text-sm">Ultrasonic Welder</div>
            </div>
          </div>
          {welding && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-xs font-mono text-purple-500 font-bold"
            >
              SOLDANDO...
            </motion.div>
          )}
        </div>

        {/* Slots para cables A y B */}
        <div className="flex gap-3 justify-center">
          <DropZone id="splice-machine-a" accept="cable" active={!!cableA} className="w-32 h-20">
            {cableA ? (
              <CableMiniVisual cable={cableA} />
            ) : (
              <EmptySlot icon={<CableIcon className="w-6 h-6" />} label="Cable A" />
            )}
          </DropZone>

          <motion.div
            animate={welding ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3, repeat: welding ? Infinity : 0 }}
            className="flex items-center justify-center"
          >
            <div className={`text-3xl ${welding ? 'text-purple-500' : 'text-stone-400'}`}>⚡</div>
          </motion.div>

          <DropZone id="splice-machine-b" accept="cable" active={!!cableB} className="w-32 h-20">
            {cableB ? (
              <CableMiniVisual cable={cableB} />
            ) : (
              <EmptySlot icon={<CableIcon className="w-6 h-6" />} label="Cable B" />
            )}
          </DropZone>
        </div>

        {/* Selector de Área */}
        <div className="bg-stone-300 dark:bg-stone-800 rounded-lg p-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-stone-600 dark:text-stone-300 mb-1">
            Área (suma de calibres)
          </div>
          <div className="grid grid-cols-5 gap-1">
            {AREA_OPTIONS.map((a) => (
              <motion.button
                key={a}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSpliceArea(a)
                  audio.play('click-ok')
                }}
                disabled={welded}
                className={`py-2 rounded font-mono font-bold text-sm transition-colors ${
                  selectedArea === a
                    ? 'bg-amber-500 text-stone-900 shadow-lg'
                    : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {a.toFixed(1)}
              </motion.button>
            ))}
          </div>
          {cableA && cableB && (
            <div className="text-[10px] font-mono text-stone-500 mt-1 text-center">
              Sugerido: {Math.min(5, Math.max(1, Math.ceil((cableA.gauge + cableB.gauge) / 10))).toFixed(1)}
            </div>
          )}
        </div>

        {/* Botón SOLDAR */}
        <div className="flex justify-center">
          <motion.button
            whileHover={canWeld ? { scale: 1.05 } : {}}
            whileTap={canWeld ? { scale: 0.95 } : {}}
            onClick={handleWeld}
            disabled={!canWeld}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-stone-400 text-white font-black rounded-lg shadow-lg flex items-center gap-2"
          >
            <Waves className="w-5 h-5" />
            {welded ? 'SOLDADO ✓' : welding ? 'SOLDANDO...' : 'SOLDAR'}
          </motion.button>
        </div>

        {/* Slot del tubo */}
        <div className="flex items-center gap-3">
          <DropZone id="splice-tube" accept="tube" active={!!tube} className="flex-1 h-14">
            {tube ? (
              <div className="flex items-center justify-center gap-2 text-stone-700 dark:text-stone-200">
                <div className="w-10 h-3 rounded-full bg-gradient-to-r from-orange-300 via-red-400 to-orange-300 border border-stone-500" />
                <span className="font-mono text-xs font-bold">Heat Shrink aplicado</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-stone-400">
                <Flame className="w-4 h-4" />
                <span className="font-mono text-xs">Arrastra tubo de encoge (¡obligatorio!)</span>
              </div>
            )}
          </DropZone>
          {!welded && (
            <div className="text-[10px] font-mono text-amber-500 flex items-center gap-1">
              <TriangleAlert className="w-3 h-3" /> Suelda primero
            </div>
          )}
        </div>

        {/* Botón ENVIAR AL HORNO */}
        <div className="flex justify-center">
          <motion.button
            whileHover={canGoToBand ? { scale: 1.05 } : {}}
            whileTap={canGoToBand ? { scale: 0.95 } : {}}
            onClick={handleSendToBand}
            disabled={!canGoToBand}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-400 text-white font-black rounded-lg shadow-lg flex items-center gap-2"
          >
            <Flame className="w-5 h-5" />
            ENVIAR AL HORNO
          </motion.button>
        </div>
      </div>

      {/* Banda transportadora + horno */}
      <div className="relative bg-stone-900 rounded-xl border-2 border-stone-700 overflow-hidden p-3 h-32">
        <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2">
          Banda transportadora → Horno
        </div>
        <div className="relative h-16">
          {/* Banda visual */}
          <div className="absolute inset-x-0 bottom-2 h-2 bg-stone-700">
            <div className="absolute inset-0 animate-[band_2s_linear_infinite] bg-[repeating-linear-gradient(90deg,transparent_0,transparent_8px,rgba(255,255,255,0.15)_8px,rgba(255,255,255,0.15)_10px)]" />
          </div>
          {/* Horno visual */}
          <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-b from-orange-500 to-red-700 rounded flex items-center justify-center">
            <div className="text-center text-white">
              <Flame className="w-5 h-5 mx-auto" />
              <div className="text-[8px] font-mono">HORNO</div>
            </div>
          </div>
          {/* Items en la banda */}
          <AnimatePresence>
            {bandItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ x: 0, opacity: 1 }}
                animate={{ x: `${item.progress * 100}%` }}
                exit={{ opacity: 0 }}
                className="absolute left-0 top-2 w-10 h-10"
              >
                <motion.div
                  animate={item.failed ? { rotate: [0, -5, 5, -5, 5] } : {}}
                  transition={{ duration: 0.3, repeat: Infinity }}
                  className={`w-10 h-10 rounded ${item.failed ? 'bg-gradient-to-br from-red-600 to-yellow-700' : 'bg-gradient-to-br from-stone-300 to-stone-500'} border-2 ${item.failed ? 'border-red-300' : 'border-stone-200'} shadow-lg`}
                />
                {item.failed && (
                  <div className="absolute -top-2 -right-1 text-xs">🔥</div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Estado vacío */}
          {bandItems.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-stone-500 text-xs font-mono">
              Ensamble aparecerá aquí cuando lo envíes al horno
            </div>
          )}
        </div>
      </div>

      {/* Basura */}
      <div className="flex justify-center">
        <DropZone id="trash" accept="any" active={false} className="w-40 h-10">
          <div className="text-xs font-mono text-stone-500">🗑 Basura</div>
        </DropZone>
      </div>
    </div>
  )
}

function CableMiniVisual({ cable }: { cable: Cable }) {
  const colorHex = CABLE_COLOR_HEX[cable.color]
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        initial={{ scale: 0.5, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        className="w-12 h-12 rounded-full border-2 border-stone-700"
        style={{ background: colorHex }}
      >
        <div className="w-full h-full rounded-full border-2 border-stone-900/50" />
      </motion.div>
      <div className="text-[9px] font-mono text-stone-700 dark:text-stone-200">
        {CABLE_COLOR_LABEL[cable.color]} · {cable.gauge}
      </div>
    </div>
  )
}

function EmptySlot({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-1 text-stone-400">
      <div className="w-7 h-7">{icon}</div>
      <div className="text-[10px] font-mono uppercase tracking-wider">{label}</div>
    </div>
  )
}

function DropZone({
  id,
  accept,
  active,
  className,
  children,
}: {
  id: string
  accept: string
  active: boolean
  className?: string
  children?: React.ReactNode
}) {
  const { isOver, setNodeRef } = useDroppable({ id, data: { accept } })
  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-lg border-2 border-dashed transition-all flex items-center justify-center ${
        isOver
          ? 'border-amber-500 bg-amber-100 dark:bg-amber-950 scale-105'
          : active
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
            : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900'
      } ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
