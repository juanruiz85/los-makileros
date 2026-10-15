# 02 — Arquitectura Técnica
## Los Makileros: Sobreviviendo al Piso

> **Stack:** Next.js 16 (App Router) · TypeScript 5 · Tailwind 4 · shadcn/ui · @dnd-kit · framer-motion · zustand · Prisma SQLite
> **Filosofía:** Cliente-first. Toda la lógica del juego vive en el navegador. El backend sólo se usa para ranking online (opcional Fase 3) y assets generados con AI skills.

---

## 1. Principios de Diseño

1. **Single route:** Toda la experiencia ocurre en `/` (restricción del sandbox). Las "pantallas" son **vistas internas** controladas por el store.
2. **State-driven UI:** La UI es función pura del store de Zustand. Sin estado derivado disperso.
3. **Composición sobre herencia:** componentes pequeños, presentacionales, sin lógica de negocio.
4. **Tipado estricto:** todos los datos del juego (Ticket, Cable, Terminal, Event) son tipos centralizados en `src/game/types.ts`.
5. **Audio nativo:** Web Audio API + `<audio>` element. No dependencias.
6. **Asset path estricto:** todos los assets estáticos en `/public` (sprites, sfx, íconos generados con image-generation skill).
7. **Sin build:** el sandbox prohíbe `bun run build`. Todo se desarrolla con `bun run dev`.

---

## 2. Estructura de Carpetas

```
src/
├── app/
│   ├── layout.tsx              ← Root layout (theme provider, Toaster, fonts)
│   ├── page.tsx                ← ÚNICA ruta. Renderiza <GameApp/>
│   ├── globals.css             ← Tailwind + variables tema
│   └── api/
│       ├── scores/
│       │   └── route.ts        ← POST/GET ranking online (Fase 3)
│       └── generate-asset/
│           └── route.ts        ← Proxy a image-generation skill (Fase 3)
├── game/
│   ├── types.ts                ← Todos los tipos del dominio
│   ├── constants.ts            ← Config: probabilidades, duraciones, scores
│   ├── store/
│   │   ├── gameStore.ts        ← Estado principal (timer, score, ticket, combo)
│   │   ├── inventoryStore.ts   ← Estado de inventario y almacén
│   │   ├── stationStore.ts    ← Estado de estación activa + área actual
│   │   └── eventStore.ts       ← Eventos aleatorios (supervisor, gringo, etc.)
├── hooks/
│   ├── use-game-loop.ts        ← requestAnimationFrame loop (timer ticking)
│   ├── use-drag-item.ts        ← Wrapper sobre useDraggable de @dnd-kit
│   ├── use-drop-zone.ts        ← Wrapper sobre useDroppable
│   ├── use-sound.ts            ← Hook para reproducir SFX con cache
│   ├── use-game-events.ts      ← Spawner de eventos aleatorios
│   └── use-persist.ts          ← Wrapper sobre zustand persist
├── components/
│   ├── ui/                     ← shadcn/ui (ya existe, no tocar)
│   ├── game/
│   │   ├── GameApp.tsx         ← Orquestador raíz
│   │   ├── screens/
│   │   │   ├── TitleScreen.tsx
│   │   │   ├── HowToPlay.tsx
│   │   │   ├── GameScreen.tsx
│   │   │   └── GameOverScreen.tsx
│   │   ├── layout/
│   │   │   ├── TopBar.tsx      ← Tabs estaciones + timer + combo + score
│   │   │   ├── InventoryPanel.tsx
│   │   │   ├── WorkArea.tsx    ← Switch por estación activa
│   │   │   ├── TicketPanel.tsx ← Programa Garnet
│   │   │   └── BottomBar.tsx   ← Almacén, reportar, ajustes
│   │   ├── stations/
│   │   │   ├── CutStation.tsx
│   │   │   ├── SpliceStation.tsx
│   │   │   ├── PressStation.tsx
│   │   │   └── HarnessStation.tsx
│   │   ├── inventory/
│   │   │   ├── DraggableCable.tsx
│   │   │   ├── DraggableTerminal.tsx
│   │   │   ├── DraggableTube.tsx
│   │   │   └── WarehouseCart.tsx
│   │   ├── characters/
│   │   │   ├── Supervisor.tsx
│   │   │   ├── Maintenance.tsx
│   │   │   ├── Gringo.tsx
│   │   │   ├── QualityAuditor.tsx
│   │   │   └── GossipPeer.tsx
│   │   ├── effects/
│   │   │   ├── ScreenShake.tsx
│   │   │   ├── FlyingPapers.tsx
│   │   │   ├── ComboFlash.tsx
│   │   │   └── BuzzAlarm.tsx
│   │   └── hud/
│   │       ├── Timer.tsx
│   │       ├── ScoreBoard.tsx
│   │       └── ComboIndicator.tsx
│   └── providers/
│       ├── ThemeProvider.tsx    ← next-themes
│       └── DndProvider.tsx      ← @dnd-kit wrapper
├── lib/
│   ├── utils.ts                ← cn() y helpers (ya existe)
│   ├── db.ts                   ← Prisma client (ya existe)
│   ├── audio.ts                ← AudioManager (singleton Web Audio)
│   ├── tickets.ts              ← Generador procedural de tickets
│   ├── i18n.ts                 ← Diccionario de frases (espanglish)
│   └── random.ts               ← SeededRandom + weightedPick
└── prisma/
    └── schema.prisma           ← Modelos Score, SessionLog (Fase 3)

public/
├── sfx/                        ← Archivos de sonido
│   ├── click-ok.mp3
│   ├── buzz-fail.mp3
│   ├── siren-alarm.mp3
│   ├── cut-slice.mp3
│   ├── ultrasonic-hum.mp3
│   ├── press-thunk.mp3
│   ├── oven-whoosh.mp3
│   ├── combo-chime.mp3
│   ├── game-over.mp3
│   ├── whisper-loop.mp3
│   ├── coffee-glug.mp3
│   └── taco-bite.mp3
├── img/
│   ├── characters/             ← Ilustraciones personajes (image-gen)
│   ├── items/                  ← Sprite items (cable, terminal, etc.)
│   └── ui/                     ← Banners, fondo de planta
└── logo.svg
```

