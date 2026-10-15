// src/components/game/characters/CharacterSVGs.tsx
// Personajes diseñados como SVG vectorial para "Los Makileros"
// Cada personaje es un componente reutilizable con estilo cartoon industrial

'use client'

import React from 'react'

// === EL GRINGO ENOJADO ===
// Ejecutivo enojado con traje, corbata roja, caja de donas, entra desde la derecha
export function GringoCharacter({ size = 120 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 120 168"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sombra */}
      <ellipse cx="60" cy="162" rx="35" ry="6" fill="rgba(0,0,0,0.3)" />

      {/* Cuerpo - traje azul oscuro */}
      <rect x="30" y="70" width="60" height="80" rx="8" fill="#1e3a5f" />
      {/* Solapa del traje */}
      <path d="M30 70 L45 75 L45 130 L30 130 Z" fill="#152d4a" />
      <path d="M90 70 L75 75 L75 130 L90 130 Z" fill="#152d4a" />
      {/* Camisa blanca */}
      <path d="M48 70 L72 70 L72 100 L48 100 Z" fill="#f8fafc" />
      {/* Corbata roja */}
      <path d="M57 70 L63 70 L65 78 L60 85 L55 78 Z" fill="#dc2626" />
      <path d="M55 78 L60 85 L58 100 L62 100 L65 85 Z" fill="#b91c1c" />

      {/* Cabeza */}
      <circle cx="60" cy="45" r="28" fill="#fde68a" />
      {/* Pelo rubio engominado */}
      <path d="M32 38 Q35 18 60 16 Q85 18 88 38 L82 35 Q70 25 60 27 Q50 25 38 35 Z" fill="#fbbf24" />
      <path d="M35 30 Q40 15 55 18 L50 28 Q42 30 35 30 Z" fill="#f59e0b" />

      {/* Cejas enojadas (hacia abajo) */}
      <path d="M40 38 L52 42" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
      <path d="M80 38 L68 42" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />

      {/* Ojos enojados */}
      <ellipse cx="48" cy="46" rx="4" ry="3" fill="#1c1917" />
      <ellipse cx="72" cy="46" rx="4" ry="3" fill="#1c1917" />
      {/* Brillo en ojos */}
      <circle cx="49" cy="45" r="1" fill="#fff" />
      <circle cx="73" cy="45" r="1" fill="#fff" />

      {/* Nariz */}
      <path d="M58 50 Q60 55 62 50" stroke="#92400e" strokeWidth="2" fill="none" />

      {/* Boca enojada (hacia abajo) */}
      <path d="M48 60 Q60 54 72 60" stroke="#991b1b" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Dientes apretados */}
      <line x1="52" y1="59" x2="68" y2="59" stroke="#fff" strokeWidth="2" />

      {/* Mejillas rojas de enojo */}
      <circle cx="42" cy="54" r="5" fill="#f87171" opacity="0.6" />
      <circle cx="78" cy="54" r="5" fill="#f87171" opacity="0.6" />

      {/* Brazo derecho sosteniendo caja de donas */}
      <rect x="88" y="80" width="14" height="35" rx="6" fill="#1e3a5f" />
      {/* Caja de donas */}
      <rect x="82" y="95" width="28" height="22" rx="3" fill="#fde68a" stroke="#92400e" strokeWidth="2" />
      <circle cx="90" cy="106" r="5" fill="#f59e0b" stroke="#92400e" strokeWidth="1" />
      <circle cx="102" cy="106" r="5" fill="#dc2626" stroke="#92400e" strokeWidth="1" />
      {/* Rostro enojo en la caja */}
      <text x="96" y="109" fontSize="8" fill="#92400e" textAnchor="middle">DONUTS</text>

      {/* Brazo izquierdo con puño cerrado */}
      <rect x="18" y="80" width="14" height="30" rx="6" fill="#1e3a5f" />
      <circle cx="25" cy="112" r="8" fill="#fde68a" />

      {/* Piernas */}
      <rect x="35" y="148" width="20" height="18" rx="3" fill="#1e293b" />
      <rect x="65" y="148" width="20" height="18" rx="3" fill="#1e293b" />

      {/* Líneas de enojo saliendo de la cabeza */}
      <path d="M20 25 L28 30" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <path d="M92 25 L100 30" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <path d="M15 15 L25 22" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
      <path d="M95 15 L105 22" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// === EL SUPERVISOR ===
// Hombre con overol, casco, bigote, autoritario
export function SupervisorCharacter({ size = 100, angry = false }: { size?: number; angry?: boolean }) {
  const skinColor = angry ? '#fca5a5' : '#fde68a'
  const cheekColor = angry ? '#dc2626' : '#f87171'
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sombra */}
      <ellipse cx="50" cy="125" rx="30" ry="5" fill="rgba(0,0,0,0.3)" />

      {/* Cuerpo - overol azul */}
      <rect x="25" y="55" width="50" height="65" rx="6" fill="#1e40af" />
      {/* Overol tirantes */}
      <rect x="30" y="50" width="8" height="10" fill="#1e40af" />
      <rect x="62" y="50" width="8" height="10" fill="#1e40af" />
      {/* Bolsillo del overol */}
      <rect x="35" y="80" width="30" height="20" rx="3" fill="#1e3a8a" />
      {/* Camisa bajo el overol */}
      <path d="M38 50 L62 50 L62 60 L38 60 Z" fill="#e0f2fe" />

      {/* Cabeza */}
      <circle cx="50" cy="35" r="22" fill={skinColor} />

      {/* Casco de seguridad amarillo */}
      <path d="M25 28 Q25 12 50 10 Q75 12 75 28 L72 28 Q72 16 50 14 Q28 16 28 28 Z" fill="#facc15" />
      <rect x="25" y="26" width="50" height="4" rx="2" fill="#eab308" />

      {/* Bigote */}
      <path d="M40 42 Q45 46 50 44 Q55 46 60 42" stroke="#451a03" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* Cejas */}
      {angry ? (
        <>
          <path d="M36 30 L46 34" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
          <path d="M64 30 L54 34" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M38 32 L46 32" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
          <path d="M54 32 L62 32" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {/* Ojos */}
      <circle cx="42" cy="36" r="3" fill="#1c1917" />
      <circle cx="58" cy="36" r="3" fill="#1c1917" />

      {/* Boca */}
      {angry ? (
        <path d="M42 48 Q50 42 58 48" stroke="#991b1b" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M44 46 Q50 50 56 46" stroke="#451a03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}

      {/* Mejillas */}
      <circle cx="36" cy="42" r="4" fill={cheekColor} opacity="0.5" />
      <circle cx="64" cy="42" r="4" fill={cheekColor} opacity="0.5" />

      {/* Brazos */}
      <rect x="15" y="60" width="12" height="30" rx="5" fill="#1e40af" />
      <rect x="73" y="60" width="12" height="30" rx="5" fill="#1e40af" />
      {/* Manos */}
      <circle cx="21" cy="92" r="6" fill={skinColor} />
      <circle cx="79" cy="92" r="6" fill={skinColor} />

      {/* Clip en el casco */}
      <rect x="46" y="14" width="8" height="6" rx="1" fill="#92400e" />
    </svg>
  )
}

// === EL COMPAÑERO CHISMOSO ===
// Compañero relajado con gorra, sosteniendo un café, cara de conspirador
export function GossipCharacter({ size = 100 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="50" cy="125" rx="28" ry="4" fill="rgba(0,0,0,0.3)" />

      {/* Cuerpo - playera morada */}
      <rect x="25" y="55" width="50" height="65" rx="6" fill="#7c3aed" />

      {/* Cabeza */}
      <circle cx="50" cy="35" r="22" fill="#fde68a" />

      {/* Gorra hacia atrás */}
      <path d="M28 28 Q28 14 50 12 Q72 14 72 28 L68 28 Q68 18 50 16 Q32 18 32 28 Z" fill="#4338ca" />
      <path d="M72 24 Q78 26 76 30 L72 28 Z" fill="#312e81" />

      {/* Cejas levantadas (conspiración) */}
      <path d="M36 28 Q40 24 46 28" stroke="#1c1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M54 28 Q58 24 64 28" stroke="#1c1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Ojos con guiño (uno cerrado) */}
      <circle cx="42" cy="34" r="3" fill="#1c1917" />
      <path d="M54 34 Q58 32 62 34" stroke="#1c1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Boca sonriendo de lado (susurrando) */}
      <path d="M42 44 Q48 48 54 44 Q56 46 58 44" stroke="#1c1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Burbuja de susurro */}
      <circle cx="72" cy="30" r="8" fill="#fff" stroke="#7c3aed" strokeWidth="2" />
      <text x="72" y="34" fontSize="8" fill="#7c3aed" textAnchor="middle" fontWeight="bold">?</text>

      {/* Brazo con café */}
      <rect x="68" y="58" width="12" height="25" rx="5" fill="#7c3aed" />
      {/* Vaso de café */}
      <rect x="64" y="70" width="20" height="18" rx="2" fill="#f8fafc" stroke="#92400e" strokeWidth="2" />
      <rect x="64" y="70" width="20" height="5" rx="2" fill="#92400e" />
      <text x="74" y="82" fontSize="6" fill="#92400e" textAnchor="middle">CAFÉ</text>

      {/* Brazo izquierdo */}
      <rect x="18" y="58" width="12" height="30" rx="5" fill="#7c3aed" />
      <circle cx="24" cy="90" r="6" fill="#fde68a" />
    </svg>
  )
}

// === EL CLIENTE VISITANTE ===
// Persona profesional con portafolio, gafas, traje ejecutivo
export function ClientCharacter({ size = 100 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="50" cy="125" rx="28" ry="4" fill="rgba(0,0,0,0.3)" />

      {/* Cuerpo - traje gris ejecutivo */}
      <rect x="25" y="55" width="50" height="65" rx="6" fill="#475569" />
      {/* Camisa */}
      <path d="M42 55 L58 55 L58 70 L42 70 Z" fill="#e0f2fe" />
      {/* Corbata */}
      <path d="M48 55 L52 55 L53 62 L50 66 L47 62 Z" fill="#059669" />
      <path d="M47 62 L50 66 L48 78 L52 78 L53 66 Z" fill="#047857" />

      {/* Cabeza */}
      <circle cx="50" cy="35" r="22" fill="#fde68a" />

      {/* Pelo negro corto */}
      <path d="M28 30 Q30 14 50 12 Q70 14 72 30 L66 26 Q56 20 50 22 Q44 20 34 26 Z" fill="#1c1917" />

      {/* Gafas */}
      <circle cx="42" cy="36" r="7" fill="none" stroke="#1c1917" strokeWidth="2" />
      <circle cx="58" cy="36" r="7" fill="none" stroke="#1c1917" strokeWidth="2" />
      <line x1="49" y1="36" x2="51" y2="36" stroke="#1c1917" strokeWidth="2" />
      {/* Cristales con reflejo */}
      <circle cx="42" cy="36" r="6" fill="#e0f2fe" opacity="0.3" />
      <circle cx="58" cy="36" r="6" fill="#e0f2fe" opacity="0.3" />

      {/* Ojos detrás de las gafas */}
      <circle cx="42" cy="36" r="2.5" fill="#1c1917" />
      <circle cx="58" cy="36" r="2.5" fill="#1c1917" />

      {/* Boca neutra profesional */}
      <line x1="44" y1="46" x2="56" y2="46" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />

      {/* Brazo con portafolio */}
      <rect x="68" y="58" width="12" height="28" rx="5" fill="#475569" />
      {/* Portafolio */}
      <rect x="62" y="75" width="24" height="18" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
      <rect x="68" y="72" width="12" height="4" rx="2" fill="#334155" />
      <text x="74" y="86" fontSize="5" fill="#94a3b8" textAnchor="middle">VIP</text>

      {/* Brazo izquierdo */}
      <rect x="18" y="58" width="12" height="30" rx="5" fill="#475569" />
      <circle cx="24" cy="90" r="6" fill="#fde68a" />
    </svg>
  )
}

// === LA VENDEDORA DE DULCES ===
// Señora con delantal, mandil, canasta de dulces/tacos
export function CandySellerCharacter({ size = 100 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="50" cy="125" rx="28" ry="4" fill="rgba(0,0,0,0.3)" />

      {/* Cuerpo - vestido naranja */}
      <path d="M28 55 Q25 70 22 120 L78 120 Q75 70 72 55 Z" fill="#ea580c" />
      {/* Delantal blanco */}
      <path d="M35 58 Q33 75 32 115 L68 115 Q67 75 65 58 Z" fill="#fef3c7" />
      {/* Bordado del delantal */}
      <text x="50" y="85" fontSize="8" fill="#ea580c" textAnchor="middle" fontWeight="bold">DULCES</text>

      {/* Cabeza */}
      <circle cx="50" cy="35" r="22" fill="#fde68a" />

      {/* Pelo canoso recogido */}
      <path d="M28 32 Q28 12 50 10 Q72 12 72 32 L66 28 Q60 20 50 22 Q40 20 34 28 Z" fill="#9ca3af" />
      {/* Moño */}
      <circle cx="50" cy="12" r="6" fill="#6b7280" />

      {/* Cejas amables */}
      <path d="M38 30 Q42 28 46 30" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M54 30 Q58 28 62 30" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Ojos alegres */}
      <circle cx="42" cy="35" r="3" fill="#1c1917" />
      <circle cx="58" cy="35" r="3" fill="#1c1917" />
      <circle cx="43" cy="34" r="1" fill="#fff" />
      <circle cx="59" cy="34" r="1" fill="#fff" />

      {/* Sonrisa amplia */}
      <path d="M40 44 Q50 52 60 44" stroke="#1c1917" strokeWidth="2.5" fill="#fde68a" strokeLinecap="round" />

      {/* Mejillas rosadas */}
      <circle cx="36" cy="42" r="4" fill="#f9a8d4" opacity="0.6" />
      <circle cx="64" cy="42" r="4" fill="#f9a8d4" opacity="0.6" />

      {/* Brazo con canasta */}
      <rect x="66" y="58" width="12" height="25" rx="5" fill="#ea580c" />
      {/* Canasta de dulces */}
      <ellipse cx="75" cy="75" rx="14" ry="10" fill="#fde68a" stroke="#92400e" strokeWidth="2" />
      <ellipse cx="75" cy="72" rx="14" ry="6" fill="#fef3c7" stroke="#92400e" strokeWidth="1" />
      {/* Dulces en la canasta */}
      <circle cx="68" cy="70" r="3" fill="#ef4444" />
      <circle cx="75" cy="68" r="3" fill="#3b82f6" />
      <circle cx="82" cy="70" r="3" fill="#10b981" />
      <circle cx="71" cy="72" r="2.5" fill="#f59e0b" />
      <circle cx="79" cy="72" r="2.5" fill="#a855f7" />

      {/* Brazo izquierdo */}
      <rect x="20" y="58" width="12" height="30" rx="5" fill="#ea580c" />
      <circle cx="26" cy="90" r="6" fill="#fde68a" />
    </svg>
  )
}

// === EL ASISTENTE / AYUDANTE ===
// Personaje joven con tablet, amigable, da tips al inicio
export function AssistantCharacter({ size = 100 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="50" cy="125" rx="28" ry="4" fill="rgba(0,0,0,0.3)" />

      {/* Cuerpo - playera verde menta */}
      <rect x="25" y="55" width="50" height="65" rx="6" fill="#10b981" />
      {/* Logo deHelp en la playera */}
      <text x="50" y="85" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="bold">?HELP</text>

      {/* Cabeza */}
      <circle cx="50" cy="35" r="22" fill="#fde68a" />

      {/* Pelo castaño joven */}
      <path d="M28 30 Q30 10 50 8 Q70 10 72 30 L65 25 Q57 16 50 18 Q43 16 35 25 Z" fill="#92400e" />
      {/* Flequillo */}
      <path d="M35 25 Q42 20 50 22 Q58 20 65 25 L60 28 Q55 24 50 26 Q45 24 40 28 Z" fill="#451a03" />

      {/* Cejas amables */}
      <path d="M38 32 Q42 30 46 32" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M54 32 Q58 30 62 32" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Ojos grandes y amigables */}
      <circle cx="42" cy="36" r="4" fill="#1c1917" />
      <circle cx="58" cy="36" r="4" fill="#1c1917" />
      <circle cx="43" cy="35" r="1.5" fill="#fff" />
      <circle cx="59" cy="35" r="1.5" fill="#fff" />

      {/* Sonrisa amigable */}
      <path d="M42 45 Q50 51 58 45" stroke="#1c1917" strokeWidth="2.5" fill="#fde68a" strokeLinecap="round" />

      {/* Brazo con tablet */}
      <rect x="66" y="58" width="12" height="25" rx="5" fill="#10b981" />
      {/* Tablet */}
      <rect x="60" y="68" width="22" height="16" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
      <rect x="62" y="70" width="18" height="12" rx="1" fill="#3b82f6" />
      <text x="71" y="79" fontSize="5" fill="#fff" textAnchor="middle">TIP</text>

      {/* Mano */}
      <circle cx="72" cy="86" r="5" fill="#fde68a" />

      {/* Brazo izquierdo levantado (saludando) */}
      <rect x="14" y="55" width="12" height="20" rx="5" fill="#10b981" transform="rotate(-20 20 65)" />
      <circle cx="14" cy="58" r="6" fill="#fde68a" />

      {/* Signo de ayuda flotando */}
      <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
        <circle cx="22" cy="40" r="8" fill="#fbbf24" stroke="#92400e" strokeWidth="2" />
        <text x="22" y="44" fontSize="10" fill="#92400e" textAnchor="middle" fontWeight="bold">?</text>
      </motion.g>
    </svg>
  )
}

// Import motion for animated elements
import { motion } from 'framer-motion'
