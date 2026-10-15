# 🏭 Los Makileros: Sobreviviendo al Piso

> Arcade web game de manufactura con drag & drop, gestión de tiempo, combos, eventos caóticos y humor. ¡Sobrevive al turno en la planta antes de que El Gringo te corra!

## 🎮 Juego

**Los Makileros** es una parodia arcade del trabajo en una planta de manufactura de arneses eléctricos (maquiladora). El jugador asume el rol de un operador que debe completar tickets de trabajo antes de que el cronómetro llegue a cero.

### Características principales

- **4 estaciones de trabajo**: Corte ✂️, Splices 🔌, Prensas 🔧, Harness 🧵
- **Drag & Drop** como mecánica principal (@dnd-kit)
- **Sistema de tiempo** con bonus por aciertos (+3s) y penalización por errores (-5s)
- **Combos x3** → Modo Rápido (score x2 por 15s)
- **9 variantes de tickets**: standard, rush, bulk, splice-heavy, no-terminal, long-roll, taco-day, client-visit, heavy-day
- **5 eventos especiales**: Cliente Visitante, Supervisor Rampage, Día del Taco, Cortocircuito, Visita del CEO
- **29 logros** con notificaciones animadas y panel modal
- **Daily Challenge**: ticket único diario con bonus x2-x3 y racha de días
- **Ranking Online** con Prisma SQLite + API routes
- **Stats Dashboard** con gráficas recharts
- **3 Easter Eggs**: Konami code (TURBO MODE x3), Modo Debug (5 clics en título), Modo Arcoíris (10 clics en footer)
- **Tutorial interactivo** con spotlight visual (10 pasos)
- **Asistente** que da tips en los primeros niveles
- **Música dinámica** de 5 moods (normal/intense/happy/tense/victory)
- **15+ SFX** sintetizados con Web Audio API
- **Personajes SVG diseñados**: El Gringo, Supervisor, Compañero Chismoso, Cliente Visitante, Vendedora de Dulces, Asistente

### Personajes

| Personaje | Descripción |
|---|---|
| 👔 **El Gringo Enojado** | Ejecutivo enojado con traje azul, caja de donas, entra desde la derecha. Reinicia el timer a 15s cada 90s. |
| 👷 **Supervisor de Producción** | Hombre con casco amarillo, overol azul, bigote. Avisa de errores o se enoja (-10s). |
| 🗣️ **Compañero Chismoso** | Joven con gorra morada, café en mano. Da Boost de Moral pero distrae 3s. |
| 👓 **Cliente Visitante** | Profesional con gafas, portafolio VIP. Score x2 mientras observa. |
| 🍬 **Vendedora de Dulces** | Señora con delantal, canasta de dulces. Power-ups garantizados. |
| 🤝 **Asistente** | Joven con playera verde, tablet. Da tips en los primeros niveles. |

## 🛠️ Stack Técnico

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York)
- **Drag & Drop**: @dnd-kit/core + sortable + utilities
- **Animaciones**: Framer Motion v12
- **Estado**: Zustand v5 (4 stores + persist)
- **Gráficas**: Recharts v2
- **Base de datos**: Prisma ORM (SQLite)
- **Audio**: Web Audio API (SFX sintetizados en runtime)
- **Icons**: Lucide React

## 🚀 Cómo ejecutar

```bash
# Instalar dependencias
bun install

# Push de la base de datos
bun run db:push

# Iniciar servidor de desarrollo
bun run dev

# Verificar código
bun run lint
```

El juego estará en `http://localhost:3000`.

## 📁 Estructura del proyecto

```
src/
├── app/                    # Rutas (solo / es visible)
│   ├── api/
│   │   ├── scores/         # GET/POST leaderboard
│   │   └── sessions/       # GET/POST session logs
│   ├── layout.tsx
│   ├── page.tsx            # Carga dinámica de GameApp
│   └── globals.css
├── components/
│   └── game/
│       ├── characters/     # Personajes SVG + modales
│       ├── effects/        # Efectos visuales
│       ├── hud/            # Timer, Score, Combo
│       ├── inventory/      # Draggables (cable, terminal, tube, powerup)
│       ├── layout/         # TopBar, BottomBar, modals
│       ├── screens/        # Title, HowTo, Game, GameOver, Tutorial
│       └── stations/      # Cut, Splice, Press, Harness
├── game/
│   ├── constants.ts        # Config, frases, probabilidades
│   ├── dragResolver.ts     # Lógica central de drag & drop
│   ├── store/              # 6 stores Zustand
│   └── types.ts            # Tipos del dominio
├── hooks/                  # Game loop, Konami, shortcuts
└── lib/                    # Audio, i18n, tickets, random, db
```

## 🎯 Cómo jugar

1. Lee el **Programa Garnet** (panel derecho) para ver el color, gauge y longitud del cable
2. Arrastra el **carrete de cable** correcto desde el inventario a la cuchilla
3. Arrastra los **terminales** correctos a los lados A y B
4. Presiona **CORTAR** → si es correcto: +50 pts, +3s, combo sube
5. Presiona **REPORTAR TERMINADO** → +10s bonus + score base
6. Repite hasta que el timer llegue a 0

### Atajos de teclado
- `1-4`: Cambiar entre estaciones
- `P`: Pausar/reanudar
- `Esc`: Volver al menú desde How To Play

## 📜 Licencia

Proyecto de demostración. Uso educativo.
