# 03 — Roadmap de Desarrollo
## Los Makileros: Sobreviviendo al Piso

> Documento vivo. Se actualiza conforme avanza el proyecto.
> Principio: **entregar valor jugable en cada fase**, no acumular todo para el final.

---

## Visión General de Fases

| Fase | Nombre | Duración est. | Entregable jugable |
|---|---|---|---|
| **F0** | Setup y Andamiaje | 1 sesión | App compila, DndProvider + Theme + Toaster listos |
| **F1** | MVP — Corte Básico | 1-2 sesiones | Jugable: cortar, timer, score, game over |
| **F2** | Personajes y Caos | 1-2 sesiones | Supervisor + Mantenimiento + Gringo + Chisme |
| **F3** | Splices y Prensas | 1 sesión | Estación 2 completa |
| **F4** | Harness y Prueba Eléctrica | 1 sesión | Estación 3 + clímax |
| **F5** | Power-ups y Almacén | 1 sesión | Café, Taco, Almacén con estrés |
| **F6** | Calidad y Auditores | 1 sesión | Quick Audit + No Conformidad |
| **F7** | Pulido, Audio, Responsive | 1 sesión | SFX completo, mobile, accesibilidad |
| **F8** | Ranking Online (opcional) | 1 sesión | Prisma + API + leaderboard |

**Total:** 7-10 sesiones de trabajo para contenido completo.

---

## Fase 0 — Setup y Andamiaje ⏱️ 1 sesión

### Objetivo
Tener el esqueleto técnico listo: providers, stores vacíos pero tipados, routing interno funcionando.

### Tareas
- [ ] F0.1 Crear `src/game/types.ts` con todos los tipos del dominio
- [ ] F0.2 Crear `src/game/constants.ts` con config inicial (scores, probabilidades placeholders)
- [ ] F0.3 Crear carpeta `src/components/game/` con `GameApp.tsx` switch de pantallas
- [ ] F0.4 Implementar `src/components/providers/DndProvider.tsx` con sensors pointer+touch+keyboard
- [ ] F0.5 Implementar `ThemeProvider` con next-themes (light/dark)
- [ ] F0.6 Reemplazar `src/app/page.tsx` con `<GameApp/>` montado
- [ ] F0.7 Actualizar `layout.tsx`: metadata en español, lang="es", título "Los Makileros"
- [ ] F0.8 Crear stores vacíos pero tipados (`gameStore`, `inventoryStore`, `stationStore`, `eventStore`) con persist middleware
- [ ] F0.9 Crear `GameApp` con switch case vacío (sólo TitleScreen placeholder)
- [ ] F0.10 Crear `TitleScreen.tsx` placeholder con botón JUGAR (cambia screen a 'playing')
- [ ] F0.11 Verificar `bun run lint` sin errores
- [ ] F0.12 Verificar `bun run dev` y que la página cargue sin errores de consola (ver dev.log)

### Criterios de Aceptación
- ✅ Al abrir `/`, aparece un TitleScreen con botón JUGAR
- ✅ Al hacer clic, cambia a pantalla "playing" (aún vacía)
- ✅ Sin errores en consola
- ✅ `bun run lint` pasa

---

## Fase 1 — MVP: Área de Corte Básico ⏱️ 1-2 sesiones

### Objetivo
Tener el **loop central jugable**: cortar cables, ganar tiempo, perder tiempo, game over.

