// src/lib/audio.ts
// AudioManager singleton usando Web Audio API
// Sintetiza los efectos de sonido en runtime — no requiere archivos externos.

type SfxName =
  | 'click-ok'
  | 'cut-slice'
  | 'buzz-fail'
  | 'siren-alarm'
  | 'ultrasonic-hum'
  | 'press-thunk'
  | 'oven-whoosh'
  | 'combo-chime'
  | 'game-over'
  | 'whisper-loop'
  | 'coffee-glug'
  | 'taco-bite'
  | 'ticket-done'
  | 'gringo-yell'
  | 'supervisor-angry'

class AudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private sfxVolume = 0.7
  private musicVolume = 0.3
  private sfxEnabled = true
  private musicEnabled = false
  private musicSource: AudioBufferSourceNode | null = null
  private musicGain: GainNode | null = null
  private bufferCache: Map<SfxName, AudioBuffer> = new Map()

  init() {
    if (this.ctx) return
    try {
      const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
      this.ctx = new Ctx()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.sfxVolume
      this.masterGain.connect(this.ctx.destination)
    } catch (e) {
      console.warn('AudioContext no disponible', e)
    }
  }

  resume() {
    this.ctx?.resume()
  }

  setSfxVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v))
    if (this.masterGain) this.masterGain.gain.value = this.sfxVolume
  }

  setMusicVolume(v: number) {
    this.musicVolume = Math.max(0, Math.min(1, v))
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume * 0.3
  }

  setSfxEnabled(b: boolean) {
    this.sfxEnabled = b
  }

  setMusicEnabled(b: boolean) {
    this.musicEnabled = b
    if (!b) this.stopMusic()
    else this.startMusic()
  }

  private getOrCreateBuffer(name: SfxName): AudioBuffer | null {
    if (!this.ctx) return null
    const cached = this.bufferCache.get(name)
    if (cached) return cached
    const buffer = this.synthBuffer(name)
    if (buffer) this.bufferCache.set(name, buffer)
    return buffer
  }

  private synthBuffer(name: SfxName): AudioBuffer | null {
    if (!this.ctx) return null
    const ctx = this.ctx
    switch (name) {
      case 'click-ok': {
        // tono alto corto tipo "tink" satisfactorio
        return this.toneBuffer(1200, 0.06, 'sine', 0.35)
      }
      case 'cut-slice': {
        // cizalla: ruido corto con envolvente rápida
        return this.noiseBuffer(0.18, 0.5, 800, 'highpass')
      }
      case 'press-thunk': {
        // golpe de prensa: tono grave corto
        return this.toneBuffer(90, 0.18, 'square', 0.45, 60)
      }
      case 'ultrasonic-hum': {
        // zumbido agudo 1s
        return this.toneBuffer(8000, 1.0, 'sawtooth', 0.12)
      }
      case 'oven-whoosh': {
        // aire caliente: ruido con lowpass + envolvente larga
        return this.noiseBuffer(1.2, 0.35, 1200, 'lowpass')
      }
      case 'buzz-fail': {
        // buzz estridente 1.5s
        return this.buzzBuffer()
      }
      case 'siren-alarm': {
        // sirena: oscilador con frecuencia modulada
        return this.sirenBuffer()
      }
      case 'combo-chime': {
        // chime ascendente (3 tonos)
        return this.chimeBuffer()
      }
      case 'game-over': {
        // descendente triste
        return this.gameOverBuffer()
      }
      case 'whisper-loop': {
        // susurros
        return this.noiseBuffer(2.5, 0.05, 700, 'bandpass')
      }
      case 'coffee-glug': {
        return this.glugBuffer()
      }
      case 'taco-bite': {
        return this.toneBuffer(180, 0.08, 'square', 0.4, 80)
      }
      case 'ticket-done': {
        return this.chimeBuffer(0.5)
      }
      case 'gringo-yell': {
        // grito: ruido tonal con vibrato
        return this.yellBuffer()
      }
      case 'supervisor-angry': {
        // golpe tipo "eh!"
        return this.toneBuffer(220, 0.25, 'sawtooth', 0.4, 110)
      }
      default:
        return null
    }
  }

  private toneBuffer(
    freq: number,
    duration: number,
    type: OscillatorType,
    gain: number,
    freqEnd?: number
  ): AudioBuffer {
    const ctx = this.ctx!
    const sr = ctx.sampleRate
    const len = Math.floor(sr * duration)
    const buf = ctx.createBuffer(1, len, sr)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const t = i / sr
      const f = freqEnd != null ? freq + (freqEnd - freq) * (i / len) : freq
      const env = Math.exp(-3 * t) // envolvente exponencial
      data[i] = gain * env * Math.sin(2 * Math.PI * f * t)
    }
    return buf
  }

  private noiseBuffer(
    duration: number,
    gain: number,
    cutoff: number,
    filterType: BiquadFilterType
  ): AudioBuffer {
    const ctx = this.ctx!
    const sr = ctx.sampleRate
    const len = Math.floor(sr * duration)
    const buf = ctx.createBuffer(1, len, sr)
    const data = buf.getChannelData(0)
    // noise generation + simple filter
    let last = 0
    for (let i = 0; i < len; i++) {
      const t = i / sr
      const env = Math.exp(-2 * t)
      // crude lowpass/highpass via RC filter approximation
      const white = Math.random() * 2 - 1
      const alpha = filterType === 'lowpass' ? cutoff / sr : 1 - cutoff / sr
      last = last + alpha * (white - last)
      data[i] = gain * env * (filterType === 'bandpass' ? last * Math.sin(2 * Math.PI * cutoff * t) : last)
    }
    return buf
  }

  private buzzBuffer(): AudioBuffer {
    const ctx = this.ctx!
    const sr = ctx.sampleRate
    const duration = 1.5
    const len = Math.floor(sr * duration)
    const buf = ctx.createBuffer(1, len, sr)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const t = i / sr
      // 2 tonos distantes para disonancia (200Hz + 233Hz)
      const env = t < 0.05 ? t / 0.05 : Math.min(1, (duration - t) / 0.3)
      const s = 0.4 * env * (Math.sin(2 * Math.PI * 200 * t) + 0.8 * Math.sin(2 * Math.PI * 233 * t))
      data[i] = s
    }
    return buf
  }

  private sirenBuffer(): AudioBuffer {
    const ctx = this.ctx!
    const sr = ctx.sampleRate
    const duration = 2.0
    const len = Math.floor(sr * duration)
    const buf = ctx.createBuffer(1, len, sr)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const t = i / sr
      // LFO 4Hz modula freq 600-1000
      const f = 800 + 200 * Math.sin(2 * Math.PI * 4 * t)
      const env = 0.3
      data[i] = env * 0.4 * Math.sin(2 * Math.PI * f * t)
    }
    return buf
  }

  private chimeBuffer(scale: number = 1): AudioBuffer {
    const ctx = this.ctx!
    const sr = ctx.sampleRate
    const duration = 0.6 * scale
    const len = Math.floor(sr * duration)
    const buf = ctx.createBuffer(1, len, sr)
    const data = buf.getChannelData(0)
    // tres tonos ascendentes: 660, 880, 1320
    const freqs = [660, 880, 1320]
    for (let i = 0; i < len; i++) {
      const t = i / sr
      const seg = Math.min(freqs.length - 1, Math.floor(t / (duration / freqs.length)))
      const f = freqs[seg]
      const env = Math.exp(-5 * t)
      data[i] = 0.25 * env * Math.sin(2 * Math.PI * f * t)
    }
    return buf
  }

  private gameOverBuffer(): AudioBuffer {
    const ctx = this.ctx!
    const sr = ctx.sampleRate
    const duration = 1.8
    const len = Math.floor(sr * duration)
    const buf = ctx.createBuffer(1, len, sr)
    const data = buf.getChannelData(0)
    // descendente 440 -> 110
    for (let i = 0; i < len; i++) {
      const t = i / sr
      const f = 440 - (440 - 110) * (t / duration)
      const env = Math.exp(-1.5 * t)
      data[i] = 0.3 * env * Math.sin(2 * Math.PI * f * t)
    }
    return buf
  }

  private glugBuffer(): AudioBuffer {
    const ctx = this.ctx!
    const sr = ctx.sampleRate
    const duration = 0.6
    const len = Math.floor(sr * duration)
    const buf = ctx.createBuffer(1, len, sr)
    const data = buf.getChannelData(0)
    // 3 glugs pequeños
    for (let i = 0; i < len; i++) {
      const t = i / sr
      const glugIdx = Math.floor(t / 0.2)
      const local = (t - glugIdx * 0.2)
      const f = 400 - 100 * glugIdx
      const env = Math.exp(-15 * local)
      data[i] = 0.25 * env * Math.sin(2 * Math.PI * f * t)
    }
    return buf
  }

  private yellBuffer(): AudioBuffer {
    const ctx = this.ctx!
    const sr = ctx.sampleRate
    const duration = 0.8
    const len = Math.floor(sr * duration)
    const buf = ctx.createBuffer(1, len, sr)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const t = i / sr
      // freq modulada con vibrato + noise leve
      const vibrato = 4 * Math.sin(2 * Math.PI * 12 * t)
      const f = 180 + vibrato
      const env = Math.min(1, t / 0.05) * Math.exp(-2 * t)
      const noise = 0.05 * (Math.random() * 2 - 1)
      data[i] = 0.3 * env * (Math.sin(2 * Math.PI * f * t) + noise)
    }
    return buf
  }

  play(name: SfxName, opts: { loop?: boolean; rate?: number; volume?: number } = {}) {
    if (!this.ctx || !this.masterGain || !this.sfxEnabled) return
    const buffer = this.getOrCreateBuffer(name)
    if (!buffer) return
    const src = this.ctx.createBufferSource()
    src.buffer = buffer
    src.loop = !!opts.loop
    if (opts.rate) src.playbackRate.value = opts.rate
    const gain = this.ctx.createGain()
    gain.gain.value = opts.volume ?? 1
    src.connect(gain)
    gain.connect(this.masterGain)
    src.start()
    return src
  }

  stop(source?: AudioBufferSourceNode) {
    if (source) {
      try { source.stop() } catch {}
    }
  }

  startMusic() {
    if (!this.ctx || !this.musicEnabled) return
    this.stopMusic()
    const sr = this.ctx.sampleRate
    const duration = 4.0
    const len = Math.floor(sr * duration)
    const buf = this.ctx.createBuffer(1, len, sr)
    const data = buf.getChannelData(0)
    // loop suave de fábrica: tonos bajos aleatorios
    for (let i = 0; i < len; i++) {
      const t = i / sr
      const s1 = 0.05 * Math.sin(2 * Math.PI * 110 * t)
      const s2 = 0.03 * Math.sin(2 * Math.PI * 55 * t + Math.sin(t * 0.3))
      const noise = 0.02 * (Math.random() * 2 - 1)
      data[i] = s1 + s2 + noise
    }
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const g = this.ctx.createGain()
    g.gain.value = this.musicVolume * 0.3
    src.connect(g)
    g.connect(this.ctx.destination)
    src.start()
    this.musicSource = src
    this.musicGain = g
  }

  stopMusic() {
    if (this.musicSource) {
      try { this.musicSource.stop() } catch {}
      this.musicSource = null
    }
  }
}

export const audio = new AudioManager()
