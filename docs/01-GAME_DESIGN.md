# 01 — Game Design Document (GDD)
## Los Makileros: Sobreviviendo al Piso

> **Versión:** 1.0
> **Género:** Arcade / Simulación de Trabajo / Humor / Gestión de Tiempo
> **Plataforma:** Web App (Next.js 16)
> **Idioma principal:** Español (con espanglish intencional en el Gringo)
> **Público:** 12+ (humor limpio, sin violencia gráfica)

---

## 1. Visión del Juego

Parodia arcade del trabajo en una planta de manufactura de arneses eléctricos (maquiladora). El jugador asume el rol de un operador novato que debe completar tickets de trabajo antes de que el cronómetro llegue a cero. El caos proviene de errores humanos, supervisor enojado, máquinas que se atoran, escasez de material, compañeros chismosos, auditores y — cada cierto tiempo — "El Gringo Enojado" que viene a gritar en espanglish.

La mecánica principal es **Drag & Drop**: agarrar físicamente el carrete de cable, arrastrarlo a la cuchilla, soltarlo, ver cómo sale el corte. Darle clic a un botón no se siente igual que agarrar el cable.

### 1.1 Estado emocional objetivo
- **Tensión** por el cronómetro
- **Satisfacción** por combos y clicks de circuito conectado
- **Risa** por diálogos y eventos absurdos
- **Frustración cómica** cuando el Gringo reinicia el timer

### 1.2 Loop central (30 segundos)
```
Leer ticket → Buscar material → Configurar máquina
→ Ejecutar (cortar/splice/prensar/ensamblar) → Verificar → Reportar
→ Recibir puntos + tiempo bonus → Siguiente ticket
```

---

## 2. Mecánica Central: Tiempo y Puntos

### 2.1 Cronómetro global
- Empieza en **120 segundos** (suficiente para 3-4 tickets iniciales)
- **Tarea exitosa:** +3s
- **Error (cable equivocado, terminal mal, etc.):** −5s
- **Reportar ticket completo:** +10s bonus + puntos por ticket
- **Cronómetro llega a 0:** Game Over (pantalla de resumen + high score)

### 2.2 Sistema de Combos
- Cada acción correcta suma al contador de combo
- **Combo x3:** entra "Modo Rápido" — animaciones más veloces, +100% puntos
- **Combo roto** si cometes error: contador vuelve a 0
- Combo máximo visible: `x5`, `x10`, `x20` (con efectos visuales progresivos)
- "Modo Rápido" dura 15s o hasta el próximo error

### 2.3 Scoring
| Acción | Puntos |
|---|---|
| Cortar cable correcto | +50 |
| Poner terminal correcto | +30 (opcional pero recomendado) |
| Splice soldado bien | +80 |
| Heat shrink aplicado | +20 |
| Cable prensado bien | +70 |
| Tool ID escaneado | +25 |
| Circuito ensamblado en conector correcto | +60 |
| Prueba eléctrica OK | +200 (gran cierre) |
| Bonus de Ahorro de Setup (mismo material que ticket anterior) | +150 |
| Combo multiplicador (x2, x3...) | multiplica base |
| **Errores** | |
| Cable incorrecto cortado | −80 |
| Splice sin heat shrink en horno | −120 (fundido) |
| Prensa con aplicador equivocado | −100 |
| Prueba eléctrica con fallo (BUZZ) | −150 + −15s |
| Área mal seleccionada en ultrasonido | −60 + activa Mantenimiento |

### 2.4 Bonus de Ahorro de Setup
- Al terminar un ticket, si el siguiente usa los mismos materiales (color de cable, tipo de terminal, gauge), y NO cambiaste nada en la estación:
  - **+150 puntos**
  - **+10s** bonus
  - Animación "¡SETUP AHORRADO!" + chasquido satisfactorio
- Si el material cambia y NO lo reemplazas, el Supervisor aparece de inmediato (§ 6.1)

---

## 3. Áreas del Juego (Niveles / Minijuegos)

El juego se compone de **3 estaciones activas**. El jugador puede cambiar entre estaciones con tabs superiores o haciendo clic en la miniatura del área. Cada estación tiene su propio inventario local (compartido con el inventario global vía arrastrar/soltar).

### 3.1 Área de Corte ✂️
**Propósito:** Cortar cables a la longitud correcta del ticket.

