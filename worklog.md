# Worklog — Los Makileros: Sobreviviendo al Piso

Proyecto: Web App arcade de manufactura con drag & drop, gestionada con Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui + @dnd-kit + framer-motion + zustand + Prisma SQLite.

Documentación completa en `/home/z/my-project/docs/`:
- `00-VIABILIDAD.md` — Análisis de viabilidad técnica
- `01-GAME_DESIGN.md` — Game Design Document (GDD) completo
- `02-ARQUITECTURA.md` — Arquitectura técnica detallada
- `03-ROADMAP.md` — Roadmap por fases

---

Task ID: 0-planning
Agent: Z.ai Code (main orchestrator)
Task: Planificación, análisis de viabilidad y creación de documentación del juego "Los Makileros" antes de programar.

Work Log:
- Revisé la estructura actual del proyecto Next.js 16: App Router, Tailwind 4, shadcn/ui completo (50+ componentes), TypeScript 5 estricto.
- Inspeccioné `package.json` y confirmé disponibilidad de paquetes clave para el juego:
  - `@dnd-kit/core` v6.3.1, `@dnd-kit/sortable` v10.0.0, `@dnd-kit/utilities` v3.2.2 (drag & drop moderno, pointer/touch unificado)
  - `framer-motion` v12.23 (animaciones de personajes, banda transportadora, screen shake)
  - `zustand` v5.0.6 (estado global del juego)
  - `next-themes` v0.4.6 (tema claro/oscuro ya configurado en globals.css)
  - `sonner` + `@radix-ui/react-toast` (notificaciones tipo toast)
  - `lucide-react` v0.525 (iconografía)
  - `recharts` v2.15 (estadísticas)
  - `prisma` + `@prisma/client` (SQLite para ranking online opcional)
  - `z-ai-web-dev-sdk` (generación de assets visuales)
- Revisé `src/app/page.tsx`, `layout.tsx`, `globals.css` para entender el esqueleto actual (placeholder Z.ai con logo).
- Creé carpeta `/home/z/my-project/docs/` y redacté 4 documentos técnicos:
  1. `00-VIABILIDAD.md` — Matriz de requisitos vs stack, riesgos, plataformas, veredicto.
  2. `01-GAME_DESIGN.md` — GDD completo con visión, mecánicas, áreas, personajes, power-ups, UI, scoring, KPIs.
  3. `02-ARQUITECTURA.md` — Estructura de carpetas, tipos del dominio, stores Zustand, game loop, DnD, audio, eventos, FSM de pantallas.
  4. `03-ROADMAP.md` — 9 fases (F0-F8) con subtareas y criterios de aceptación.

Stage Summary:
- **Veredicto de viabilidad:** ✅ El juego es 100% realizable como Web App con el stack actual. No requiere paquetes externos al permitido.
- **Stack confirmado:** Next.js 16 App Router + TypeScript 5 + Tailwind 4 + shadcn/ui (New York) + @dnd-kit + framer-motion + zustand + Web Audio API + Prisma SQLite (opcional para ranking).
- **Mecánica principal:** Drag & Drop con @dnd-kit (PointerSensor + TouchSensor + KeyboardSensor).
- **Ruta única:** Toda la experiencia en `/` con FSM interno de pantallas (title → howto → playing → paused → gameover).
- **Persistencia:** localStorage (zustand persist) para highscore y auto-save de partida; Prisma SQLite opcional para ranking online.
- **Audio:** Web Audio API nativa (sin Howler.js); AudioContext inicializado en el primer gesto del usuario (botón JUGAR).
- **Restricciones sandbox respetadas:** sin `bun run build`, sin puertos extra, sin WebSocket (MVP), `XTransformPort` no necesario.

Current project status description/assessment:
- **Estado:** Planeación completa. Código del juego aún NO iniciado (el usuario pidió explícitamente plan + documentación antes de programar).
- **Archivos del juego creados:** Ninguno todavía (sólo docs).
- **Stack instalado:** 100% listo para arrancar F0 (Setup y Andamiaje).
- **Próximo paso lógico:** Iniciar Fase 0 (F0) del roadmap — crear `src/game/types.ts`, `src/game/constants.ts`, stores vacíos tipados, `DndProvider`, `ThemeProvider`, reemplazar `src/app/page.tsx` con `<GameApp/>` switch.

