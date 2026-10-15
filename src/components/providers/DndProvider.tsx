// src/components/providers/DndProvider.tsx
'use client'

import React, { useState, useCallback } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useGameStore } from '@/game/store/gameStore'
import { useInventoryStore } from '@/game/store/inventoryStore'
import { useStationStore } from '@/game/store/stationStore'
import { resolveDragEnd } from '@/game/dragResolver'
import { audio } from '@/lib/audio'
import { DraggablePreview } from '@/components/game/inventory/DraggablePreview'

interface DndProviderProps {
  children: React.ReactNode
}

export function DndProvider({ children }: DndProviderProps) {
  const [activeItem, setActiveItem] = useState<
    { kind: string; payload: unknown; color?: string; label?: string } | null
  >(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  )

  const onDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as
      | { kind: string; payload: unknown; color?: string; label?: string }
      | undefined
    if (data) setActiveItem(data)
  }, [])

  const onDragEnd = useCallback((event: DragEndEvent) => {
    setActiveItem(null)
    resolveDragEnd(event)
  }, [])

  const onDragCancel = useCallback(() => {
    setActiveItem(null)
  }, [])

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <DraggablePreview
            kind={activeItem.kind}
            color={activeItem.color}
            label={activeItem.label}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