### Tareas
- [ ] F1.1 Implementar `useGameLoop` con requestAnimationFrame y tick decremental
- [ ] F1.2 Implementar `gameStore` completo con timer, score, combo, highscore persistido
- [ ] F1.3 Implementar `inventoryStore` con cables, terminales, wip
- [ ] F1.4 Implementar `lib/tickets.ts` generador procedural (10 part-numbers iniciales)
- [ ] F1.5 Implementar `lib/audio.ts` AudioManager + hook `useSound`
- [ ] F1.6 SFX mínimos: `click-ok.mp3`, `cut-slice.mp3`, `buzz-fail.mp3`, `game-over.mp3` (generar o sintetizar)
- [ ] F1.7 Layout de `GameScreen`: TopBar (timer + score + combo), InventoryPanel, WorkArea, TicketPanel, BottomBar
- [ ] F1.8 Implementar `DraggableCable` (sprite de carrete, coloreado)
- [ ] F1.9 Implementar `DraggableTerminal`
- [ ] F1.10 Implementar `CutStation` con drop zones: blade, termA slot, termB slot, WIP charola
- [ ] F1.11 Implementar `dragResolver` para casos `cable->blade`, `terminal->termA/B`, `cable->wip`
- [ ] F1.12 Lógica: cortar cable correcto = +50 pts +3s, cable incorrecto = -80 pts -5s
- [ ] F1.13 Implementar sistema de combos x3 con Modo Rápido (visual + bonus x2 score)
- [ ] F1.14 Implementar `TicketPanel` con Programa Garnet estilizado (mono, amber bg)
- [ ] F1.15 Implementar botón "REPORTAR TERMINADO" → si corte OK, +10s bonus + siguiente ticket
- [ ] F1.16 Implementar `GameOverScreen` con score final, highscore, botón "JUGAR DE NUEVO"
- [ ] F1.17 Lógica de Game Over: timer=0 → screen='gameover'
- [ ] F1.18 Footer sticky con créditos y link a ajustes
- [ ] F1.19 Verificar con `agent-browser`: cortar funciona, timer decrementa, score sube, game over aparece
- [ ] F1.20 Verificar responsive: en móvil se ve usable

### Criterios de Aceptación
- ✅ Puedo arrastrar un cable al blade y ver el corte
- ✅ El timer baja con el tiempo
- ✅ Al cortar bien, sube score y sube timer (+3s)
- ✅ Al cortar mal, baja timer (-5s)
- ✅ Combo x3 activa Modo Rápido visualmente
- ✅ Game Over aparece cuando timer=0
- ✅ Highscore se guarda (recargar → sigue)
- ✅ No errores en dev.log

---

## Fase 2 — Personajes y Caos ⏱️ 1-2 sesiones

### Objetivo
Agregar el humor y la tensión: Supervisor, Mantenimiento, Gringo, Chisme.

### Tareas
- [ ] F2.1 Implementar `eventStore` con spawnEvent/resolveEvent
- [ ] F2.2 Hook `useGameEvents` con interval 5s, tabla de probabilidades escalonada por tiempo
- [ ] F2.3 SFX: `siren-alarm.mp3`, `whisper-loop.mp3`, `combo-chime.mp3`
- [ ] F2.4 Implementar `Supervisor` character:
  - Aparece en borde superior izq
  - Nivel 1: warning toast + frase
  - Nivel 2: rojo, -10s, shake ligero
  - Triggers: material viejo sin cambiar, 2 errores seguidos, 45s sin reportar
- [ ] F2.5 Implementar `Maintenance` character + minijuego:
  - Modal bloqueante 5s
  - 3 herramientas arrastrables a contornos correctos
  - Éxito: máquina reparada; fallo: -15s
- [ ] F2.6 Implementar `Gringo` character:
  - Aparece cada 90s (Normal) o 45s (Caos) o 3 fallos seguidos
  - ScreenShake + FlyingPapers (framer-motion)
  - Timer reset a 15s
  - Sirena audio + 4 frases espanglish subtítulos
- [ ] F2.7 Implementar `GossipPeer`:
  - Compañero con nube 💭 cada 60-90s
  - Click: -3s + Boost Moral 10s (velocidad x1.2)
  - Ignorar: 50% tape pantalla 5s