---

## 3. Modelo de Datos (Tipos del Dominio)

Archivo: `src/game/types.ts`

```ts
// === Entidades base ===
export type CableColor = 'red' | 'black' | 'yellow' | 'green' | 'white'
export type CableGauge = 18 | 20 | 22
export type TerminalType = 'FASTON-250' | 'FASTON-110' | 'RING-#8' | 'NONE'

export interface Cable {
  id: string
  color: CableColor
  gauge: CableGauge
  length_mm?: number          // presente si ya cortado
  cut: boolean               // ya pasó por cuchilla
  terminalA?: TerminalType
  terminalB?: TerminalType
}

export interface Terminal {
  id: string
  type: TerminalType
  used: boolean
}

export interface HeatShrinkTube {
  id: string
  applied: boolean
}

export interface Splice {
  id: string
  cableAId: string
  cableBId: string
  area: 1.0 | 2.0 | 3.0 | 4.0 | 5.0
  welded: boolean
  tubeApplied: boolean
  ovenPassed: boolean
  failedMelted: boolean
}

export interface HarnessCircuit {
  id: string
  sourceCableOrSpliceId: string
  connectorSlot: string      // ej. "C1", "C2", "X-1"
  correct: boolean           // computado al validar
}

export interface Harness {
  id: string
  circuits: HarnessCircuit[]
  tested: boolean
  testPassed: boolean
}

// === Tickets ===
export interface Ticket {
  id: string
  partNumber: string
  circuitCount: number
  cableColor: CableColor
  cableGauge: CableGauge
  length_mm: number
  terminalA: TerminalType
  terminalB: TerminalType
  needsSplice: boolean
  needsHarness: boolean
  baseScore: number
  timeBonusOnComplete: number
  sameSetupAsPrevious: boolean   // para bonus
  status: 'active' | 'completed' | 'failed'
}

// === Eventos ===
export type EventKind =
  | 'supervisor-warn'
  | 'supervisor-angry'
  | 'maintenance'
  | 'gringo'
  | 'gossip'
  | 'quality-audit'

export interface GameEvent {
  id: string
  kind: EventKind
  startedAt: number
  duration: number
  payload?: any
}

// === Estado global ===
export type GameScreen = 'title' | 'howto' | 'playing' | 'paused' | 'gameover'
export type StationKind = 'cut' | 'splice' | 'press' | 'harness'
export type GameMode = 'normal' | 'chaos' | 'free'

export interface RunStats {
  ticketsCompleted: number
  totalScore: number
  maxCombo: number
  timePlayedSec: number
  gringoEncounters: number
  errors: number
  startedAt: number
}
```