**Flujo:**
1. **Revisar Programa Garnet** (tablet lateral derecha): muestra largo (mm), número de circuitos, terminales A/B, color de cable
2. **Drag & Drop carrete de cable** del inventario a la cuchilla
3. **Drag & Drop terminales A y B** a los extremos del cable mostrado en pantalla
4. **Clic en botón "CORTAR"** (o arrastrar el cable visual al disco cortador)
5. **Drag & Drop del cable cortado** a la charola "WIP"

**Reglas:**
- Si son ≤10 circuitos: terminal es OPCIONAL
  - Lo pones → +30 puntos calidad
  - No lo pones → no pasa nada (pero contador de "faltas" sube)
- Si son >10 circuitos: terminal es OBLIGATORIO
  - Lo omites → la máquina corta, pero **−8s** de timer
- Material equivocado (color/gauge): corte se hace pero al reportar el ticket, falla prueba eléctrica

**Visual:**
- Carrete se "desenrolla" animadamente (framer-motion `motion.path`)
- Chispa visual al cortar
- Longitud del cable dibujada en escala (no real, representativa)

### 3.2 Área de Splices y Prensas 🔌
#### 3.2.1 Splices (Ultrasonic/Sonic Welder)
**Flujo:**
1. **Drag & Drop cable A** y **cable B** del WIP a la máquina de ultrasonido
2. **Seleccionar Área** (suma de calibres):
   - Botones disponibles: `1.0`, `2.0`, `3.0`, `4.0`, `5.0`
   - Si cables son 18 AWG + 20 AWG → suma 2.5 → seleccionar `3.0`
3. **Drag & Drop tubo de encoge (heat shrink)** sobre la unión
4. **Drag & Drop ensamble** a la banda transportadora (horno)
5. **Recoger** el ensamble sellado al final de la banda

**Riesgos:**
- Olvidaste el heat shrink antes del horno → ensamble sale "fundido" (visual derretido) → −120 pts
- Área mal seleccionada → máquina se atora → Mantenimiento aparece
- Banda se acumula si no recoges los ensambles a tiempo → se caen al basurero

#### 3.2.2 Prensas
**Flujo:**
1. **Drag & Drop aplicador correcto** (según terminal del ticket) a la prensa
2. **Escaneo Tool ID:** arrastrar el **escáner** sobre el código de barras del aplicador
   - Si no lo validas, la prensa no se activa
3. **Drag & Drop cable + terminal** a la prensa
4. **Clic en botón rojo "PRENSAR"** (animación de descenso del pistón)
5. Cable prensado cae a charola

**Riesgos:**
- Aplicador equivocado → terminal mal crimpada → falla prueba eléctrica final
- Cable torcido al meterlo → prensa se atora → Mantenimiento

### 3.3 Área de Ensamble Final (Harness) 🧵
**Propósito:** Construir el arnés completo con todos los circuitos generados en las estaciones anteriores.

**Flujo:**
1. Aparece un **tablero con conectores vacíos** del harness (visual isométrico)
2. **Drag & Drop cada circuito / splice** del WIP al conector correcto
3. Si lo pones en desorden o en conector equivocado:
   - Visualmente se ve "chueco" o "fuera de lugar"
   - Puedes arrastrar de vuelta para corregir (sin penalización inmediata)
   - Pero la Prueba Eléctrica final fallará si está mal
4. **Prueba Eléctrica (clímax):**
   - Arrastrar el harness completo a la Máquina de Prueba
   - Presionar **botón rojo gigante** "TEST"
   - **ÉXITO:** luces verdes, chicharra alegre, ticket cerrado, +200 pts +10s
   - **FALLO:** **BUZZ estridente**, luces rojas parpadeantes, **−15s**, tienes que arrastrar de vuelta y corregir

---

## 4. Mecánicas Transversales

### 4.1 Almacén (La Logística del Caos)
- Botón "ALMACÉN" abajo a la izquierda
- Click → modal con lista de materiales disponibles
- **Drag & Drop lo necesario** a tu "Carrito" → "ENVIAR PEDIDO"
- **Tiempo de entrega:** barra de progreso (10-25s)
- **Modificador "apurado":** si pides cuando tu inventario está vacío, el almacenista se estresa → barra 2x más larga + 30% probabilidad de mandar material equivocado
- **"No hay X":** a veces almacenista responde "no hay terminales X" → tienes que arrastrar un **Tag de Salto** al circuito del harness → saltas ese circuito pero **−100 pts** al final del ticket

### 4.2 Cambios de Material y Setup
- Al reportar ticket terminado, arrastras el ticket a la charola "TERMINADOS"
- Si el siguiente ticket requiere otro color/terminal/gauge:
  - Arrastras el material viejo a la zona "Basura/Devolución"
  - Arrastras el material nuevo del inventario a la estación
  - Si intentas cortar con material viejo → Supervisor aparece inmediatamente (nivel 2 de enojo)
