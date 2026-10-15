# 00 — Análisis de Viabilidad Técnica

> **Proyecto:** Los Makileros: Sobreviviendo al Piso
> **Tipo:** Web App Arcade / Simulación de Trabajo / Gestión de Tiempo
> **Fecha:** 2025
> **Veredicto:** ✅ **VIABLE 100% como Web App con el stack actual**

---

## 1. Resumen Ejecutivo

El juego planteado — un arcade de manufactura con **drag & drop** como mecánica central, gestión de tiempo, combos, eventos aleatorios y humor — es **totalmente realizable como Web App** con el stack ya instalado en el proyecto. No se requiere ningún paquete adicional externo al ecosistema permitido. La arquitectura cliente-first con persistencia opcional en SQLite (Prisma) cubre todos los casos de uso: ranking local, guardado de partida, ajustes de usuario y auditoría de sesiones.

**Conclusión clave:** todas las mecánicas del documento del usuario (corte, splices, prensas, ensamble, supervisor, mantenimiento, gringo, chisme, power-ups, almacén, calidad) se pueden modelar con **componentes React + estado Zustand + @dnd-kit + Web Audio API nativa**.

---

## 2. Matriz de Requisitos vs. Stack Disponible

| # | Requisito del juego | Tecnología a usar | ¿Disponible? | Notas |
|---|---|---|---|---|
| 1 | Drag & Drop (arrastrar carrete/terminal/cable) | `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` | ✅ Sí (ya instalado v6.3 + v10.0) | API moderna, soporte touch/pointer, drag overlays, droppables por zona |
| 2 | Estado global del juego (timer, score, ticket, inventario) | `zustand` v5.0.6 | ✅ Sí | Store único inmutable con slices; ideal para juegos arcade |
| 3 | Animaciones (cable sale de la cuchilla, gringo tiembla, banda transportadora) | `framer-motion` v12.23 | ✅ Sí | Layout animations, AnimatePresence, gestures, keyframes |
| 4 | Sistema de UI (botones, modales, toasts, dialogs) | shadcn/ui (ya instalado completo, estilo New York) | ✅ Sí | 50+ componentes listos, accesibles |
| 5 | Iconografía (cable, terminal, prensa, horno, taco, café) | `lucide-react` v0.525 | ✅ Sí | 1500+ íconos SVG |
| 6 | Notificaciones ("¡BUZZ!", "No Conformidad", "Combo x3") | `sonner` v2.0.6 + `@radix-ui/react-toast` | ✅ Sí | Sonner para toasts modernos, Toaster ya en layout |
| 7 | Tema claro/oscuro (modo día/noche en planta) | `next-themes` v0.4.6 | ✅ Sí | Ya configurado en globals.css con `.dark` |
| 8 | Sonidos de fábrica, BUZZ, sirena, click, chisme | Web Audio API nativa del navegador | ✅ Sí | Sin paquetes extra; archivos .mp3/.wav en `/public/sfx` |
| 9 | Persistencia local (high score, ajustes, progreso) | `localStorage` + Prisma SQLite opcional | ✅ Sí | localStorage para arcade client-side; Prisma para ranking global y sesiones |
| 10 | Estadísticas y progreso (gráficas de desempeño) | `recharts` v2.15 | ✅ Sí | Líneas, barras, radar de áreas |
| 11 | Generación procedural de tickets | Lógica TS pura + seeded random | ✅ Sí | No requiere backend |
| 12 | Eventos aleatorios (supervisor, chisme, calidad, gringo) | Sistema de eventos con probabilidad en Zustand | ✅ Sí | Custom hook `useGameEvents` |
| 13 | Mini-juegos (reparación de mantenimiento, quick audit) | Componentes modal + `framer-motion` + click handlers | ✅ Sí | Sin dependencias extra |
| 14 | Tipado estricto de entidades (cable, terminal, ticket) | TypeScript 5 | ✅ Sí | Enums y tipos centralizados |
| 15 | Tipografías mono para los tickets/programa Garnet | `Geist_Mono` ya en layout | ✅ Sí | Ideal para look "industrial" |
| 16 | Multi-idioma (espanglish del Gringo, UI español) | Diccionarios TS + `next-intl` (opcional) | ✅ Sí | Empezamos con diccionario simple en `lib/i18n.ts` |
| 17 | Generación de imágenes (portada, íconos de personajes) | `z-ai-web-dev-sdk` (image-generation skill) | ✅ Sí | Para assets visuales en `/public` |
| 18 | Multiplayer asíncrono / ranking online (futuro) | API routes Next.js + Prisma | ✅ Sí | No bloquea el MVP |

---

## 3. Riesgos Técnicos y Mitigaciones

### 3.1 Riesgo: Rendimiento con muchos elementos arrastrables simultáneos
- **Probabilidad:** Media
- **Impacto:** Stutter al arrastrar si hay 50+ elementos DOM arrastrables activos
- **Mitigación:**
  - `@dnd-kit` con virtualización (sólo renderizar items visibles)
  - Usar `useDraggable` con `transform: CSS.Transform.toString()` (GPU)
  - Limitar a 8–12 items arrastrables activos por estación
  - Memorizar con `React.memo` los items de inventario

