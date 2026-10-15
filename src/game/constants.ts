// src/game/constants.ts
// Configuración global del juego: scores, probabilidades, duraciones

import type { CableColor, CableGauge, TerminalType, EventKind, GameMode } from './types'

// === Tiempo ===
export const START_TIME_SEC = 120
export const TICK_DELTA_SCALE = {
  normal: 1.0,
  chaos: 1.2, // balanced: was 1.4 (too punishing), now 1.2
  free: 0.0, // free mode no decrementa
} as const

// === Bonus/Penalizaciones de tiempo ===
export const TIME_BONUS = {
  cutCorrect: 3,
  spliceCorrect: 4,
  pressCorrect: 4,
  harnessTestPassed: 10,
  ticketCompleted: 10,
  setupSaved: 10,
  coffee: 5, // congela 5s
}

export const TIME_PENALTY = {
  cutWrong: 5,
  spliceWrong: 5,
  pressWrong: 5,
  harnessTestFailed: 15,
  missingTerminalGt10: 8,
  maintenanceFail: 15,
  supervisorAngry: 10,
  gossip: 3,
  gringoReset: 0, // especial: reinicia a 15s
}

export const GRINGO_RESET_TIME = 15

// === Scoring ===
export const SCORE = {
  cutCorrect: 50,
  terminalOptional: 30,
  spliceCorrect: 80,
  tubeApplied: 20,
  pressCorrect: 70,
  toolIdScanned: 25,
  harnessCircuitCorrect: 60,
  harnessTestPassed: 200,
  setupSaved: 150,
  qualityAuditPassed: 50,
  comboMult: { x2: 2, x3: 3, x5: 5, x10: 10 },
  cutWrong: -80,
  spliceWrong: -120,
  pressWrong: -100,
  harnessTestFailed: -150,
  qualityAuditFailed: -75,
  skipTag: -100,
}

// === Combos ===
export const COMBO_THRESHOLD_FAST = 3 // cada 3 aciertos -> Modo Rápido
export const COMBO_FAST_DURATION_SEC = 15
export const COMBO_MULT_IN_FAST = 2

// === Spawn rate eventos (cada 5s se tira check) ===
export const EVENT_CHECK_INTERVAL_SEC = 5
export const EVENT_SPAWN_TABLE: Array<{
  kind: EventKind
  baseProb: number // prob base en modo normal a dificultad 0
  chaosMult: number
  freeMult: number
  minElapsedSec: number
}> = [
  { kind: 'gossip', baseProb: 0.18, chaosMult: 1.4, freeMult: 0.3, minElapsedSec: 30 },
  { kind: 'supervisor-warn', baseProb: 0.10, chaosMult: 1.5, freeMult: 0.2, minElapsedSec: 60 },
  { kind: 'supervisor-angry', baseProb: 0.05, chaosMult: 2.0, freeMult: 0.0, minElapsedSec: 120 },
  { kind: 'maintenance', baseProb: 0.04, chaosMult: 1.3, freeMult: 0.5, minElapsedSec: 45 },
  { kind: 'quality-audit', baseProb: 0.03, chaosMult: 1.5, freeMult: 0.0, minElapsedSec: 180 },
  { kind: 'gringo', baseProb: 0.0, chaosMult: 0.0, freeMult: 0.0, minElapsedSec: 90 }, // manejado por timer, no random
]

// === Gringo ===
export const GRINGO_INTERVAL_SEC = {
  normal: 90,
  chaos: 60, // balanced: was 45 (too punishing), now 60
  free: Infinity,
} as const
export const GRINGO_3_ERRORS_TRIGGER = 3

// === Boosts ===
export const BOOST_MORAL_DURATION_SEC = 10
export const BOOST_MORAL_SPEED_MULT = 1.2
export const COFFEE_FREEZE_SEC = 5
export const TACO_IMMUNITY_DURATION_TICKETS = 1

// === Power-up spawn rate (en pedidos de almacén) ===
export const POWERUP_RATES = {
  coffee: 0.10,
  taco: 0.05,
}

// === Almacén ===
export const WAREHOUSE_DELIVERY_SEC = {
  normal: 12,
  rushed: 24, // cuando inventario vacío
}
export const WAREHOUSE_RUSHED_ERROR_PROB = 0.30

// === WIP (charola central) ===
export const WIP_MAX_ITEMS = 12

// === Inventario inicial ===
export const INITIAL_INVENTORY = {
  cablesPerColor: 3, // 3 carretes por cada color al inicio
  terminalsPerType: 5,
  tubes: 8,
}

// === Catálogos ===
export const CABLE_COLORS: CableColor[] = ['red', 'black', 'yellow', 'green', 'white']
export const CABLE_GAUGES: CableGauge[] = [18, 20, 22]
export const TERMINAL_TYPES: TerminalType[] = ['FASTON-250', 'FASTON-110', 'RING-#8']

export const CABLE_COLOR_HEX: Record<CableColor, string> = {
  red: '#dc2626',
  black: '#18181b',
  yellow: '#eab308',
  green: '#16a34a',
  white: '#f8fafc',
}

