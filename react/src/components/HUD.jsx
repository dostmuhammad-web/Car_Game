import {
  CoinIcon,
  HeartIcon,
  PauseIcon,
  SoundOnIcon,
  SoundOffIcon,
} from './Icons.jsx'

function Hearts({ health, max }) {
  return Array.from({ length: max }).map((_, i) => (
    <HeartIcon
      key={i}
      width={20}
      height={20}
      filled={i < health}
      className={i < health ? 'heart is-full' : 'heart is-empty'}
    />
  ))
}

export default function HUD({ stats, onPause, muted, onToggleMute }) {
  const speedPct = Math.max(0, Math.min(100, (stats.speed / 340) * 100))

  return (
    <div className="hud">
      <div className="hud__top">
        <div className="hud-card hud-card--score">
          <span className="hud-label">Ball</span>
          <span className="hud-score">{stats.score.toLocaleString()}</span>
          <span className="hud-best">
            Rekord <b>{stats.best.toLocaleString()}</b>
          </span>
        </div>

        {stats.combo > 1 ? (
          <div className="combo" key={stats.combo}>
            <span>x{stats.combo}</span>
            <small>kombo</small>
          </div>
        ) : (
          <div className="combo-spacer" />
        )}

        <div className="hud-actions">
          <button
            className="icon-btn"
            onClick={onToggleMute}
            type="button"
            title={muted ? 'Ovozni yoqish' : "Ovozni o'chirish"}
          >
            {muted ? <SoundOffIcon /> : <SoundOnIcon />}
          </button>
          <button className="icon-btn" onClick={onPause} type="button" title="Pauza">
            <PauseIcon />
          </button>
        </div>
      </div>

      <div className="hud__bottom">
        <div className="hud-card hud-card--health">
          <span className="hud-label">Hayot</span>
          <div className="hearts">
            <Hearts health={stats.health} max={stats.maxHealth} />
          </div>
        </div>

        <div className="hud-card hud-card--speed">
          <div className="speed-top">
            <span className="hud-label">Tezlik</span>
            <span className="speed-value">
              {stats.speed}
              <small>km/h</small>
            </span>
          </div>
          <div className="speed-bar">
            <span style={{ width: `${speedPct}%` }} />
          </div>
          <span className="hud-coins">
            <CoinIcon width={14} height={14} /> {stats.coins}
          </span>
        </div>
      </div>
    </div>
  )
}