- Si NO cambiaste nada y el ticket usa lo mismo → Bonus Ahorro Setup

### 4.3 WIP (Work in Progress)
- Charola central compartida entre estaciones
- Arrastras circuitos cortados de Corte → WIP
- De WIP → Splices/Prensas
- De Splices/Prensas → WIP
- De WIP → Ensamble Harness
- Capacidad limitada: 12 items. Si excedes, item más viejo "se cae" (pérdida)

---

## 5. Power-Ups y Distracciones

### 5.1 El Cafecito ☕
- A veces viene mezclado en el pedido de almacén
- **Drag & Drop vaso de café** a tu personaje
- **Efecto:** congela el timer por 5 segundos + glow dorado
- Raro (10% de pedidos)

### 5.2 El Taco de Canasta 🌮
- También puede venir en el pedido
- **Drag & Drop** a tu personaje
- **Efecto:** inmunidad contra el Supervisor por 1 ticket completo
- Muy raro (5% de pedidos)

### 5.3 El Chisme 🗣️
- Aparece un compañero en estación vecina con nube de pensamiento 💭
- Si le **haces clic**: pierdes 3 segundos pero ganas **Boost de Moral** (todo +20% veloz por 10s)
- Si lo **ignoras**: 50% probabilidad de que tape parte de la pantalla por 5s
- Aparece cada 60-90s en modo Normal

### 5.4 Boost de Moral
- Velocidad de todas las animaciones +20%
- Glifo "💪 MORAL" junto al cronómetro
- No cancela Modo Rápido (se acumulan)

---

## 6. Personajes (Eventos y Penalizaciones)

### 6.1 El Supervisor ("El Jefe") 👔
- Aparece en el borde superior izquierdo de la pantalla
- **Nivel 1 (advertencia):** dice "Eh, checa el programa, equivocaste el largo." → no penaliza pero avisa
- **Nivel 2 (enojado):** rojo, **−10s** de golpe, grita "¡Ya vas muy lento, ponle ganas!"
- **Triggers:**
  - Material viejo sin cambiar (3s después de nuevo ticket)
  - 2 errores consecutivos
  - Tiempo sin reportar ticket > 45s

### 6.2 Mantenimiento ("El Chido") 🔧
- Aparece si la máquina se atora (área mal seleccionada en splices, cable torcido en prensa)
- **Minijuego de reparación (5s):**
  - 3 herramientas aparecen en desorden
  - Arrastras cada herramienta a su contorno correcto
  - Si completas en <5s: máquina reparada + puedes seguir
  - Si no: te come 15s del timer
- Visual: gorrita, overol, cerveza imaginaria en el bolsillo

### 6.3 El Gringo Enojado ("The Boss") 😡
- Aparece cada 90s en modo Normal, 45s en Caótico, o si fallas 3 veces seguidas
- **Efecto:**
  - Pantalla tiembla (CSS shake animation)
  - Lanza papeles volando (framer-motion)
  - Timer **reiniciado a 15s**
  - Grilla audio: sirena de alarma
- **Frases (espanglish):**
  - "¡Move your ass, cabrón!"
  - "¡We are losing money, pénsale!"
  - "¡This is a disaster, mano!"
  - "¡Come on, prestale attention!"
- Visual: traje ejecutivo, corbata, caja de donas en mano

### 6.4 El de Calidad (Auditores) 📋
- Aparece aleatoriamente cada 2-3 tickets
- **Congela** tu trabajo (modal bloqueante)
- **Quick Audit:** muestra 3 circuitos visuales
  - Uno tiene el error (terminal chueca, cable mal color, etc.)
  - Arrastras el malo a la basura
  - Aciertas → "Conforme" +50 pts bonus calidad
  - Fallas → **"No Conformidad"** → pierdes 50% del bonus de calidad acumulado

---

## 7. UI / UX