Current goals/completed modifications/verification results:
- ✅ Meta 1: Análisis de viabilidad completado (veredicto positivo)
- ✅ Meta 2: GDD completo con todas las mecánicas del usuario documentadas
- ✅ Meta 3: Arquitectura técnica con estructura de carpetas, tipos, stores, game loop
- ✅ Meta 4: Roadmap de 9 fases con subtareas accionables
- ✅ Meta 5: Worklog inicial creado
- ⬜ Pendiente: confirmación del usuario para arrancar F0 (Setup)
- ⬜ Pendiente: configurar cron job de revisión cada 15 min (webDevReview)

Unresolved issues or risks, and priority recommendations for the next phase:
1. **Riesgo: autoplay policy del navegador** — mitigación documentada: AudioContext se inicializa en onClick del botón JUGAR.
2. **Riesgo: rendimiento con 50+ items arrastrables** — mitigación: React.memo, virtualización, límite 8-12 items activos por estación.
3. **Riesgo: drag en mobile interfiere con scroll** — mitigación: TouchSensor con activationConstraint delay 200ms + tolerance 8px.
4. **Riesgo: estado se pierde al recargar** — mitigación: zustand persist + auto-save cada 5s.
5. **Riesgo: generación de SFX** — los 12 archivos de sonido no existen todavía. Estrategia: generar con TTS skill para efectos vocales (frases Gringo), y sintetizar con Web Audio API + efectos cortos con bash/ffmpeg si está disponible, o usar assets CC0 del web-search.
6. **Prioridad recomendada para F0:** arrancar con andamiaje mínimo (F0) y validar con `agent-browser` que la app compila, carga `/`, el botón JUGAR cambia de pantalla, y `bun run lint` pasa sin errores.

Artifacts produced:
- `/home/z/my-project/docs/00-VIABILIDAD.md`
- `/home/z/my-project/docs/01-GAME_DESIGN.md`
- `/home/z/my-project/docs/02-ARQUITECTURA.md`
- `/home/z/my-project/docs/03-ROADMAP.md`
- `/home/z/my-project/worklog.md` (este archivo)

Next agent should:
1. Leer los 4 documentos en `/home/z/my-project/docs/` antes de tocar código.
2. Confirmar con el usuario (o proceder si ya está confirmado) el arranque de Fase 0.
3. Seguir el roadmap F0 → F1 → … → F8, verificando cada fase con `agent-browser`.
4. Anexar nuevos Task IDs al final de este worklog con el formato establecido.

---
Task ID: 1-f0-f1-mvp
Agent: Z.ai Code (cron-triggered autonomous agent)
Task: Completar F0 (Setup y Andamiaje) + F1 (MVP jugable: Corte) + F2 (eventos aleatorios básicos). Verificar con agent-browser.

Work Log:
- Leí el worklog anterior (Task 0-planning) que confirmó planeación completa sin código.
- Verifiqué dev server corriendo (puerto 3000) leyendo dev.log.
- Creé estructura de carpetas: `src/game/{store}`, `src/components/game/{screens,layout,stations,inventory,characters,effects,hud}`, `src/components/providers`, `src/hooks`, `src/lib`, `public/{sfx,img}`.
- Implementé tipos del dominio en `src/game/types.ts` (Cable, Terminal, Ticket, GameEvent, RunStats, DropZoneId, etc.).
- Implementé configuración en `src/game/constants.ts` (~250 líneas): scores, probabilidades de eventos, frases del Gringo/Supervisor/Chisme, catálogos de cables/terminales, keys de localStorage, función computeDifficulty().
- Implementé `src/lib/random.ts` con SeededRandom (xorshift32) + weightedPick.
- Implementé `src/lib/tickets.ts` generador procedural de tickets (20 part-numbers base, 40% probabilidad same-setup).
- Implementé `src/lib/audio.ts` AudioManager singleton con Web Audio API. **Sintetiza todos los SFX en runtime** (no requiere archivos mp3): click-ok, cut-slice, buzz-fail, siren-alarm, ultrasonic-hum, press-thunk, oven-whoosh, combo-chime, game-over, whisper-loop, coffee-glug, taco-bite, ticket-done, gringo-yell, supervisor-angry. Cada efecto se construye con osciladores + envolventes + filtros.
- Implementé `src/lib/i18n.ts` con diccionario completo en español + espanglish del Gringo.
- Implementé 4 stores Zustand:
  - `gameStore.ts` con persist middleware: screen, mode, timerSec, score, combo, currentTicket, runStats, highscore. Acciones: start, tick, addTime, loseTime, addScore, bumpCombo, breakCombo, registerError, triggerGringo, grantGringoImmunity, reportTicketCompleted, loadNextTicket, gameOver.
  - `inventoryStore.ts`: cables, terminals, tubes, wip (max 12), cartItems, deliveryProgress, coffeePending, tacoPending.
  - `stationStore.ts`: estado de las 4 estaciones (corte, splices, prensas, harness) con slots individuales.
  - `eventStore.ts`: activeEvents, gringoCooldownUntil, currentSubtitle, spawnSupervisorWarn/Angry, spawnGossip, spawnGringo, spawnMaintenance, spawnQualityAudit.
