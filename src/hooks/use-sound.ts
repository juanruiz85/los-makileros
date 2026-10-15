// src/hooks/use-sound.ts
'use client'

import { useCallback } from 'react'
import { audio } from '@/lib/audio'

export function useSound() {
  return useCallback((name: string, opts?: { loop?: boolean; rate?: number; volume?: number }) => {
    audio.play(name as never, opts)
  }, [])
}
