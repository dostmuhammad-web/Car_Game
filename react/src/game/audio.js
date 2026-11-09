class AudioManager {
  constructor() {
    this.ctx = null
    this.master = null
    this.engineGain = null
    this.engineFilter = null
    this.engineOscA = null
    this.engineOscB = null
    this.started = false
    this.muted = false
  }

  init() {
    if (this.started) {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume()
      return
    }
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    try {
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : 0.9
      this.master.connect(this.ctx.destination)

      this.engineFilter = this.ctx.createBiquadFilter()
      this.engineFilter.type = 'lowpass'
      this.engineFilter.frequency.value = 420
      this.engineFilter.Q.value = 3

      this.engineGain = this.ctx.createGain()
      this.engineGain.gain.value = 0

      this.engineOscA = this.ctx.createOscillator()
      this.engineOscA.type = 'sawtooth'
      this.engineOscA.frequency.value = 60

      this.engineOscB = this.ctx.createOscillator()
      this.engineOscB.type = 'square'
      this.engineOscB.frequency.value = 90

      this.engineOscA.connect(this.engineFilter)
      this.engineOscB.connect(this.engineFilter)
      this.engineFilter.connect(this.engineGain)
      this.engineGain.connect(this.master)

      this.engineOscA.start()
      this.engineOscB.start()
      this.started = true
    } catch {
      this.ctx = null
    }
  }

  setMuted(muted) {
    this.muted = muted
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.9, this.ctx.currentTime, 0.05)
    }
  }

  setEngine(norm, running) {
    if (!this.ctx || !this.engineGain) return
    const t = this.ctx.currentTime
    const target = running ? 0.05 + norm * 0.07 : 0
    this.engineGain.gain.setTargetAtTime(target, t, 0.15)
    const freq = 52 + norm * 118
    this.engineOscA.frequency.setTargetAtTime(freq, t, 0.12)
    this.engineOscB.frequency.setTargetAtTime(freq * 1.51, t, 0.12)
    this.engineFilter.frequency.setTargetAtTime(320 + norm * 900, t, 0.15)
  }

  tone({ freq, to, dur, type = 'sine', gain = 0.2, delay = 0 }) {
    if (!this.ctx) return
    const t = this.ctx.currentTime + delay
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g)
    g.connect(this.master)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  noise({ dur = 0.4, gain = 0.4, filterFreq = 1200 }) {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const len = Math.floor(this.ctx.sampleRate * dur)
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len)
    }
    const src = this.ctx.createBufferSource()
    src.buffer = buffer
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = filterFreq
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(gain, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(filter)
    filter.connect(g)
    g.connect(this.master)
    src.start(t)
  }

  coin(step = 0) {
    const base = 660 + Math.min(step, 7) * 70
    this.tone({ freq: base, dur: 0.09, type: 'triangle', gain: 0.16 })
    this.tone({ freq: base * 1.5, dur: 0.14, type: 'sine', gain: 0.12, delay: 0.06 })
  }

  nearMiss() {
    this.tone({ freq: 1500, to: 900, dur: 0.08, type: 'sine', gain: 0.07 })
  }

  heal() {
    this.tone({ freq: 520, to: 880, dur: 0.16, type: 'triangle', gain: 0.16 })
    this.tone({ freq: 880, to: 1320, dur: 0.18, type: 'sine', gain: 0.1, delay: 0.1 })
  }

  crash() {
    this.noise({ dur: 0.45, gain: 0.5, filterFreq: 900 })
    this.tone({ freq: 140, to: 45, dur: 0.35, type: 'sawtooth', gain: 0.22 })
  }

  start() {
    this.tone({ freq: 330, dur: 0.12, type: 'square', gain: 0.12 })
    this.tone({ freq: 495, dur: 0.12, type: 'square', gain: 0.12, delay: 0.12 })
    this.tone({ freq: 660, dur: 0.24, type: 'square', gain: 0.14, delay: 0.24 })
  }

  countdown(go = false) {
    this.tone({
      freq: go ? 880 : 440,
      dur: go ? 0.4 : 0.16,
      type: 'square',
      gain: go ? 0.18 : 0.1,
    })
  }

  gameOver() {
    this.tone({ freq: 440, to: 220, dur: 0.5, type: 'sawtooth', gain: 0.14 })
    this.tone({ freq: 220, to: 90, dur: 0.8, type: 'triangle', gain: 0.16, delay: 0.28 })
  }

  pause() {
    this.setEngine(0, false)
    this.tone({ freq: 300, to: 200, dur: 0.14, type: 'sine', gain: 0.1 })
  }

  resume() {
    this.tone({ freq: 200, to: 420, dur: 0.16, type: 'sine', gain: 0.1 })
  }
}

export const audio = new AudioManager()
