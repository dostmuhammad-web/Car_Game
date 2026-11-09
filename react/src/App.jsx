import { useCallback, useEffect, useRef, useState } from 'react'
import { GameEngine } from './game/engine.js'
import { audio } from './game/audio.js'
import StartScreen from './components/StartScreen.jsx'
import HUD from './components/HUD.jsx'
import Countdown from './components/Countdown.jsx'
import PauseOverlay from './components/PauseOverlay.jsx'
import GameOverScreen from './components/GameOverScreen.jsx'
import {
  CarIcon,
  HeartIcon,
  MouseIcon,
  SoundOffIcon,
  SoundOnIcon,
} from './components/Icons.jsx'

const INITIAL_STATS = {
  score: 0,
  best: 0,
  health: 3,
  maxHealth: 3,
  combo: 1,
  speed: 0,
  coins: 0,
  distance: 0,
}

export default function App() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const [state, setState] = useState('menu')
  const [stats, setStats] = useState(INITIAL_STATS)
  const [countdown, setCountdown] = useState(null)
  const [result, setResult] = useState(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const engine = new GameEngine(canvasRef.current, {
      audio,
      onState: (next) => setState(next),
      onStats: (next) => setStats(next),
      onCountdown: (value) => setCountdown(value),
      onGameOver: (payload) => setResult(payload),
    })
    engineRef.current = engine
    if (import.meta.env.DEV) window.__neonDrive = engine
    return () => {
      engine.destroy()
      if (import.meta.env.DEV) delete window.__neonDrive
    }
  }, [])

  useEffect(() => {
    if (countdown === 0) {
      const timer = setTimeout(() => setCountdown(null), 650)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleStart = useCallback(() => {
    audio.init()
    audio.setMuted(muted)
    setResult(null)
    setCountdown(null)
    engineRef.current?.start()
  }, [muted])

  const handlePause = useCallback(() => engineRef.current?.pause(), [])
  const handleResume = useCallback(() => engineRef.current?.resume(), [])
  const handleRestart = useCallback(() => {
    audio.init()
    audio.setMuted(muted)
    setResult(null)
    setCountdown(null)
    engineRef.current?.start()
  }, [muted])
  const handleMenu = useCallback(() => {
    setResult(null)
    setCountdown(null)
    engineRef.current?.toMenu()
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      audio.setMuted(next)
      return next
    })
  }, [])

  const showHud = state === 'playing' || state === 'paused' || state === 'countdown'

  return (
    <div className="app">
      <div className="app__bg" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">◈</span>
          <span className="brand__text">
            NEON<span>DRIVE</span>
          </span>
        </div>
        <div className="topbar__right">
          <span className="topbar__hint">Sichqoncha bilan boshqaring</span>
          <button
            className="icon-btn"
            onClick={toggleMute}
            type="button"
            title={muted ? 'Ovozni yoqish' : "Ovozni o'chirish"}
            aria-label={muted ? 'Ovozni yoqish' : "Ovozni o'chirish"}
          >
            {muted ? <SoundOffIcon /> : <SoundOnIcon />}
          </button>
        </div>
      </header>

      <main className="stage-wrap">
        <div className="stage">
          <canvas ref={canvasRef} className="stage__canvas" />
          <div className="stage__scanlines" aria-hidden="true" />

          {showHud && (
            <HUD
              stats={stats}
              onPause={handlePause}
              muted={muted}
              onToggleMute={toggleMute}
            />
          )}

          {state === 'menu' && (
            <StartScreen
              best={stats.best}
              onStart={handleStart}
              muted={muted}
              onToggleMute={toggleMute}
            />
          )}

          <Countdown value={countdown} />

          {state === 'paused' && (
            <PauseOverlay
              onResume={handleResume}
              onRestart={handleRestart}
              onMenu={handleMenu}
            />
          )}

          {state === 'over' && (
            <GameOverScreen
              result={result}
              onRestart={handleRestart}
              onMenu={handleMenu}
            />
          )}
        </div>

        <section className="info" aria-label="O'yin qoidalari">
          <article className="feature">
            <span className="feature__icon">
              <MouseIcon width={19} height={19} />
            </span>
            <div>
              <h3>Sichqoncha boshqaruvi</h3>
              <p>Kursor qayerga ketsa, mashina shu tomonga silliq buriladi.</p>
            </div>
          </article>
          <article className="feature">
            <span className="feature__icon">
              <CarIcon width={19} height={19} />
            </span>
            <div>
              <h3>Tirbandlikdan o't</h3>
              <p>Sekin ketayotgan mashinalardan chetlab o'ting — yaqin masofa bonus beradi.</p>
            </div>
          </article>
          <article className="feature">
            <span className="feature__icon">
              <HeartIcon width={19} height={19} />
            </span>
            <div>
              <h3>Tangalar va yuraklar</h3>
              <p>Tangalar komboni oshiradi, yuraklar esa yo'qolgan hayotni tiklaydi.</p>
            </div>
          </article>
        </section>
      </main>

      <footer className="footer">
        Neon Drive — React va Canvas bilan qurilgan arkada poyga. Omad tilaymiz!
      </footer>
    </div>
  )
}