- [ ] F2.8 Implementar `Boost Moral` glifo en HUD
- [ ] F2.9 Implementar `ScreenShake` effect (framer-motion keyframes)
- [ ] F2.10 Implementar `FlyingPapers` effect (5 papeles aleatorios lanzados)
- [ ] F2.11 Verificar con agent-browser: Gringo aparece a los 90s, supervisor aparece con error

### Criterios de Aceptación
- ✅ El Supervisor aparece con 2 errores seguidos y grita
- ✅ El Gringo tiembla la pantalla y reinicia el timer a 15s
- ✅ El Chisme da Boost Moral al clickearlo
- ✅ Mantenimiento aparece cuando seleccionas mal área (Fase 3 lo triggerea)
- ✅ Frases del Gringo subtítuladas en pantalla

---

## Fase 3 — Splices y Prensas ⏱️ 1 sesión

### Objetivo
Estación 2 completa con ultrasonido + horno + prensas.

### Tareas
- [ ] F3.1 Implementar `SpliceStation` con slots: cableA, cableB, área selector, heat shrink, banda/horno
- [ ] F3.2 Lógica: arrastrar 2 cables a la máquina
- [ ] F3.3 Implementar selector de Área (botones 1.0-5.0)
- [ ] F3.4 Validación: si área incorrecta → trigger Maintenance
- [ ] F3.5 Implementar `DraggableTube` (heat shrink)
- [ ] F3.6 Implementar banda transportadora visual (framer-motion loop)
- [ ] F3.7 Lógica: ensamble sin tube → horno lo funde (visual derretido)
- [ ] F3.8 Recoger ensamble al final de la banda (si no, cae al basurero)
- [ ] F3.9 Implementar `PressStation`:
  - Aplicador slot
  - Escáner Tool ID (arrastrar scanner sobre barcode)
  - Cable + terminal slots
  - Botón rojo PRENSAR
- [ ] F3.10 SFX: `ultrasonic-hum.mp3`, `press-thunk.mp3`, `oven-whoosh.mp3`
- [ ] F3.11 Verificar con agent-browser: splice completo funciona, prensa validada

---

## Fase 4 — Harness y Prueba Eléctrica ⏱️ 1 sesión

### Objetivo
El clímax: ensamble + prueba eléctrica con BUZZ.

### Tareas
- [ ] F4.1 Implementar `HarnessStation` con tablero de conectores
- [ ] F4.2 Implementar `DraggableSplice` y `DraggableCircuit` (ya cortado)
- [ ] F4.3 Lógica: arrastrar al conector correcto, validación visual
- [ ] F4.4 Implementar `Máquina de Prueba Eléctrica` + botón rojo gigante TEST
- [ ] F4.5 Lógica: validar todos los `harnessCircuit.correct`
- [ ] F4.6 Éxito: luces verdes + chicharra + +200 pts +10s
- [ ] F4.7 Fallo: BUZZ + luces rojas parpadeantes + -15s + arrastrar de vuelta
- [ ] F4.8 Implementar `BuzzAlarm` effect overlay
- [ ] F4.9 Verificar con agent-browser

---

## Fase 5 — Power-ups y Almacén ⏱️ 1 sesión

### Objetivo
Logística del caos + café/taco.

### Tareas
- [ ] F5.1 Implementar botón ALMACÉN con `Sheet` deslizable
- [ ] F5.2 Implementar `WarehouseCart` con lista de items + drag al carrito + Enviar Pedido
- [ ] F5.3 Implementar barra de progreso de pedido (10-25s)
- [ ] F5.4 Modificador "apurado": si inventario vacío, barra x2 + 30% error
- [ ] F5.5 Implementar "No hay X" → Tag de Salto arrastrable al harness
- [ ] F5.6 Implementar `Cafecito` (10% pedidos): congela timer 5s + glow
- [ ] F5.7 Implementar `Taco de Canasta` (5% pedidos): inmunidad Supervisor 1 ticket
- [ ] F5.8 SFX: `coffee-glug.mp3`, `taco-bite.mp3`
- [ ] F5.9 Bonus de Ahorro de Setup automático
- [ ] F5.10 Verificar con agent-browser

