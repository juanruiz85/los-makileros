'use client'

import React from 'react'
import { T } from '@/lib/i18n'

export function GameFooter() {
  return (
    <footer className="mt-auto bg-stone-900 dark:bg-black text-stone-400 px-3 py-2 text-[10px] font-mono flex flex-wrap justify-between items-center gap-2 border-t-2 border-stone-800">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{T.footer.credits}</span>
      </div>
      <div>{T.footer.version}</div>
    </footer>
  )
}