- Implementé `src/game/dragResolver.ts` resolutor central con switch por tipo de item + zona. Casos: cable->cut-blade, terminal->cut-termA/B, cable->wip-tray, cable->trash, terminal->trash, powerup->character.
- Implementé providers:
  - `DndProvider.tsx` con PointerSensor (distance 5), TouchSensor (delay 180ms tolerance 8), KeyboardSensor, DragOverlay con preview.
  - `ThemeProvider.tsx` con next-themes.
- Implementé hooks:
  - `use-game-loop.ts` con requestAnimationFrame: tick decremental con TICK_DELTA_SCALE[mode], spawn de eventos cada 5s con EVENT_SPAWN_TABLE, spawn del Gringo cada intervalo (90s normal / 45s chaos / infinity free), clear de subtítulos expirados.
  - `use-sound.ts` wrapper del AudioManager.
- Actualicé `src/app/layout.tsx`: lang="es", metadata en español, título "Los Makileros: Sobreviviendo al Piso", ThemeProvider envolviendo children.
- Reemplacé `src/app/page.tsx` con `<GameApp/>` cargado dinámicamente (SSR off) + loading state con texto "CARGANDO PLANTA..." en mono industrial.
- Implementé GameApp.tsx con switch de pantallas: title / howto / playing / paused (overlay) / gameover. Monta CharacterLayer, EffectsLayer, SubtitleBar.
- Implementé pantallas con styling detallado:
  - **TitleScreen**: fondo con parallax de bandas, glow amber/red pulsante, badge "MODO ARCADE", título con drop-shadow rojo, 3 modos (Normal/Caótico/Libre) con hover/tap animations, chips de features, highscore persistente, banner amarillo-negro inferior.
  - **HowToPlay**: 5 slides animadas con framer-motion (slide horizontal), iconos por slide, indicador de progreso, botones Anterior/Siguiente/Entendido.
  - **GameScreen**: layout 3-columnas (Inventario / WorkArea+WipTray / TicketPanel), TopBar con tabs (Scissors/Cable/Wrench/Grid3x3), banner amarillo superior e inferior.
  - **GameOverScreen**: skull grande rotando, partículas de papeles cayendo, score final con font-mono amber, "NUEVO RÉCORD" pulsante, stats grid (tickets, combo, tiempo, gringo encounters), botones JUGAR DE NUEVO / VOLVER AL MENÚ.
  - **PausedScreen**: overlay backdrop-blur con botón Continuar / Volver al menú.
- Implementé HUD components:
  - **Timer**: cronómetro con color escalado (emerald/amber/red según urgencia), animación de pulso cuando <= 15s, modo Libre muestra ∞.
  - **ScoreBoard**: número grande en emerald mono.
  - **ComboIndicator**: con AnimatePresence popLayout, muestra "x1, x2, x3..." con animación de entrada/salida por cada cambio.
  - **SubtitleBar**: banner abajo-centro con subtítulo de eventos, AnimatePresence.
- Implementé layout:
  - **TopBar**: logo "M" + nombre, Tabs de estaciones, badges (☕ FREEZE, 🌮 SHIELD, 💪 MORAL x1.2, ⚡ MODO RÁPIDO), Timer, ScoreBoard, ComboIndicator.
  - **InventoryPanel**: cables agrupados por color+gauge con badge de cantidad, terminales agrupados por tipo, sección de tubos con contador, sección de power-ups cuando hay pending.
  - **WorkArea**: header con icono y nombre de estación activa, renderiza CutStation (otros ComingSoon).
  - **CutStation**: dropzones para cut-blade (32x32), cut-termA, cut-termB, trash. Botón CORTAR rojo grande. Indicador de "Terminal OBLIGATORIO" si circuitCount > 10. Visual del carrete animado (framer-motion spring). Visual del terminal con SVG.
  - **TicketPanel**: header "Programa Garnet" en amber. Part number grande. Datos: color (con swatch), gauge, longitud, circuitos, terminal A/B con indicador obligatorio. Process badges (Splice/Harness). Puntos base + bonus tiempo. Botón REPORTAR en emerald.
  - **WipTray**: charola central con scroll horizontal, contador 12/12, cables cortados mostrados como mini-rectángulos de color.
  - **BottomBar**: botones Almacén (disabled), Reportar (emerald), Pausa, Ajustes. Banner subtítulo absoluto.
  - **GameFooter**: sticky al fondo con credits y version.
