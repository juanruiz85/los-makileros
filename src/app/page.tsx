'use client'

import dynamic from 'next/dynamic'

// Carga el GameApp solo en cliente para evitar hydration con el estado persistido
const GameApp = dynamic(() => import('@/components/game/GameApp').then((m) => m.GameApp), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 text-amber-400">
      <div className="text-center">
        <div className="animate-pulse text-2xl font-mono">CARGANDO PLANTA...</div>
        <div className="mt-2 text-sm text-stone-400 font-mono">Preparando máquinas</div>
      </div>
    </div>
  ),
})

export default function Home() {
  return <GameApp />
}
