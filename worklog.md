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