export const CABLE_COLOR_LABEL: Record<CableColor, string> = {
  red: 'Rojo',
  black: 'Negro',
  yellow: 'Amarillo',
  green: 'Verde',
  white: 'Blanco',
}

export const TERMINAL_LABEL: Record<TerminalType, string> = {
  'FASTON-250': 'Faston 250',
  'FASTON-110': 'Faston 110',
  'RING-#8': 'Ring #8',
  NONE: 'Sin terminal',
}

// === Part-numbers base para tickets ===
export const PART_NUMBERS = [
  'A-4471-B', 'B-8821-C', 'C-1192-D', 'D-3344-A', 'E-7788-F',
  'F-9901-G', 'G-2233-H', 'H-5566-J', 'J-8899-K', 'K-1122-L',
  'L-4455-M', 'M-7788-N', 'N-0011-P', 'P-3344-Q', 'Q-7766-R',
  'R-9988-S', 'S-2211-T', 'T-5544-U', 'U-8877-V', 'V-1100-W',
]

// === Probabilidad de bonus setup ===
export const SAME_SETUP_PROB = 0.40

// === Keys de localStorage ===
export const STORAGE_KEYS = {
  highscore: 'makileros:highscore',
  settings: 'makileros:settings',
  run: 'makileros:run',
  stats: 'makileros:stats',
}

// === Dificultad escalonada ===
export function computeDifficulty(elapsedSec: number, mode: GameMode): number {
  // 0.0 a 1.0+ según tiempo
  const base = Math.min(1.0, elapsedSec / 600) // a los 10 min está al máximo
  return mode === 'chaos' ? Math.min(1.5, base + 0.3) : base
}

// === Duración de eventos (ms) ===
export const EVENT_DURATION_SEC: Record<EventKind, number> = {
  'supervisor-warn': 4,
  'supervisor-angry': 4,
  maintenance: 8, // minijuego
  gringo: 5,
  gossip: 8,
  'quality-audit': 12,
}

// === Mensajes del Gringo (espanglish) ===
export const GRINGO_PHRASES = [
  '¡Move your ass, cabrón!',
  '¡We are losing money, pénsale!',
  '¡This is a disaster, mano!',
  '¡Come on, prestale attention!',
  '¡You are killing me, muchacho!',
  '¡Hurry up, is not rocket science!',
  '¡What the heck is going on here?!',
  '¡You think this is a joke, bato?',
  '¡Time is money, movete ya!',
  '¡No wonder we are behind schedule!',
  '¡Hey muchacho, wake up and smell the coffee!',
  '¡This is unacceptable, mano, totally unacceptable!',
  '¡If I see one more mistake, I swear...',
  '¡Deadline is yesterday, apúrate!',
  '¡My grandma works faster than you!',
  '¡Are you sleeping on the job, cabrón?',
]

export const SUPERVISOR_WARN_PHRASES = [
  'Eh, checa el programa, equivocaste el largo.',
  'Oye, ese no es el cable del ticket.',
  'Te falta el terminal, cabrón.',
  'Ese gauge no es, revisa el Garnet.',
  'No, no, no. Empieza otra vez.',
  'Checa el color, equis no va.',
  'Te faltó el tubo de encoge, ponte trucha.',
  'Ese splice va torcido, corrígelo.',
  'Ese aplicador no es el del ticket.',
  '¿Ya escaneaste el Tool ID? Pónle.',
  'El harness está incompleto, faltan circuitos.',
]

export const SUPERVISOR_ANGRY_PHRASES = [
  '¡Ya vas muy lento, ponle ganas!',
  '¡Otra vez tú con lo mismo!',
  '¡Si sigues así te cambio de estación!',
  '¡Ya me hartaste, ponte las pilas!',
  '¡No es tan difícil, cabrón!',
  '¡Llevas 3 errores seguidos, ya qué!',
  '¡Si no le atinas, mejor vete a casa!',
  '¡El Gringo viene y nos corre a todos!',
  '¡Ya no hay tiempo, muévete!',
]

export const GOSSIP_PHRASES = [
  '¿Oíste que el supervisor anda de mal humor?',
  'Dicen que el Gringo viene hoy...',
  'En almacén ya no hay fastones.',
  'Ayer corrieron a Lupe por lo mismo.',
  'El de calidad trae la regla bien medidora.',
  '¿Viste el taco de canasta que trajo Juan?',
  'El de mantenimiento se quedó dormido en el baño.',
  'Oye, hay café gratis en la oficina. ¡Pero no le digas a nadie!',
  'Dicen que hay vacante en otra línea. ¿Te vas?',
  '¿Ya viste a la nueva? Está bien guapa.',
  'El jefe anda revisando los WIPs, cuidado.',
  'Pásame el desarmador, no seas malo.',
  '¿Cuánto te pagan? Yo gano más en la cantina.',
  'Ayer se atoró la prensa, qué susto.',
  'El de mantenimimento anda de crudo otra vez.',
]
