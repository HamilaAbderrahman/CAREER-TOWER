/**
 * Web Audio API chiptune engine.
 * Square-wave melody + bass + kick drum.
 * BPM escalates with each milestone reached.
 * All sounds are procedurally generated — no asset files needed.
 */

// 16-step melody (Hz). C-major pentatonic.
const MELODY: number[] = [
  523.25, 659.25, 783.99, 659.25,
  523.25, 392.00, 523.25, 659.25,
  783.99, 880.00, 783.99, 659.25,
  587.33, 659.25, 523.25, 392.00,
]

// Bass line — fires on even steps, held for a beat
const BASS: number[] = [
  130.81, 0, 196.00, 0,
  174.61, 0, 196.00, 0,
  130.81, 0, 196.00, 0,
  220.00, 0, 196.00, 0,
]

// Kick on 1 & 3 of each bar, snare on 2 & 4
const KICK =  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0]
const SNARE = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0]
const HIHAT = [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1]

export class AudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private musicMuted = false
  private sfxMuted = false

  // Scheduler state
  private bpm = 120
  private currentStep = 0
  private nextNoteTime = 0
  private timerID = 0
  private readonly LOOKAHEAD_MS = 25
  private readonly SCHEDULE_AHEAD_S = 0.12

  // -----------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------

  init() {
    if (this.ctx) return
    this.ctx = new AudioContext()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.55
    this.masterGain.connect(this.ctx.destination)

    this.musicGain = this.ctx.createGain()
    this.musicGain.gain.value = 0.28
    this.musicGain.connect(this.masterGain)

    this.sfxGain = this.ctx.createGain()
    this.sfxGain.gain.value = 1.0
    this.sfxGain.connect(this.masterGain)
  }

  resume() {
    this.ctx?.resume()
  }

  startMusic() {
    if (!this.ctx) this.init()
    this.currentStep = 0
    this.nextNoteTime = this.ctx!.currentTime + 0.05
    this.schedule()
  }

  stopMusic() {
    clearTimeout(this.timerID)
  }

  // -----------------------------------------------------------
  // Mute controls
  // -----------------------------------------------------------

  setMusicMuted(muted: boolean) {
    this.musicMuted = muted
    if (this.musicGain) this.musicGain.gain.value = muted ? 0 : 0.28
  }

  setSfxMuted(muted: boolean) {
    this.sfxMuted = muted
    if (this.sfxGain) this.sfxGain.gain.value = muted ? 0 : 1.0
  }

  isMusicMuted() { return this.musicMuted }
  isSfxMuted()   { return this.sfxMuted }

  // -----------------------------------------------------------
  // Tempo
  // -----------------------------------------------------------

  /** level 0–7 → BPM 120–200 */
  setMilestone(level: number) {
    this.bpm = 120 + level * 12
  }

  private stepDuration() {
    return 60 / this.bpm / 4 // 16th-note duration in seconds
  }

  // -----------------------------------------------------------
  // Scheduler loop (Web Audio clock-accurate)
  // -----------------------------------------------------------

  private schedule() {
    const ctx = this.ctx!
    while (this.nextNoteTime < ctx.currentTime + this.SCHEDULE_AHEAD_S) {
      this.scheduleStep(this.currentStep % 16, this.nextNoteTime)
      this.nextNoteTime += this.stepDuration()
      this.currentStep++
    }
    this.timerID = window.setTimeout(() => this.schedule(), this.LOOKAHEAD_MS)
  }

  private scheduleStep(step: number, t: number) {
    const ctx = this.ctx!
    const dur = this.stepDuration()

    // --- Melody (square wave) ---
    if (MELODY[step] > 0) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = MELODY[step]
      g.gain.setValueAtTime(0.15, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.75)
      osc.connect(g)
      g.connect(this.musicGain!)
      osc.start(t)
      osc.stop(t + dur)
    }

    // --- Bass (triangle, lower octave, fires every 2 steps) ---
    if (step % 2 === 0 && BASS[step] > 0) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = BASS[step]
      g.gain.setValueAtTime(0.35, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.8)
      osc.connect(g)
      g.connect(this.musicGain!)
      osc.start(t)
      osc.stop(t + dur * 2)
    }

    // --- Kick (sine sweep down) ---
    if (KICK[step]) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(180, t)
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.12)
      g.gain.setValueAtTime(0.7, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      osc.connect(g)
      g.connect(this.sfxGain!)
      osc.start(t)
      osc.stop(t + 0.2)
    }

    // --- Snare (noise burst + mid tone) ---
    if (SNARE[step]) {
      this.playNoiseBurst(t, 0.1, 2000, 0.18)
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 220
      g.gain.setValueAtTime(0.12, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
      osc.connect(g)
      g.connect(this.sfxGain!)
      osc.start(t)
      osc.stop(t + 0.1)
    }

    // --- Hi-hat (high-pass filtered noise) ---
    if (HIHAT[step]) {
      this.playNoiseBurst(t, 0.04, 9000, 0.05)
    }
  }

  private playNoiseBurst(t: number, duration: number, hpFreq: number, gain: number) {
    const ctx = this.ctx!
    const frames = Math.ceil(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1

    const src = ctx.createBufferSource()
    src.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = hpFreq

    const g = ctx.createGain()
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + duration)

    src.connect(filter)
    filter.connect(g)
    g.connect(this.sfxGain!)
    src.start(t)
  }

  // -----------------------------------------------------------
  // Sound effects
  // -----------------------------------------------------------

  playJump() {
    if (!this.ctx) return
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(280, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.09)
    g.gain.setValueAtTime(0.28, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13)
    osc.connect(g)
    g.connect(this.sfxGain ?? ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.13)
  }

  playLand() {
    if (!this.ctx) return
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(180, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.07)
    g.gain.setValueAtTime(0.18, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09)
    osc.connect(g)
    g.connect(this.sfxGain ?? ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.09)
  }

  playMilestone() {
    if (!this.ctx) return
    const ctx = this.ctx
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.11
      g.gain.setValueAtTime(0.22, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16)
      osc.connect(g)
      g.connect(this.sfxGain ?? ctx.destination)
      osc.start(t)
      osc.stop(t + 0.18)
    })
  }

  playWin() {
    if (!this.ctx) return
    const ctx = this.ctx
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.13
      g.gain.setValueAtTime(0.25, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
      osc.connect(g)
      g.connect(this.sfxGain ?? ctx.destination)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  }
}