---

## 4. Estado Global (Zustand)

### 4.1 `gameStore` — corazón del juego
```ts
interface GameStore {
  // Pantalla y modo
  screen: GameScreen
  mode: GameMode
  // Tiempo
  timerSec: number           // float, permite 0.1 increments
  timerFrozen: boolean       // café activo
  // Puntaje
  score: number
  combo: number
  comboModeActive: boolean
  comboModeEndsAt: number
  // Ticket actual
  currentTicket: Ticket | null
  ticketHistory: Ticket[]
  // Setup
  lastSetupKey: string | null     // ej. "red-18-FASTON-250" para detectar bonus
  // Stats de la run
  runStats: RunStats
  // Highscore persistido
  highscore: number
  // Acciones
  start(mode: GameMode): void
  pause(): void
  resume(): void
  reset(): void
  tick(deltaSec: number): void
  addTime(sec: number): void
  loseTime(sec: number): void
  addScore(pts: number): void
  breakCombo(): void
  bumpCombo(): void
  reportTicketCompleted(): void
  setScreen(s: GameScreen): void
  gameOver(reason: 'time' | 'gringo-3x'): void
}
```

### 4.2 `inventoryStore`
```ts
interface InventoryStore {
  cables: Cable[]
  terminals: Terminal[]
  tubes: HeatShrinkTube[]
  wip: (Cable | Splice | Harness)[]   // charola central
  cart: CartItem[]                     // lo que pediste al almacén
  // Acciones
  addCable(c: Cable): void
  removeCable(id: string): void
  moveToWip(item): void
  removeFromWip(id: string): void
  orderFromWarehouse(items: CartItem[]): void
  // ...
}
```

### 4.3 `stationStore`
```ts
interface StationStore {
  active: StationKind
  // Corte
  cutAreaCable: Cable | null
  cutAreaTermA: Terminal | null
  cutAreaTermB: Terminal | null
  // Splice
  spliceAreaCableA: Cable | null
  spliceAreaCableB: Cable | null
  spliceSelectedArea: number | null
  spliceArea: ...
  // Harness
  harness: Harness | null
  // Acciones
  setActive(s: StationKind): void
  clearStation(s: StationKind): void
}
```

### 4.4 `eventStore`
```ts
interface EventStore {
  activeEvents: GameEvent[]
  gringoCooldownUntil: number
  // Acciones
  spawnEvent(kind: EventKind, payload?): void
  resolveEvent(id: string, result: 'ok' | 'fail'): void
  // ...
}
```

### 4.5 Persistencia
```ts
// gameStore.ts
import { persist } from 'zustand/middleware'

export const useGameStore = create(
  persist(
    (set, get) => ({ ... }),
    {
      name: 'makileros:run',
      partialize: (s) => ({
        score: s.score,
        combo: s.combo,
        currentTicket: s.currentTicket,
        runStats: s.runStats,
        highscore: s.highscore,
        screen: s.screen === 'playing' ? 'paused' : s.screen,  // al recargar, queda pausado
      }),
    }
  )
)
```

---

## 5. Game Loop (requestAnimationFrame)

Hook: `src/hooks/use-game-loop.ts`

```ts
export function useGameLoop() {
  const tick = useGameStore((s) => s.tick)
  useEffect(() => {
    let raf: number
    let last = performance.now()
    const loop = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      // tick sólo si está jugando y no congelado
      const { screen, timerFrozen } = useGameStore.getState()
      if (screen === 'playing' && !timerFrozen) {
        tick(delta)
      }
      // Spawnea eventos aleatorios
      useEventStore.getState().maybeSpawn(now)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [tick])
}
```

El `tick` hace:
1. `timerSec -= delta` (con delta escalado por modo y buffs)
2. Si `timerSec <= 0` → `gameOver('time')`
3. Si `comboModeActive` y `now > comboModeEndsAt` → desactivar
4. Aplica escalado de dificultad según `runStats.timePlayedSec`