---

## Fase 6 — Calidad y Auditores ⏱️ 1 sesión

### Objetivo
El de Calidad y No Conformidades.

### Tareas
- [ ] F6.1 Implementar `QualityAuditor` character
- [ ] F6.2 Trigger: cada 2-3 tickets completos
- [ ] F6.3 Modal bloqueante con 3 circuitos visuales
- [ ] F6.4 Identificar el erróneo (uno tiene detalle visual)
- [ ] F6.5 Arrastrar a basura → si correcto: "Conforme" +50 pts; si no: "No Conformidad" -50% bonus calidad
- [ ] F6.6 Verificar con agent-browser

---

## Fase 7 — Pulido, Audio, Responsive ⏱️ 1 sesión

### Objetivo
Experiencia completa y profesional.

### Tareas
- [ ] F7.1 Pantalla "How To Play" con 4 slides animadas (framer-motion)
- [ ] F7.2 Música de fondo toggleable (loop suave fábrica)
- [ ] F7.3 Ajustes: volumen, música, tema, dificultad (en Dialog)
- [ ] F7.4 Modo Caótico y Modo Libre en TitleScreen
- [ ] F7.5 Responsive completo: mobile usa layout vertical + fallback botones
- [ ] F7.6 Accesibilidad: `prefers-reduced-motion`, ARIA labels, focus visible
- [ ] F7.7 Subtítulos de todos los sonidos del Gringo
- [ ] F7.8 Reduce-motion: animes → crossfades
- [ ] F7.9 Verificar mobile con agent-browser (DevTools toggle device)
- [ ] F7.10 Optimización: React.memo en items, virtualization si >12 wip
- [ ] F7.11 Easter egg: clic 5x en logo → modo debug

---

## Fase 8 — Ranking Online (opcional) ⏱️ 1 sesión

### Objetivo
Competencia asíncrona con leaderboard.

### Tareas
- [ ] F8.1 Prisma schema: `Score` + `SessionLog`
- [ ] F8.2 `bun run db:push`
- [ ] F8.3 API route `POST /api/scores`
- [ ] F8.4 API route `GET /api/scores?mode=normal&limit=10`
- [ ] F8.5 GameOverScreen: input 3-letter initials + submit al ranking
- [ ] F8.6 Leaderboard modal: top 10 + posición del jugador
- [ ] F8.7 Verificar con agent-browser

---

## Backlog / Ideas Futuras (no comprometidas)

- Skins de personajes (Makilero novato, veterano, etc.)
- Logros diarios ("Cortaste 100 cables sin error")
- Eventos de temporada (Día del Taco = power-ups x2)
- Modo historia (5 días, cada día se rompe algo nuevo)
- Multiplayer asíncrono real (sockets)
- Generación dinámica de sprites con image-generation skill
- Modo espectador / replay

---

## Sistema de Tareas para Subagentes

Cada fase se puede delegar parcialmente a subagentes. Ejemplo:

| Subagent Task ID | Subtarea | Subagent tipo |
|---|---|---|
| 1-a | Crear stores y tipos (F0) | general-purpose |
| 1-b | Crear layout base y providers (F0) | general-purpose |
| 2-a | Implementar gameStore + gameLoop (F1) | general-purpose |
| 2-b | Crear assets SFX (F1) | image-generation + bash |
| 2-c | Implementar CutStation + dragResolver (F1) | general-purpose |
| 3-a | Implementar personajes (F2) | general-purpose |
| 3-b | Implementar efectos (shake, papers, buzz) | frontend-styling-expert |

---

## Estado Actual del Roadmap

```
✅ F0: Pendiente iniciar
⬜ F1-F8: No iniciadas
```

Próximo paso: **iniciar F0** tras confirmar con el usuario el plan y la documentación.