- Implementé inventory components:
  - **DraggableCable**: carrete visual con radial gradient del color, pestañas, cable saliendo animado, badge de cantidad, hover/tap animations.
  - **DraggableTerminal**: SVG de terminal con crimp tabs, etiqueta tipo, badge cantidad.
  - **DraggablePowerup**: café/taco con gradient y icono pulsante.
  - **DraggablePreview**: overlay durante drag.
- Implementé characters/effects:
  - **CharacterLayer**: renderiza supervisor (warn=level1/angry=level2), gossip peer, gringo backdrop, badge TACO SHIELD si inmunidad.
  - **EffectsLayer**: cuando Gringo activo, renderiza 15 papeles volando con framer-motion + flash rojo pulsante.
- Añadí estilos custom en `globals.css`: keyframes `band` (banda transportadora), scrollbar industrial `.custom-scroll`, `.touch-none` para prevenir touch scroll durante drag, `.select-none`.
- Verifiqué `bun run lint` → exit code 0 sin errores.
- Verifiqué con `agent-browser`:
  - Abrí http://localhost:3000 → título carga, "Los Makileros" h1 visible.
  - Snapshot: 3 botones de modo (Normal/Caótico/Libre) + CÓMO JUGAR visibles.
  - Click "Normal" → entra a GameScreen, tabs visibles, 15 cables + 3 terminales en inventario, botón CORTAR disabled.
  - Drag "Rojo 18 AWG" a CORTAR → inventario baja de 3 a 2, CORTAR se habilita.
  - Click CORTAR con cable EQUIVOCADO (rojo 18 vs ticket negro 22) → errors=1, combo=0, score=0 (penalización aplicada correctamente).
  - Drag "Negro 22 AWG" (correcto) a CORTAR + click CORTAR → score=50 (cutCorrect), combo=1 (bumpCombo), gringoEncounters=1 (Gringo spawned durante el test de 90s+).
  - Sin errores en consola. Sin page errors.
- Capturas de pantalla guardadas en `/home/z/my-project/download/`:
  - `title-screen.png` — pantalla de título completa.
  - `game-screen-initial.png` — pantalla de juego inicial.
  - `game-screen-gameplay.png` — gameplay con cable cortado.

Stage Summary:
- **Fase F0 completada al 100%**: andamiaje técnico listo (tipos, constants, stores, providers, hooks, layout, page, audio, i18n, random, tickets).
- **Fase F1 completada al 100%**: MVP jugable de Área de Corte con drag & drop funcional, timer, scoring, combos, Game Over, highscore persistente, How To Play.
- **Fase F2 parcialmente completada**: eventos aleatorios básicos (Supervisor Warn/Angry, Gringo con screen shake + papeles + reset timer, Chisme con subtítulos, Maintenance + Quality Audit placeholders). Spawner de eventos cada 5s con probabilidad escalonada por dificultad.
- **Styling detallado**: paleta industrial (stone/amber/red/emerald/orange/purple), tipografía mono para datos, animaciones framer-motion en hover/tap/drag, banner amarillo-negro industrial, scrollbar custom.
- **Audio completo**: 15 SFX sintetizados en runtime con Web Audio API (no requiere assets externos).
- **Persistencia**: localStorage para highscore, ajustes y estado de partida (auto-save). Al recargar, queda en estado "paused" para reanudar.
- **Responsive**: layout mobile-first con grid que colapsa a 1 columna en móvil, tabs compactos, badges ocultos en pantallas pequeñas.

Current project status description/assessment:
- **Estado del juego:** Jugable de principio a fin en Modo Normal. El loop principal (Title → Jugar → Cortar cables → Score → Game Over → Rejugar) funciona end-to-end.
- **Características implementadas:**
  - 4 estaciones (Corte activa, Splices/Prensas/Harness placeholder "Coming Soon")
  - 15 combinaciones de cables + 3 terminales en inventario inicial
  - Generación procedural de tickets con bonus de setup ahorrable
  - Sistema de combos x3 → Modo Rápido
  - 4 modos de eventos (Supervisor warn/angry, Gringo, Chisme) + 2 placeholders (Mantenimiento, Calidad)
  - Pantalla de Cómo Jugar con 5 slides
  - Pantalla de Game Over con stats y highscore
  - Persistencia local completa
  - Audio sintetizado (15 SFX)