---

## 6. Drag & Drop (@dnd-kit)

### 6.1 Provider raíz
`src/components/providers/DndProvider.tsx`:
```tsx
'use client'
import { DndContext, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'

export function DndProvider({ children }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  )
  return (
    <DndContext sensors={sensors} onDragStart={...} onDragEnd={...}>
      {children}
    </DndContext>
  )
}
```

### 6.2 Item arrastrable (wrapper)
```tsx
// DraggableCable.tsx
import { useDraggable } from '@dnd-kit/core'

export function DraggableCable({ cable }: { cable: Cable }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `cable-${cable.id}`,
    data: { type: 'cable', payload: cable },
  })
  const style = { transform: CSS.Transform.toString(transform) }
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="...">
      {/* sprite del carrete de cable coloreado */}
    </div>
  )
}
```

### 6.3 Drop zone (wrapper)
```tsx
// use-drop-zone.ts
export function useDropZone(id: string, accepted: string[], onDrop: (item) => void) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { accepted },
  })
  // pero @dnd-kit no tiene "accepted" nativo → lo resolvemos en onDragEnd
  return { ref: setNodeRef, isOver }
}
```

### 6.4 Resolución en onDragEnd
La lógica de "qué pasa cuando sueltas X en zona Y" vive en un **resolver central** en `src/game/dragResolver.ts`:
```ts
export function resolveDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over) return
  const itemType = active.data.current?.type
  const zoneId = over.id as string
  // Switch por tipo de item + zona
  switch (`${itemType}->${zoneId}`) {
    case 'cable->cut-blade':
      return handleCableToBlade(active.data.current!.payload)
    case 'terminal->cut-termA':
      return handleTerminalToCutSide('A', ...)
    case 'cable->splice-machine-a':
      return handleCableToSplice('A', ...)
    // ... 20+ casos
  }
}
```

Esto centraliza la lógica para que sea testeable y mantenible.

---

## 7. Audio (Web Audio API)

Singleton: `src/lib/audio.ts`

```ts
class AudioManager {
  private ctx: AudioContext | null = null
  private cache: Map<string, HTMLAudioElement> = new Map()
  private volume = 0.7

  init() {
    if (this.ctx) return
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  resume() {
    this.ctx?.resume()
  }

  setVolume(v: number) {
    this.volume = v
    this.cache.forEach((audio) => (audio.volume = v))
  }

  play(name: string, opts: { loop?: boolean; rate?: number } = {}) {
    if (!this.ctx) return
    const audio = this.getOrCreate(name)
    audio.volume = this.volume
    audio.loop = !!opts.loop
    if (opts.rate) audio.playbackRate = opts.rate
    audio.currentTime = 0
    audio.play().catch(() => {})
  }

  stop(name: string) {
    const audio = this.cache.get(name)
    if (audio) { audio.pause(); audio.currentTime = 0 }
  }

  private getOrCreate(name: string) {
    let audio = this.cache.get(name)
    if (!audio) {
      audio = new Audio(`/sfx/${name}.mp3`)
      audio.preload = 'auto'
      this.cache.set(name, audio)
    }
    return audio
  }
}

export const audio = new AudioManager()
```

Hook: `src/hooks/use-sound.ts`
```ts
export function useSound() {
  return (name: string, opts?) => audio.play(name, opts)
}
```

**Restricción autoplay:** el `AudioManager.init()` se llama dentro del `onClick` del botón "JUGAR" en TitleScreen. Resuelve el problema de autoplay policy.

---

## 8. Eventos Aleatorios

Hook: `src/hooks/use-game-events.ts`

```ts
export function useGameEvents() {
  useEffect(() => {
    const interval = setInterval(() => {
      const { screen, mode } = useGameStore.getState()
      if (screen !== 'playing') return
      const elapsed = useGameStore.getState().runStats.timePlayedSec
      const difficulty = computeDifficulty(elapsed, mode)
      // Probabilidades ponderadas
      const roll = Math.random()
      let acc = 0
      for (const ev of EVENT_SPAWN_TABLE) {
        acc += ev.prob(difficulty)
        if (roll < acc) {
          useEventStore.getState().spawnEvent(ev.kind)
          break
        }
      }
    }, 5000)  // check cada 5s
    return () => clearInterval(interval)
  }, [])
}
```