### 7.1 Layout de la Estación (Desktop)
```
┌──────────────────────────────────────────────────────────────┐
│  [TABS ESTACIONES: ✂️ Corte | 🔌 Splices | 🧵 Harness]      │
├──────────────┬──────────────────────────┬─────────────────────┤
│              │                          │                     │
│  INVENTARIO  │   ÁREA DE TRABAJO        │   TICKET ACTUAL     │
│  (cables,    │   (máquina, mesa,       │   + Programa       │
│   terminales,│   tablero harness)       │   Garnet           │
│   tubos)     │                          │                     │
│              │                          │   [Datos: largo,   │
│  [Carrito    │   [Drag & Drop aquí]    │    circuitos,      │
│   Almacén]   │                          │    terminales A/B] │
│              │                          │                     │
├──────────────┴──────────────────────────┴─────────────────────┤
│  TIMER: ⏱ 02:34   COMBO: x3   PUNTOS: 12,450                │
│  [🛒 ALMACÉN]  [✅ REPORTAR TERMINADO]  [⚙️ AJUSTES]          │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Componentes UI clave (shadcn/ui)
- `Tabs` — para cambiar entre estaciones
- `Card` — para inventario, ticket, áreas
- `Dialog` — para modales de mantenimiento, auditoría, game over
- `Sheet` — para el carrito de almacén deslizable
- `Toaster` (sonner) — para notificaciones emergentes
- `Progress` — para barra de tiempo, barra de buff
- `Badge` — para combos, niveles de enojo, "CONFORME"
- `Tooltip` — para hints en items del inventario
- `AlertDialog` — para "¿Reiniciar partida?"
- `Slider` — para ajustes de volumen

### 7.3 Paleta de colores (industrial, NO indigo/azul)
| Token Tailwind | Uso |
|---|---|
| `bg-background` | Fondo general |
| `bg-card` | Paneles |
| `bg-yellow-400/amber-500` | Advertencias, supervisor nivel 1, programa Garnet |
| `bg-red-500/destructive` | Errores, BUZZ, Gringo, supervisor nivel 2 |
| `bg-emerald-500` | Éxito, prueba eléctrica OK, conformidad |
| `bg-orange-500` | Mantenimiento, almacén |
| `bg-purple-500` | Chisme, boost moral (distracción / poder) |
| `bg-stone-800` | Bandas transportadoras, máquinas |
| `text-amber-300` | Texto sobre oscuro, mono industrial |

### 7.4 Tipografías
- **Sans (Geist Sans):** textos generales
- **Mono (Geist Mono):** tickets, programa Garnet, números de timer, score

### 7.5 Sonidos (SFX) — carpeta `/public/sfx`
| Evento | Archivo | Característica |
|---|---|---|
| Click circuito conectado | `click-ok.mp3` | Satisfactorio, tono alto corto |
| BUZZ prueba fallida | `buzz-fail.mp3` | Estridente 1.5s |
| Sirena Gringo | `siren-alarm.mp3` | 2s loopable |
| Cut cable | `cut-slice.mp3` | Cizalla 0.4s |
| Ultrasonic | `ultrasonic-hum.mp3` | Zumbido 1s |
| Prensa | `press-thunk.mp3` | Golpe 0.3s |
| Horno | `oven-whoosh.mp3` | Aire 1.5s |
| Combo x3 | `combo-chime.mp3` | Ascendente |
| Game over | `game-over.mp3` | Descendente triste |
| Chisme | `whisper-loop.mp3` | Susurros 3s |
| Café (glug) | `coffee-glug.mp3` | |
| Taco mordisco | `taco-bite.mp3` | |

**Música de fondo:** loop suave de fábrica (opcional, toggleable en ajustes)

---

## 8. Estados de Pantalla (Game States)

```
            ┌─────────────┐
            │   BOOT /    │
            │   TITLE     │
            └──────┬──────┘
                   │ click JUGAR
                   ▼
            ┌─────────────┐
            │  HOW TO     │
            │  PLAY       │
            └──────┬──────┘
                   │ Entendido
                   ▼
            ┌─────────────┐
   ┌────────│   PLAYING   │────────┐
   │        └─────────────┘        │
   │ Evento:                        │ Evento:
   │ Gringo / 0 timer               │ Mantenimiento /
   │                                │ Auditor
   ▼                                ▼
┌──────────┐                 ┌──────────────┐
│ GAME     │                 │ MINI-GAME    │
│ OVER     │                 │ (bloqueante) │
└────┬─────┘                 └──────┬───────┘
     │ Click continuar              │ Termina
     ▼                              ▼
