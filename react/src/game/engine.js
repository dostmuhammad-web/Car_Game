const TRAFFIC_COLORS = ['#ff5d6c', '#5d8bff', '#ffcf5d', '#4fe0b0', '#c06bff', '#ff8f4d', '#6be0ff']

const clamp = (v, min, max) => (v < min ? min : v > max ? max : v)
const rand = (a = 0, b = 1) => a + Math.random() * (b - a)

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  let r = (n >> 16) & 255
  let g = (n >> 8) & 255
  let b = n & 255
  if (amt >= 0) {
    r += (255 - r) * amt
    g += (255 - g) * amt
    b += (255 - b) * amt
  } else {
    r *= 1 + amt
    g *= 1 + amt
    b *= 1 + amt
  }
  return `rgb(${r | 0},${g | 0},${b | 0})`
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

const BEST_KEY = 'neon-drive.best'

export class GameEngine {
  constructor(canvas, opts = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.audio = opts.audio || null
    this.onStats = opts.onStats || (() => {})
    this.onState = opts.onState || (() => {})
    this.onCountdown = opts.onCountdown || (() => {})
    this.onGameOver = opts.onGameOver || (() => {})

    this.state = 'menu'
    this.player = null
    this.entities = []
    this.particles = []
    this.texts = []
    this.stars = []
    this.keys = { left: false, right: false }

    let storedBest = 0
    try {
      storedBest = Number(localStorage.getItem(BEST_KEY) || 0) || 0
    } catch {
      storedBest = 0
    }
    this.best = storedBest
    this.muted = false
    this.time = 0
    this.last = 0
    this.raf = 0
    this.running = true
    this.statTimer = 0
    this.shake = 0

    this.odometer = 0
    this.runDistance = 0
    this.runTime = 0
    this.speed = 0
    this.score = 0
    this.coins = 0
    this.combo = 1
    this.comboTimer = 0
    this.health = 3
    this.maxHealth = 3
    this.invuln = 0
    this.countdown = 0
    this.lastCount = 0
    this.spawnTimer = 0
    this.coinTimer = 0
    this.heartTimer = 0

    this.frame = this.frame.bind(this)
    this.handlePointer = this.handlePointer.bind(this)
    this.handleTouch = this.handleTouch.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleVisibility = this.handleVisibility.bind(this)

    this.resize()
    this.resetRun()

    window.addEventListener('pointermove', this.handlePointer, { passive: true })
    canvas.addEventListener('touchmove', this.handleTouch, { passive: false })
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    document.addEventListener('visibilitychange', this.handleVisibility)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)