`EVENT_SPAWN_TABLE` define las probabilidades en `constants.ts`.

---

## 9. Flujo de Pantallas (FSM)

La pantalla activa es `useGameStore.screen`. `GameApp.tsx` es el switch:

```tsx
export function GameApp() {
  useGameLoop()
  useGameEvents()
  const screen = useGameStore((s) => s.screen)
  return (
    <DndProvider>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          {screen === 'title'   && <TitleScreen/>}
          {screen === 'howto'   && <HowToPlay/>}
          {screen === 'playing' && <GameScreen/>}
          {screen === 'paused' && <PausedScreen/>}
          {screen === 'gameover'&& <GameOverScreen/>}
        </main>
        <Footer/>
      </div>
    </DndProvider>
  )
}
```

---

## 10. API Routes (opcional, Fase 3)

### `POST /api/scores`
Body: `{ initials: string, score: number, tickets: number, mode: GameMode }`
Persiste en Prisma `Score`. Retorna `{ ok: true, rank: number }`.

### `GET /api/scores?mode=normal&limit=10`
Lista los top 10 scores. Usado en GameOverScreen.

### `POST /api/generate-asset` (Fase 3, opcional)
Proxy server-side a `z-ai-web-dev-sdk` image-generation. Solo se usa para regenerar assets, no en runtime de gameplay (los assets viven en `/public`).

---

## 11. Prisma Schema (Fase 3)

`prisma/schema.prisma`:
```prisma
model Score {
  id        String   @id @default(cuid())
  initials  String
  score     Int
  tickets   Int
  mode      String   // 'normal' | 'chaos' | 'free'
  createdAt DateTime @default(now())
  @@index([mode, score])
}

model SessionLog {
  id        String   @id @default(cuid())
  mode      String
  durationSec Int
  ticketsCompleted Int
  finalScore Int
  errors    Int
  gringoEncounters Int
  createdAt DateTime @default(now())
}
```

---

## 12. Performance

| Riesgo | Mitigación |
|---|---|
| Re-render excesivo por tick del timer | `tick` solo actualiza `timerSec`; UI del timer usa selector fino |
| Items arrastrables lentos | `React.memo` + `transform: CSS` |
| Memoria con muchos listeners | `@dnd-kit` es eficiente por diseño; no montar +50 zones |
| Audio cargar todo al inicio | Carga perezosa; pre-load sólo el click y buzz |
| Imágenes pesadas | `next/image` + `priority` sólo para portada |

---

## 13. Build vs Dev

- **`bun run dev`** — servidor con HMR, lectura de `dev.log` para diagnostico
- **Nunca** `bun run build` (restricción sandbox)
- Lint: `bun run lint` antes de declarar feature completa
- Si aparecen errores en `dev.log`, prioridad sobre nuevos features

---

## 14. Internacionalización (i18n)

Archivo: `src/lib/i18n.ts` — diccionario simple (no se requiere next-intl para MVP).

```ts
export const T = {
  supervisor_warn_1: "Eh, checa el programa, equivocaste el largo.",
  supervisor_angry_1: "¡Ya vas muy lento, ponle ganas!",
  gringo_phrases: [
    "¡Move your ass, cabrón!",
    "¡We are losing money, pénsale!",
    "¡This is a disaster, mano!",
    "¡Come on, prestale attention!",
  ],
  // ... 50+ strings
}
```

Si en el futuro se requiere multi-idioma completo, se migra a `next-intl` (ya instalado).

---

## 15. Testing (sin escribir tests formales)

- Verificación manual con `agent-browser` después de cada feature
- Verificar: timer funciona, drag & drop arrastra, sonidos reproducen, no errores en consola
- Respetar `prefers-reduced-motion` en DevTools al probar

---

## 16. Convenciones de Código

- `'use client'` en todo componente que use Zustand o dnd-kit o framer-motion
- Imports absolutos con `@/` (configurado en `tsconfig.json`)
- Nombres de archivos: `PascalCase.tsx` para componentes, `camelCase.ts` para lib
- Comentarios JSDoc en funciones públicas del store y resolver

---

Fin del documento de arquitectura. Para plan de ejecución ver `03-ROADMAP.md`.