┌──────────┐                 Vuelve a PLAYING
│ SCORE    │
│ SCREEN   │
└──────────┘
```

---

## 9. Curva de Dificultad (Modo Normal)

| Tiempo (min) | Tickets / min | Eventos aleatorios | Prob. Gringo |
|---|---|---|---|
| 0–1 | 1.5 | Bajo | 0% (gracia) |
| 1–3 | 2.0 | Bajo | 10% |
| 3–5 | 2.5 | Medio | 20% |
| 5–10 | 3.0 | Alto | 35% |
| 10+ | 3.5 | Máximo | 50% |

**Modo Caótico:** todo x1.8.
**Modo Libre:** sin timer, sin Gringo, eventos al 30%.

---

## 10. Sistema de Tickets (Generación Procedural)

### 10.1 Estructura de un Ticket
```ts
type Ticket = {
  id: string
  partNumber: string           // ej. "A-4471-B"
  circuitCount: number         // 1-30
  cableColor: 'red'|'black'|'yellow'|'green'|'white'
  cableGauge: 18 | 20 | 22      // AWG
  length_mm: number            // 80-450
  terminalA: 'FASTON-250'|'FASTON-110'|'RING-#8'|'NONE'
  terminalB: same type
  needsSplice: boolean         // 30% prob
  needsHarness: boolean        // 60% prob
  circuits: CircuitSpec[]       // generados a partir de circuitCount
  baseScore: number
  timeBonusOnComplete: number  // +10s default
}
```

### 10.2 Generador (seeded para reproducibilidad)
- Pool de 50 part-numbers base
- Combinaciones aleatorias con seed derivado de `Date.now()`
- Dificultad escala con `circuitCount` y `needsSplice`
- Material "raro" (terminal X que a veces no hay) tiene 15% de probabilidad

### 10.3 Encadenamiento (Bonus Setup)
- 40% de probabilidad de que el siguiente ticket use el mismo material
- Si el jugador lo detecta y NO cambia setup → bonus
- Si el ticket está garantizado "mismo material", aparece un ícono "🔄" en el programa Garnet

---

## 11. Persistencia y Progreso

### 11.1 LocalStorage (cliente)
- `makileros:highscore` — número
- `makileros:settings` — { volume, music, theme, difficulty }
- `makileros:run` — estado completo de partida (auto-save cada 5s y al cerrar ticket)
- `makileros:stats` — { ticketsCompleted, totalScore, timePlayed, gringoEncounters }

### 11.2 Prisma SQLite (opcional, Fase 3)
- Tabla `Score` — { id, initials, score, tickets, mode, createdAt }
- Tabla `SessionLog` — auditoría para análisis de balance (anónima)
- API routes: `POST /api/scores`, `GET /api/scores?mode=normal&limit=10`

---

## 12. Accesibilidad

- **Tamaños mínimos 44px** en todos los elementos arrastrables
- **Alternativa de teclado:** Tab + Enter para "arrastrar" el item enfocado a la zona activa
- **Modo Daltonico:** paleta alternativa sin rojo/verde simultáneos (usa formas + colores)
- **Subtítulos:** todos los sonidos del Gringo se subtitulan abajo
- **Reduce motion:** respeta `prefers-reduced-motion` (anims → crossfades rápidos)

---

## 13. Métricas de Diversión (KPI de diseño)

| Métrica | Target |
|---|---|
| Tickets por sesión de 5 min | 8-12 |
| Frecuencia de combos x3+ | 60% de sesiones |
| Game Over por tiempo agotado | 70% de partidas |
| Game Over por 3 errores Gringo | 25% |
| Clicks por minuto | 25-40 (no fatigante) |
| Sesión media | 6-9 min |
| "Una más" (replay) | 50%+ |

---

## 14. Roadmap de Contenido Post-MVP

- **Skins de personajes** (Makilero novato, veterano, jefe temporal)
- **Logros diarios** (ej. "Cortaste 100 cables sin error")
- **Eventos de temporada** (Día del Taco = power-ups x2)
- **Modo historia** (5 días de planta, cada día nuevo equipo se rompe)
- **Modo cooperativo asíncrono** (Fase 3 — ranking online)

---

## 15. Criterios de Aceptación del MVP

- ✅ Pantalla de título con botón JUGAR
- ✅ Área de Corte funcional con drag & drop
- ✅ Timer con +/- tiempo por acción
- ✅ Sistema de combos x3 con Modo Rápido
- ✅ Supervisor (nivel 1 y 2)
- ✅ Inventario con stock limitado
- ✅ Almacén con pedido y barra de progreso
- ✅ Sonidos mínimos (click, error, BUZZ, siren)
- ✅ Game Over con score + highscore persistente
- ✅ Responsive móvil (con fallback de botones)

**El MVP no incluye (Fase 2+):** Splices avanzados, prensas, harness con tablero, Gringo, chisme, taco/café.

---

Fin del GDD. Para detalles de implementación, ver `02-ARQUITECTURA.md`.