    this.emitStats(true)
    this.raf = requestAnimationFrame(this.frame)
  }

  laneCenter(i) {
    return this.roadLeft + this.laneWidth * (i + 0.5)
  }

  getBounds() {
    const p = this.player
    const half = p ? p.w / 2 : this.carW / 2
    return {
      min: this.roadLeft + half + 8,
      max: this.roadRight - half - 8,
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    const W = Math.max(320, Math.round(rect.width || this.canvas.clientWidth || 900))
    const H = Math.max(360, Math.round(rect.height || this.canvas.clientHeight || 600))
    this.W = W
    this.H = H
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = Math.round(W * this.dpr)
    this.canvas.height = Math.round(H * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)

    this.roadWidth = Math.min(W * 0.7, 820)
    this.roadLeft = (W - this.roadWidth) / 2
    this.roadRight = this.roadLeft + this.roadWidth
    this.laneWidth = this.roadWidth / 4
    this.playerY = H * 0.76
    this.carW = clamp(this.laneWidth * 0.46, 30, 66)

    if (this.player) {
      this.player.w = this.carW
      this.player.h = this.carW * 1.9
      const b = this.getBounds()
      this.player.x = clamp(this.player.x, b.min, b.max)
      this.player.targetX = clamp(this.player.targetX, b.min, b.max)
    }

    this.buildStars()
  }

  buildStars() {
    this.stars = []
    const count = Math.round((this.W * this.H) / 14000)
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        s: Math.random() * 1.6 + 0.4,
        p: Math.random() * 0.8 + 0.2,
      })
    }
  }

  resetRun() {
    const W = this.W
    const b = this.getBounds()
    const startX = clamp(W / 2, b.min, b.max)
    this.player = {
      x: startX,
      targetX: startX,
      prevX: startX,
      y: this.playerY,
      w: this.carW,
      h: this.carW * 1.9,
      angle: 0,
      color: '#35d0ff',
    }
    this.entities = []
    this.particles = []
    this.texts = []
    this.runDistance = 0
    this.runTime = 0
    this.speed = 0
    this.score = 0
    this.coins = 0
    this.combo = 1
    this.comboTimer = 0
    this.health = this.maxHealth
    this.invuln = 0
    this.shake = 0
    this.spawnTimer = 0.8
    this.coinTimer = 1.2
    this.heartTimer = rand(14, 20)
  }

  start() {
    this.resetRun()
    this.state = 'countdown'
    this.countdown = 3.0
    this.lastCount = 3
    this.onState('countdown')
    this.onCountdown(3)
    this.audio?.countdown(false)
    this.emitStats(true)
  }

  toMenu() {
    this.resetRun()
    this.state = 'menu'
    this.onState('menu')
    this.audio?.setEngine(0, false)
    this.emitStats(true)
  }

  pause() {
    if (this.state !== 'playing') return
    this.state = 'paused'
    this.onState('paused')
    this.audio?.pause()
    this.emitStats(true)
  }

  resume() {
    if (this.state !== 'paused') return
    this.state = 'playing'
    this.onState('playing')
    this.audio?.resume()
    this.emitStats(true)
  }

  togglePause() {
    if (this.state === 'playing') this.pause()
    else if (this.state === 'paused') this.resume()
  }

  setMuted(muted) {
    this.muted = muted
    this.audio?.setMuted(muted)
  }

  handlePointer(e) {
    if (this.state !== 'playing' && this.state !== 'countdown') return
    const rect = this.canvas.getBoundingClientRect()
    this.setTargetX(e.clientX - rect.left)
  }

  handleTouch(e) {
    if (this.state !== 'playing' && this.state !== 'countdown') return
    if (!e.touches.length) return
    e.preventDefault()
    const rect = this.canvas.getBoundingClientRect()
    this.setTargetX(e.touches[0].clientX - rect.left)
  }

  setTargetX(x) {
    if (!this.player) return
    const b = this.getBounds()
    this.player.targetX = clamp(x, b.min, b.max)
  }

  handleKeyDown(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.keys.left = true
      if (this.state === 'playing') e.preventDefault()
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.keys.right = true
      if (this.state === 'playing') e.preventDefault()
    } else if (e.code === 'KeyP' || e.code === 'Escape') {
      if (this.state === 'playing' || this.state === 'paused') {
        e.preventDefault()
        this.togglePause()
      }
    }
  }

  handleKeyUp(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false
    if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false
  }

  handleVisibility() {
    if (document.hidden && this.state === 'playing') this.pause()
  }

  emitStats(force = false) {
    if (!force && this.statTimer > 0) return
    this.statTimer = 0.1
    this.onStats({
      score: Math.floor(this.score),
      best: this.best,
      health: this.health,
      maxHealth: this.maxHealth,
      combo: this.combo,
      speed: Math.round(this.speed),
      coins: this.coins,
      distance: Math.floor(this.runDistance),
      state: this.state,
    })
  }

  update(dt) {
    this.time += dt
    this.statTimer -= dt

    let scroll = 0
    if (this.state === 'menu' || this.state === 'countdown') {
      scroll = 180
    } else if (this.state === 'playing') {
      scroll = this.speed * 2.4
    } else if (this.state === 'over') {
      this.speed *= Math.exp(-dt * 2.2)
      scroll = this.speed * 2.4
    }

    this.odometer += scroll * dt

    if (this.shake > 0.4) {
      this.shake *= Math.exp(-dt * 6)
    } else {
      this.shake = 0
    }

    if (this.state === 'countdown') {
      this.speed = 130
      this.countdown -= dt
      const n = Math.ceil(this.countdown)
      if (n !== this.lastCount && n > 0) {
        this.lastCount = n
        this.onCountdown(n)
        this.audio?.countdown(false)
      }
      if (this.countdown <= 0) {
        this.state = 'playing'
        this.runTime = 0
        this.lastCount = 0
        this.onCountdown(0)
        this.onState('playing')
        this.audio?.start()
      }
      this.updatePlayer(dt, true)
      this.audio?.setEngine(0.15, true)
    } else if (this.state === 'playing') {
      this.updatePlaying(dt, scroll)
    } else if (this.state === 'menu') {
      this.updatePlayer(dt, false)
      this.audio?.setEngine(0, false)
    } else if (this.state === 'over') {
      this.audio?.setEngine(0, false)
    }

    this.updateParticles(dt)
    this.emitStats()
  }

  updatePlayer(dt, controllable) {
    const p = this.player
    const b = this.getBounds()

    if (controllable) {
      if (this.keys.left || this.keys.right) {
        const dir = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0)
        p.targetX = clamp(p.targetX + dir * this.laneWidth * 2.6 * dt, b.min, b.max)
      }
      p.x += (p.targetX - p.x) * (1 - Math.exp(-dt * 11))
    } else {
      p.x += (this.W / 2 - p.x) * (1 - Math.exp(-dt * 3))
    }
    p.x = clamp(p.x, b.min, b.max)

    const vx = dt > 0 ? (p.x - p.prevX) / dt : 0
    const targetAngle = clamp(vx * 0.0007, -0.32, 0.32)
    p.angle += (targetAngle - p.angle) * (1 - Math.exp(-dt * 10))
    p.prevX = p.x
    p.y = this.playerY
  }

  updatePlaying(dt, scroll) {
    this.runTime += dt
    this.runDistance += (scroll * dt) / 10

    const targetSpeed = Math.min(140 + this.runTime * 5.5, 340)
    this.speed += (targetSpeed - this.speed) * Math.min(1, dt * 1.6)

    this.score += this.speed * dt * 0.75

    if (this.comboTimer > 0) {
      this.comboTimer -= dt
      if (this.comboTimer <= 0) {
        this.combo = 1
        this.emitStats(true)
      }
    }

    if (this.invuln > 0) this.invuln -= dt

    this.updatePlayer(dt, true)

    if (Math.random() < dt * 42) this.spawnExhaust()

    this.spawnTimer -= dt
    if (this.spawnTimer <= 0) {
      this.spawnTraffic()
      this.spawnTimer = clamp(1.25 - this.runTime * 0.012, 0.42, 1.25) * rand(0.7, 1.25)
    }

    this.coinTimer -= dt
    if (this.coinTimer <= 0) {
      this.spawnCoins()
      this.coinTimer = rand(0.8, 1.7)
    }

    this.heartTimer -= dt
    if (this.heartTimer <= 0) {
      if (this.health < this.maxHealth) this.spawnHeart()
      this.heartTimer = rand(15, 24)
    }

    for (const e of this.entities) {
      if (e.dead) continue
      e.prevY = e.y
      const factor = e.kind === 'traffic' ? 1 - e.vFactor : 1
      e.y += scroll * factor * dt

      if (e.y > this.H + 220) {
        e.dead = true
        continue
      }

      if (e.kind === 'traffic') {
        if (this.invuln <= 0 && this.trafficOverlap(e)) {
          this.hitTraffic(e)
          continue
        }
        if (!e.passed && e.prevY < this.playerY && e.y >= this.playerY) {
          e.passed = true
          const gap = Math.abs(e.x - this.player.x)
          const reach = (this.player.w * 0.42 + e.w * 0.42) + this.laneWidth * 0.6
          if (gap < reach) this.nearMiss(e)
        }
      } else if (this.pickupHit(e)) {
        e.dead = true
        if (e.kind === 'coin') this.collectCoin(e)
        else this.collectHeart(e)
      }
    }
    this.entities = this.entities.filter((e) => !e.dead)

    this.audio?.setEngine(clamp((this.speed - 100) / 240, 0, 1), true)
  }

  trafficOverlap(e) {
    const p = this.player
    const px = p.w * 0.42
    const py = p.h * 0.44
    const ex = e.w * 0.42
    const ey = e.h * 0.44
    return Math.abs(e.x - p.x) < px + ex && Math.abs(e.y - this.playerY) < py + ey
  }

  pickupHit(e) {
    const p = this.player
    const hw = p.w * 0.45
    const hh = p.h * 0.46
    const cx = clamp(e.x, p.x - hw, p.x + hw)
    const cy = clamp(e.y, this.playerY - hh, this.playerY + hh)
    const dx = e.x - cx
    const dy = e.y - cy
    return dx * dx + dy * dy < e.r * e.r
  }

  hitTraffic(e) {
    e.dead = true
    this.health -= 1
    this.combo = 1
    this.comboTimer = 0
    this.invuln = 1.5
    this.shake = 22
    this.explode(e.x, e.y)
    this.addText(e.x, e.y - 24, 'HIT!', '#ff5d6c', 30)
    this.audio?.crash()
    if (this.health <= 0) this.gameOver()
    this.emitStats(true)
  }

  nearMiss(e) {
    this.score += 25
    this.shake = Math.max(this.shake, 6)
    this.addText(this.player.x, this.playerY - 70, 'CLOSE!', '#59e0ff', 20)
    this.audio?.nearMiss()
  }

  collectCoin(e) {
    this.coins += 1
    this.combo = Math.min(this.combo + 1, 9)
    this.comboTimer = 4
    const gain = 40 * this.combo
    this.score += gain
    this.spawnSparkles(e.x, e.y, '#ffd25a', 10)
    this.addText(e.x, e.y, `+${gain}`, '#ffd25a', 20)
    this.audio?.coin(this.combo)
    this.emitStats(true)
  }

  collectHeart(e) {
    this.health = Math.min(this.maxHealth, this.health + 1)
    this.spawnSparkles(e.x, e.y, '#ff5d9e', 12)
    this.addText(e.x, e.y, '+1 HP', '#ff5d9e', 22)
    this.audio?.heal()
    this.emitStats(true)
  }

  gameOver() {
    if (this.state !== 'playing') return
    this.state = 'over'
    this.onState('over')
    const finalScore = Math.floor(this.score)
    const newBest = finalScore > this.best
    if (newBest) {
      this.best = finalScore
      try {
        localStorage.setItem(BEST_KEY, String(finalScore))
      } catch {
        /* ignore */
      }
    }
    this.audio?.setEngine(0, false)
    this.audio?.gameOver()
    this.onGameOver({
      score: finalScore,
      best: this.best,
      newBest,
      coins: this.coins,
      distance: Math.floor(this.runDistance),
    })
    this.emitStats(true)
  }

  spawnTraffic() {
    const lane = Math.floor(rand(0, 4))
    const x = this.laneCenter(lane)
    const clash = this.entities.some(
      (e) => e.kind === 'traffic' && Math.abs(e.x - x) < this.laneWidth * 0.5 && e.y < 190,
    )
    if (clash) return
    const w = this.carW
    const h = this.carW * 1.9
    this.entities.push({
      kind: 'traffic',
      x,
      y: -h - rand(0, 140),
      prevY: 0,
      w,
      h,
      color: TRAFFIC_COLORS[Math.floor(rand(0, TRAFFIC_COLORS.length))],
      vFactor: rand(0.32, 0.6),
      passed: false,
      dead: false,
    })
  }

  spawnCoins() {
    const lane = Math.floor(rand(0, 4))
    const x = this.laneCenter(lane) + rand(-1, 1) * this.laneWidth * 0.18
    const count = Math.random() < 0.35 ? Math.floor(rand(2, 5)) : 1
    for (let i = 0; i < count; i++) {
      this.entities.push({
        kind: 'coin',
        x,
        y: -40 - i * 72,
        prevY: 0,
        r: clamp(this.laneWidth * 0.12, 11, 22),
        seed: rand(0, 10),
        dead: false,
      })
    }
  }

  spawnHeart() {
    const lane = Math.floor(rand(0, 4))
    this.entities.push({
      kind: 'heart',
      x: this.laneCenter(lane),
      y: -60,
      prevY: 0,
      r: clamp(this.laneWidth * 0.16, 14, 24),
      seed: rand(0, 10),
      dead: false,
    })
  }

  spawnExhaust() {
    const p = this.player
    this.particles.push({
      x: p.x + rand(-p.w * 0.22, p.w * 0.22),
      y: p.y + p.h * 0.52,
      vx: rand(-30, 30),
      vy: rand(60, 150),
      gravity: 0,
      drag: 1.2,
      size: rand(2, 5),
      color: Math.random() < 0.4 ? '#59e0ff' : '#8a93b5',
      life: rand(0.3, 0.6),
      maxLife: 0.6,
      glow: true,
    })
  }

  spawnSparkles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2)
      const sp = rand(60, 220)
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        gravity: 120,
        drag: 2.4,
        size: rand(1.5, 3.5),
        color,
        life: rand(0.3, 0.7),
        maxLife: 0.7,
        glow: true,
      })
    }
  }

  explode(x, y) {
    for (let i = 0; i < 30; i++) {
      const a = rand(0, Math.PI * 2)
      const sp = rand(80, 420)
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        gravity: 240,
        drag: 2,
        size: rand(2, 5),
        color: ['#ffcf5d', '#ff8f4d', '#ff5d6c', '#ffffff'][Math.floor(rand(0, 4))],
        life: rand(0.35, 0.85),
        maxLife: 0.85,
        glow: true,
      })
    }
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x + rand(-20, 20),
        y: y + rand(-20, 20),
        vx: rand(-50, 50),
        vy: rand(-40, 60),
        gravity: -40,
        drag: 1,
        size: rand(8, 18),
        color: '#3a3f57',
        life: rand(0.5, 1),
        maxLife: 1,
        glow: false,
      })
    }
  }

  addText(x, y, text, color, size) {
    this.texts.push({ x, y, text, color, size, life: 0.9, maxLife: 0.9, vy: -60 })
  }

  updateParticles(dt) {
    for (const p of this.particles) {
      p.life -= dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += p.gravity * dt
      p.vx *= 1 - Math.min(1, p.drag * dt)
      p.vy *= 1 - Math.min(1, p.drag * 0.35 * dt)
    }
    this.particles = this.particles.filter((p) => p.life > 0)

    for (const t of this.texts) {
      t.life -= dt
      t.y += t.vy * dt
      t.vy *= 1 - Math.min(1, dt * 2)
    }
    this.texts = this.texts.filter((t) => t.life > 0)
  }

  frame(ts) {
    if (!this.running) return
    if (!this.last) this.last = ts
    let dt = (ts - this.last) / 1000
    this.last = ts
    if (dt > 0.05) dt = 0.05
    if (dt < 0) dt = 0
    this.update(dt)
    this.render()
    this.raf = requestAnimationFrame(this.frame)
  }

  render() {
    const ctx = this.ctx
    const { W, H } = this
    ctx.clearRect(0, 0, W, H)
    ctx.save()
    if (this.shake > 0.4) {
      ctx.translate(rand(-this.shake, this.shake) * 0.5, rand(-this.shake, this.shake) * 0.5)
    }
    this.drawBackground()
    this.drawRoad()
    this.drawSpeedLines()
    this.drawEntities()
    this.drawPlayer()
    this.drawParticles()
    this.drawTexts()
    ctx.restore()
    this.drawOverlayShade()
  }

  drawBackground() {
    const ctx = this.ctx
    const { W, H } = this

    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, '#050810')
    sky.addColorStop(0.45, '#080d1e')
    sky.addColorStop(1, '#0b1330')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)

    for (const s of this.stars) {
      const y = (s.y + this.odometer * 0.06 * s.p) % H
      ctx.globalAlpha = 0.25 + s.p * 0.4
      ctx.fillStyle = '#bfe9ff'
      ctx.fillRect(s.x, y, s.s, s.s)
    }
    ctx.globalAlpha = 1

    const leftEnd = this.roadLeft - 12
    const rightStart = this.roadRight + 12
    ctx.strokeStyle = 'rgba(46, 200, 255, 0.07)'
    ctx.lineWidth = 1
    const step = 64
    const off = this.odometer % step
    for (let y = off - step; y < H + step; y += step) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(leftEnd, y)
      ctx.moveTo(rightStart, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }
    for (let x = step; x < leftEnd; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
    }
    for (let x = rightStart + step; x < W; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
    }

    const leftGlow = ctx.createLinearGradient(0, 0, leftEnd, 0)
    leftGlow.addColorStop(0, 'rgba(255, 45, 120, 0)')
    leftGlow.addColorStop(1, 'rgba(255, 45, 120, 0.1)')
    ctx.fillStyle = leftGlow
    ctx.fillRect(0, 0, leftEnd, H)
    const rightGlow = ctx.createLinearGradient(W, 0, rightStart, 0)
    rightGlow.addColorStop(0, 'rgba(46, 230, 255, 0)')
    rightGlow.addColorStop(1, 'rgba(46, 230, 255, 0.1)')
    ctx.fillStyle = rightGlow
    ctx.fillRect(rightStart, 0, W - rightStart, H)
  }

  drawRoad() {
    const ctx = this.ctx
    const { H, roadLeft, roadRight, roadWidth, laneWidth } = this

    const asphalt = ctx.createLinearGradient(roadLeft, 0, roadRight, 0)
    asphalt.addColorStop(0, '#111420')
    asphalt.addColorStop(0.5, '#181c2b')
    asphalt.addColorStop(1, '#111420')
    ctx.fillStyle = asphalt
    ctx.fillRect(roadLeft, 0, roadWidth, H)

    const cycle = 88
    const dash = 44
    const off = this.odometer % cycle
    ctx.fillStyle = 'rgba(225, 240, 255, 0.16)'
    for (let i = 1; i < 4; i++) {
      const x = roadLeft + laneWidth * i - 3
      for (let y = off - cycle; y < H + cycle; y += cycle) {
        roundRectPath(ctx, x, y, 6, dash, 3)
        ctx.fill()
      }
    }

    const curbCycle = 72
    const curbSeg = 36
    const startM = Math.floor(-this.odometer / curbCycle) - 1
    const endM = Math.ceil((H - this.odometer) / curbCycle) + 1
    for (let m = startM; m <= endM; m++) {
      const y = m * curbCycle + this.odometer
      const color = m % 2 === 0 ? '#ff2d78' : '#25e6ff'
      ctx.fillStyle = color
      ctx.globalAlpha = 0.85
      ctx.shadowColor = color
      ctx.shadowBlur = 14
      ctx.fillRect(roadLeft - 10, y, 10, curbSeg)
      ctx.fillRect(roadRight, y, 10, curbSeg)
    }
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0

    ctx.strokeStyle = 'rgba(46, 230, 255, 0.9)'
    ctx.lineWidth = 3
    ctx.shadowColor = '#2ee6ff'
    ctx.shadowBlur = 20
    ctx.beginPath()
    ctx.moveTo(roadLeft + 2, 0)
    ctx.lineTo(roadLeft + 2, H)
    ctx.moveTo(roadRight - 2, 0)
    ctx.lineTo(roadRight - 2, H)
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  drawSpeedLines() {
    if (this.speed < 210) return
    const ctx = this.ctx
    const { W, H } = this
    const intensity = clamp((this.speed - 210) / 130, 0, 1)
    ctx.strokeStyle = `rgba(190, 235, 255, ${0.12 * intensity})`
    ctx.lineWidth = 2
    for (let i = 0; i < 26; i++) {
      const x = ((i * 97.3) % W + W) % W
      const y = ((i * 211.7 + this.odometer * 2.6) % (H + 240)) - 120
      const len = 26 + (i % 5) * 18
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + len)
      ctx.stroke()
    }
  }

  drawEntities() {
    const ctx = this.ctx
    for (const e of this.entities) {
      if (e.kind === 'coin') this.drawCoin(e)
      else if (e.kind === 'heart') this.drawHeartPickup(e)
    }
    for (const e of this.entities) {
      if (e.kind === 'traffic') {
        this.drawCar(
          { x: e.x, y: e.y, w: e.w, h: e.h, angle: 0, color: e.color },
          false,
        )
      }
    }
  }

  drawCoin(e) {
    const ctx = this.ctx
    const wobble = Math.cos(this.time * 3.2 + e.seed)
    ctx.save()
    ctx.translate(e.x, e.y)
    ctx.scale(Math.max(0.25, Math.abs(wobble)), 1)
    ctx.shadowColor = '#ffce3d'
    ctx.shadowBlur = 20
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, e.r)
    g.addColorStop(0, '#fff6c8')
    g.addColorStop(0.5, '#ffd25a')
    g.addColorStop(1, '#e59a12')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, e.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = 'rgba(120, 70, 0, 0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, e.r * 0.62, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = 'rgba(120, 70, 0, 0.55)'
    ctx.fillRect(-e.r * 0.08, -e.r * 0.34, e.r * 0.16, e.r * 0.68)
    ctx.restore()
  }

  drawHeartPickup(e) {
    const ctx = this.ctx
    const pulse = 1 + Math.sin(this.time * 5 + e.seed) * 0.08
    ctx.save()
    ctx.translate(e.x, e.y)
    ctx.scale(pulse, pulse)
    ctx.shadowColor = '#ff5d9e'
    ctx.shadowBlur = 22
    ctx.fillStyle = '#ff5d9e'
    const r = e.r
    ctx.beginPath()
    ctx.moveTo(0, r * 0.75)
    ctx.bezierCurveTo(-r * 1.25, -r * 0.15, -r * 0.7, -r, 0, -r * 0.35)
    ctx.bezierCurveTo(r * 0.7, -r, r * 1.25, -r * 0.15, 0, r * 0.75)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.beginPath()
    ctx.arc(-r * 0.35, -r * 0.3, r * 0.16, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  drawPlayer() {
    const p = this.player
    if (!p) return
    const ctx = this.ctx
    ctx.save()
    if (this.invuln > 0 && this.state === 'playing') {
      ctx.globalAlpha = Math.sin(this.time * 34) > 0 ? 0.35 : 1
    }
    this.drawCar(p, true)
    ctx.restore()
  }

  drawCar(car, isPlayer) {
    const ctx = this.ctx
    const { w, h, color } = car
    const hw = w / 2
    const hh = h / 2

    ctx.save()
    ctx.translate(car.x, car.y)
    ctx.rotate(car.angle || 0)

    if (isPlayer) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const ug = ctx.createRadialGradient(0, hh * 0.15, 0, 0, hh * 0.15, w * 1.15)
      ug.addColorStop(0, 'rgba(45, 220, 255, 0.4)')
      ug.addColorStop(1, 'rgba(45, 220, 255, 0)')
      ctx.fillStyle = ug
      ctx.beginPath()
      ctx.ellipse(0, hh * 0.15, w * 1.15, h * 0.7, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const beam = ctx.createLinearGradient(0, -hh, 0, -hh - h * 2.4)
      beam.addColorStop(0, 'rgba(255, 246, 205, 0.18)')
      beam.addColorStop(1, 'rgba(255, 246, 205, 0)')
      ctx.fillStyle = beam
      ctx.beginPath()
      ctx.moveTo(-hw * 0.72, -hh * 0.95)
      ctx.lineTo(hw * 0.72, -hh * 0.95)
      ctx.lineTo(hw * 1.7, -hh - h * 2.4)
      ctx.lineTo(-hw * 1.7, -hh - h * 2.4)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    ctx.fillStyle = '#05060b'
    const wheelW = Math.max(4, w * 0.1)
    const wheelH = h * 0.22
    roundRectPath(ctx, -hw - wheelW * 0.55, -hh * 0.62, wheelW, wheelH, 2)
    ctx.fill()
    roundRectPath(ctx, hw - wheelW * 0.45, -hh * 0.62, wheelW, wheelH, 2)
    ctx.fill()
    roundRectPath(ctx, -hw - wheelW * 0.55, hh * 0.4, wheelW, wheelH, 2)
    ctx.fill()
    roundRectPath(ctx, hw - wheelW * 0.45, hh * 0.4, wheelW, wheelH, 2)
    ctx.fill()

    const body = ctx.createLinearGradient(-hw, 0, hw, 0)
    body.addColorStop(0, shade(color, -0.5))
    body.addColorStop(0.3, shade(color, 0.1))
    body.addColorStop(0.5, shade(color, 0.42))
    body.addColorStop(0.7, shade(color, 0.05))
    body.addColorStop(1, shade(color, -0.55))
    ctx.fillStyle = body
    ctx.shadowColor = isPlayer ? 'rgba(45, 220, 255, 0.7)' : 'rgba(0,0,0,0.55)'
    ctx.shadowBlur = isPlayer ? 22 : 10
    roundRectPath(ctx, -hw, -hh, w, h, w * 0.26)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    roundRectPath(ctx, -hw, -hh, w, h, w * 0.26)
    ctx.stroke()

    ctx.fillStyle = 'rgba(8, 16, 30, 0.92)'
    ctx.beginPath()
    ctx.moveTo(-hw * 0.72, -hh * 0.52)
    ctx.lineTo(hw * 0.72, -hh * 0.52)
    ctx.lineTo(hw * 0.56, -hh * 0.18)
    ctx.lineTo(-hw * 0.56, -hh * 0.18)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = 'rgba(8, 16, 30, 0.82)'
    ctx.beginPath()
    ctx.moveTo(-hw * 0.58, hh * 0.16)
    ctx.lineTo(hw * 0.58, hh * 0.16)
    ctx.lineTo(hw * 0.66, hh * 0.46)
    ctx.lineTo(-hw * 0.66, hh * 0.46)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.beginPath()
    ctx.moveTo(-hw * 0.72, -hh * 0.52)
    ctx.lineTo(hw * 0.72, -hh * 0.52)
    ctx.lineTo(hw * 0.66, -hh * 0.42)
    ctx.lineTo(-hw * 0.66, -hh * 0.42)
    ctx.closePath()
    ctx.fill()

    if (isPlayer) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
      roundRectPath(ctx, -w * 0.055, -hh * 0.9, w * 0.11, h * 0.8, w * 0.055)
      ctx.fill()
    }

    ctx.fillStyle = '#fff7d0'
    ctx.shadowColor = '#fff2b0'
    ctx.shadowBlur = 12
    roundRectPath(ctx, -hw * 0.74, -hh * 0.92, w * 0.22, h * 0.05, 2)
    ctx.fill()
    roundRectPath(ctx, hw * 0.52, -hh * 0.92, w * 0.22, h * 0.05, 2)
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.fillStyle = '#ff3b5c'
    ctx.shadowColor = '#ff2d55'
    ctx.shadowBlur = 14
    roundRectPath(ctx, -hw * 0.74, hh * 0.88, w * 0.24, h * 0.045, 2)
    ctx.fill()
    roundRectPath(ctx, hw * 0.5, hh * 0.88, w * 0.24, h * 0.045, 2)
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.restore()
  }

  drawParticles() {
    const ctx = this.ctx
    ctx.save()
    for (const p of this.particles) {
      const alpha = clamp(p.life / p.maxLife, 0, 1)
      ctx.globalAlpha = alpha
      if (p.glow) ctx.globalCompositeOperation = 'lighter'
      else ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    ctx.restore()
  }

  drawTexts() {
    const ctx = this.ctx
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const t of this.texts) {
      const alpha = clamp(t.life / t.maxLife, 0, 1)
      ctx.globalAlpha = alpha
      ctx.font = `700 ${t.size}px Rajdhani, system-ui, sans-serif`
      ctx.fillStyle = t.color
      ctx.shadowColor = t.color
      ctx.shadowBlur = 16
      ctx.fillText(t.text, t.x, t.y)
    }
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
    ctx.restore()
  }

  drawOverlayShade() {
    const ctx = this.ctx
    const { W, H } = this
    const top = ctx.createLinearGradient(0, 0, 0, H * 0.24)
    top.addColorStop(0, 'rgba(3, 6, 14, 0.62)')
    top.addColorStop(1, 'rgba(3, 6, 14, 0)')
    ctx.fillStyle = top
    ctx.fillRect(0, 0, W, H * 0.24)

    const bottom = ctx.createLinearGradient(0, H * 0.78, 0, H)
    bottom.addColorStop(0, 'rgba(3, 6, 14, 0)')
    bottom.addColorStop(1, 'rgba(3, 6, 14, 0.7)')
    ctx.fillStyle = bottom
    ctx.fillRect(0, H * 0.78, W, H * 0.22)

    const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.32, W / 2, H / 2, Math.max(W, H) * 0.78)
    vg.addColorStop(0, 'rgba(0, 0, 0, 0)')
    vg.addColorStop(1, 'rgba(0, 0, 0, 0.5)')
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, W, H)
  }

  destroy() {
    this.running = false
    cancelAnimationFrame(this.raf)
    window.removeEventListener('pointermove', this.handlePointer)
    this.canvas.removeEventListener('touchmove', this.handleTouch)
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    document.removeEventListener('visibilitychange', this.handleVisibility)
    this.resizeObserver?.disconnect()
  }
}
