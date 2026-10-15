'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, Check, X, Twitter, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareModalProps {
  open: boolean
  onOpenChange: (b: boolean) => void
  score: number
  tickets: number
  maxCombo: number
  mode: string
  tierLabel?: string
  tierEmoji?: string
}

export function ShareModal({
  open,
  onOpenChange,
  score,
  tickets,
  maxCombo,
  mode,
  tierLabel,
  tierEmoji,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const shareText = `🏭 ${tierEmoji ?? '🏆'} ¡Soy ${tierLabel ?? 'OPERADOR'} en Los Makileros!

📊 Stats:
- Score: ${score.toLocaleString()} pts
- Tickets: ${tickets}
- Combo máximo: x${maxCombo}
- Modo: ${mode}

¿Puedes superarme? ¡A chambear! 🔧`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = shareText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-[60] bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border-2 border-amber-500 rounded-2xl p-5 max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-stone-900" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                    Compartir
                  </div>
                  <div className="text-lg font-black text-stone-100">
                    Comparte tu score
                  </div>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Share text preview */}
            <div className="bg-stone-950 border border-stone-700 rounded-lg p-3 mb-3 max-h-48 overflow-y-auto custom-scroll">
              <pre className="text-xs font-mono text-stone-300 whitespace-pre-wrap">
                {shareText}
              </pre>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button
                onClick={handleTwitter}
                variant="outline"
                className="border-stone-600 text-stone-200 hover:bg-stone-800"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={handleWhatsApp}
                variant="outline"
                className="border-emerald-600 text-emerald-300 hover:bg-emerald-950"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
              </Button>
            </div>
            <Button
              onClick={handleCopy}
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  ¡Copiado al portapapeles!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar texto
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