### 3.2 Riesgo: Conflicto entre drag en desktop (mouse) y mobile (touch)
- **Probabilidad:** Alta sin mitigación
- **Impacto:** En móviles el drag puede interferir con scroll del navegador
- **Mitigación:**
  - `@dnd-kit` maneja nativamente pointer events (unified mouse/touch/pen)
  - Usar `TouchSensor` con `activationConstraint: { delay: 200ms, tolerance: 8px }` para diferenciar tap de drag
  - En móvil, layout alternativo con botones de "mover a…" como fallback

### 3.3 Riesgo: Áudio bloqueado por autoplay policy del navegador
- **Probabilidad:** Alta (política estándar en Chrome/Safari/Firefox)
- **Impacto:** Sonidos no reproducen hasta que el usuario interactúa
- **Mitigación:**
  - Pantalla de "Start" / botón "JUGAR" que inicializa el `AudioContext` en el primer gesto
  - Resume el contexto si está suspendido: `if (ctx.state === 'suspended') ctx.resume()`

### 3.4 Riesgo: Compatibilidad con `next-themes` en SPA de juego
- **Probabilidad:** Baja
- **Impacto:** Hydration mismatch si el tema se aplica antes del mount
- **Mitigación:** `suppressHydrationWarning` ya está en `<html>` del layout actual. ✓

### 3.5 Riesgo: Estado del juego se pierde al recargar
- **Probabilidad:** Alta sin mitigación
- **Impacto:** Frustración del jugador si recarga a mitad de ticket
- **Mitigación:**
  - `zustand/middleware persist` → localStorage para estado de partida
  - Auto-save cada 5s y al terminar cada ticket
  - Modal "Continuar partida" al cargar

### 3.6 Riesgo: Progresión de dificultad demasiado brusca
- **Probabilidad:** Media
- **Impacto:** Jugador nuevo se frustra o experto se aburre
- **Mitigación:**
  - Curva de dificultad documentada en GDD § 9
  - Modos "Normal", "Caótico" y "Libre" desde el inicio

---

## 4. Plataformas y Compatibilidad

### 4.1 Navegadores soportados (objetivo)
| Navegador | Versión mínima | Soporte Drag&Drop | Soporte WebAudio |
|---|---|---|---|
| Chrome / Edge | 120+ | ✅ | ✅ |
| Firefox | 121+ | ✅ | ✅ |
| Safari | 17+ | ✅ | ✅ |
| Safari iOS | 17+ | ✅ (touch) | ✅ (con user gesture) |
| Chrome Android | 120+ | ✅ (touch) | ✅ |

### 4.2 Resoluciones objetivo
- **Desktop:** 1280×800 hasta 1920×1080 (experiencia óptima)
- **Tablet horizontal:** 1024×768 (mini-mapa de áreas)
- **Mobile grande:** 414×896 (layout compacto, fallback de botones)

### 4.3 Modos de juego previstos
- **Normal** — dificultades balanceadas, gringo cada 90s
- **Caótico** — gringo cada 45s, doble frecuencia de eventos
- **Libre (Sandbox)** — sin timer, para aprender mecánicas

---

## 5. Restricciones del Sandbox (a respetar)

Dado que el proyecto vive en un sandbox con las siguientes restricciones, el juego se diseña respetándolas:

| Restricción del sandbox | Cómo la respeta el juego |
|---|---|
| Sólo el usuario ve `/` | Toda la experiencia ocurre en la ruta única `/` con vistas internas |
| Puerto 3000 único | No se levantan mini-servicios extra en el MVP; todo es client-side o API routes |
| `XTransformPort` sólo si hay WS | MVP no requiere WebSocket; ranking es polling simple cada 30s (opcional Fase 3) |
| `bun run build` prohibido | Desarrollo con `bun run dev` (hot reload) |
| Imágenes: generadas con skill | `image-generation` para portada, íconos de personajes, banner |

---

## 6. ¿Por qué NO se necesita nada fuera del stack?

El usuario pidió parodiar manufactura con drag & drop. Las alternativas "tentadoras" que **descartamos deliberadamente**:

| Alternativa externa | Por qué NO la usamos | Equivalente en stack |
|---|---|---|
| PixiJS / Phaser | Pesadas, rompen SPA Next.js, curva alta | `@dnd-kit` + `framer-motion` cubren el 100% de interacciones arcade |
| Howler.js (audio) | Bien, pero innecesario | Web Audio API nativa + `<audio>` |
| MobX / Redux | Verbosos para un juego arcade | `zustand` (más simple, hooks-first) |
| react-dnd | API vieja, no soporta bien touch | `@dnd-kit` (moderna, pointer-first) |
| Three.js | 3D no aporta al humor arcade 2D | Framer Motion + CSS 3D transforms |

---

## 7. Veredicto Final

**✅ El proyecto se puede y se debe hacer como Web App.**

- Stack disponible cubre el 100% de requisitos del GDD
- No requiere paquetes externos al permitido
- Rendimiento suficiente para arcade 2D
- Soporta desktop y mobile (con adaptaciones)
- Persistencia local + opcional ranking online
- Audio nativo soluciona todos los efectos

**Recomendación:** proceder a la implementación siguiendo el Roadmap (§ `03-ROADMAP.md`) empezando por el MVP: **Área de Corte + Timer + Inventario básico + Supervisor**.
