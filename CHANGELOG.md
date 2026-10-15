# Changelog

Todos los cambios notables del proyecto "Los Makileros: Sobreviviendo al Piso".

## [Unreleased]

### Added — Rediseño de personajes y mejoras UX
- **Personajes SVG diseñados**: El Gringo (ejecutivo con traje azul, donas, entra desde la derecha), Supervisor (casco amarillo, overol, bigote), Compañero Chismoso (gorra morada, café), Cliente Visitante (gafas, portafolio VIP), Vendedora de Dulces (delantal, canasta), Asistente (playera verde, tablet)
- **El Gringo entra por un lado**: animación de entrada desde la derecha con spring animation, no solo emoji
- **Asistente que ayuda en primeros niveles**: personaje SVG que aparece dando tips contextuales (inicio, primer ticket, primer error, tiempo bajo, primer combo, primer almacén)
- **Más tiempo al inicio**: 120s → 150s para dar más respiro al jugador nuevo
- **Documentación completa**: README.md, CHANGELOG.md

## [1.0.0] — Versiones anteriores (F0-F10)

### Added — Sistema base completo
- **F0**: Andamiaje técnico (tipos, constants, 4 stores Zustand, providers, hooks, audio, i18n)
- **F1**: MVP jugable de Área de Corte con drag & drop, timer, scoring, combos, Game Over, How To Play
- **F2**: Eventos aleatorios (Supervisor warn/angry, Gringo, Chisme) con styling
- **F3**: SpliceStation con ultrasonido, banda transportadora, horno, selector de área
- **F4**: HarnessStation con tablero de conectores + prueba eléctrica BUZZ
- **F5**: Almacén con carrito, delivery time, modo apurado, power-ups (café/taco)
- **F6**: Mini-juego de Mantenimiento modal (3 herramientas, countdown 8s)
- **F6.2**: Quick Audit de Calidad modal (3 circuitos, identificar defectuoso)
- **F3.2**: PressStation completa (aplicador + escáner Tool ID + cable + terminal + PRENSAR)
- **F8**: Ranking Online con Prisma SQLite + API routes + LeaderboardModal + auto-log sessions
- **Performance Tier** (6 niveles: NOVATO→LEYENDA) con mensajes humorísticos
- **Easter egg Modo Debug** (5 clics en título)
- **Variantes de tickets** (9 tipos: standard, rush, bulk, splice-heavy, no-terminal, long-roll, taco-day, client-visit, heavy-day)
- **Settings modal funcional** (volumen, música, tema claro/oscuro, reduce motion)
- **Share Modal** (Twitter, WhatsApp, Copy al portapapeles)
- **Modo Caótico balanceado** (Gringo 60s, velocidad 1.2x)
- **Sistema de Achievements** (29 logros en 10 categorías)
- **Konami code easter egg** (TURBO MODE x3 score)
- **Daily Challenge** (ticket único diario determinístico, bonus x2-x3, racha de días)
- **Stats Dashboard** con recharts (LineChart, PieChart, BarChart + KPIs + 9 stats acumuladas)
- **Achievement notification queue** (hasta 3 simultáneas)
- **Cliente Visitante visible para variant client-visit** (persistente con "Cliente observando")
- **Interactive Tutorial con spotlight radial** (10 pasos, CSS radial-gradient hole + arrow 👉)
- **Música dinámica de 5 moods** (normal/intense/happy/tense/victory)
- **Keyboard Shortcuts** (1-4 estaciones, P pausa, Esc back)
- **5 Special Events**: Cliente Visitante (score x2 60s), Supervisor Rampage (angry cada 20s 45s), Día del Taco (taco x ticket 45s), Cortocircuito (timer congelado 10s), Visita del CEO (score x3 60s)
- **Easter egg Modo Arcoíris** (10 clics en footer → rainbow shimmer)
- **Música victory mood** (arpeggio C major ascendente al completar ticket)
- **Timer con glow effects** (boxShadow dinámico según urgencia + border amber + Clock pulse + ❄ badge)
- **ScoreBoard con delta flotante animado** (+N emerald / -N red)
- **TitleScreen con 8 partículas flotantes** (Scissors, Cable, Hammer, Wrench, Factory, Cog, FlaskConical, Boxes)
- **15+ SFX sintetizados** con Web Audio API (click-ok, cut-slice, buzz-fail, siren-alarm, ultrasonic-hum, press-thunk, oven-whoosh, combo-chime, game-over, whisper-loop, coffee-glug, taco-bite, ticket-done, gringo-yell, supervisor-angry)
- **Frases expandidas**: Gringo 16, Supervisor warn 11, Supervisor angry 9, Chisme 15, Cliente 8, Taco Day 4, Short Circuit 4, CEO 4, Supervisor Rampage 5