- **QA exitoso:** lint pasa sin errores, dev server compila, agent-browser confirma drag & drop funcional, scoring correcto, errores detectados, Gringo spawnea a los 90s.

Current goals/completed modifications/verification results:
- ✅ Meta 1: F0 (Setup y Andamiaje) completo.
- ✅ Meta 2: F1 (MVP jugable) completo — drag & drop + timer + score + combos + game over.
- ✅ Meta 3: F2 (eventos aleatorios básicos) implementado — Supervisor + Gringo + Chisme funcionando.
- ✅ Meta 4: Styling detallado — paleta industrial, animaciones, mono fonts, scrollbar custom.
- ✅ Meta 5: Verificación con agent-browser exitosa — drag & drop, scoring, errores, Gringo spawn.
- ✅ Meta 6: `bun run lint` pasa sin errores.

Unresolved issues or risks, and priority recommendations for the next phase:
1. **Estaciones Splices/Prensas/Harness aún son placeholders "Coming Soon"** → siguiente fase lógica es F3 (Splices) + F4 (Harness con prueba eléctrica BUZZ).
2. **Almacén (WarehouseSheet) botón disabled** → falta implementar F5 con pedido de material y estrés del almacenista.
3. **Mini-juego de Mantenimiento no implementado** → sólo se spawnea el evento pero no hay modal interactivo.
4. **Quick Audit de Calidad no implementado** → sólo se spawnea el evento pero no hay modal con 3 circuitos.
5. **Persistencia resetea stationStore e inventoryStore al recargar** (sólo gameStore persiste) → agregar persist a stationStore e inventoryStore, o inicializarlos desde el currentTicket al montar.
6. **El Gringo spawnó una vez a los 90s en el test** → confirmar que el cooldown de 90s funciona bien (en el test apareció porque el test duró >90s).
7. **Recomendación para próxima fase:** Implementar F3 (Splices con ultrasonido + horno + área selector) y F4 (Harness con tablero + prueba eléctrica BUZZ). Estas son las mecánicas más ricas del GDD y cerrarían el loop principal completo.

Artifacts produced:
- Código fuente (24 archivos nuevos en src/):
  - `src/game/types.ts`, `src/game/constants.ts`, `src/game/dragResolver.ts`
  - `src/game/store/{gameStore,inventoryStore,stationStore,eventStore}.ts`
  - `src/lib/{random,tickets,audio,i18n}.ts`
  - `src/components/providers/{DndProvider,ThemeProvider}.tsx`
  - `src/hooks/{use-game-loop,use-sound}.ts`
  - `src/components/game/GameApp.tsx`
  - `src/components/game/screens/{TitleScreen,HowToPlay,GameScreen,GameOverScreen,PausedScreen}.tsx`
  - `src/components/game/layout/{TopBar,InventoryPanel,WorkArea,TicketPanel,WipTray,BottomBar,GameFooter}.tsx`
  - `src/components/game/stations/CutStation.tsx`
  - `src/components/game/inventory/{DraggableCable,DraggableTerminal,DraggablePowerup,DraggablePreview}.tsx`
  - `src/components/game/characters/CharacterLayer.tsx`
  - `src/components/game/effects/EffectsLayer.tsx`
  - `src/components/game/hud/{Timer,ScoreBoard,ComboIndicator,SubtitleBar}.tsx`
- Modificaciones: `src/app/{layout,page,globals.css}.tsx`
- Screenshots: `/home/z/my-project/download/{title-screen,game-screen-initial,game-screen-gameplay}.png`

Next agent should:
1. Leer este worklog y los docs en `/home/z/my-project/docs/` para contexto.
2. Decidir entre (a) implementar F3 (Splices), (b) implementar F4 (Harness + prueba eléctrica), (c) implementar F5 (Almacén + power-ups café/taco delivery), (d) implementar mini-juegos de Mantenimiento y Calidad, o (e) pulir F1/F2 con más detalles de styling.
3. Verificar siempre con agent-browser después de implementar.
4. Mantener `bun run lint` limpio.
5. Anexar nuevo Task ID al final de este worklog.
