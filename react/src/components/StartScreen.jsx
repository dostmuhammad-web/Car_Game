import {
  MouseIcon,
  PlayIcon,
  TrophyIcon,
  SoundOnIcon,
  SoundOffIcon,
  CoinIcon,
  CarIcon,
  HeartIcon,
} from './Icons.jsx'

export default function StartScreen({ best, onStart, muted, onToggleMute }) {
  return (
    <div className="overlay overlay--start">
      <div className="start">
        <div className="eyebrow">
          <span className="dot" />
          Arcade Race
        </div>
        <h1 className="title">
          NEON
          <span>DRIVE</span>
        </h1>
        <p className="tagline">
          Tungi shosse bo'ylab cheksiz poyga. Mashinani sichqoncha bilan boshqaring,
          tirbandlikdan sirg'alib o'ting va rekordni yangilang.
        </p>

        <div className="start__controls">
          <MouseIcon width={20} height={20} />
          <span>
            Sichqonchani <b>chapga-o'ngga</b> harakatlantiring
          </span>
        </div>

        <div className="start__row">
          <span className="best-chip">
            <TrophyIcon width={16} height={16} />
            Rekord: <b>{best.toLocaleString()}</b>
          </span>
        </div>

        <button className="btn btn--primary btn--xl" onClick={onStart}>
          <PlayIcon width={16} height={16} />
          POYGANI BOSHLASH
        </button>

        <div className="start__legend">
          <span>
            <CoinIcon width={15} height={15} /> Tangalar — ball
          </span>
          <span>
            <CarIcon width={15} height={15} /> Mashinalar — xavf
          </span>
          <span>
            <HeartIcon width={15} height={15} /> Yurak — hayot
          </span>
        </div>

        <div className="start__meta">
          <button className="link-btn" onClick={onToggleMute} type="button">
            {muted ? <SoundOffIcon width={15} height={15} /> : <SoundOnIcon width={15} height={15} />}
            Ovoz {muted ? "o'chirilgan" : 'yoqilgan'}
          </button>
          <span className="key-hint">
            <kbd>P</kbd> pauza
          </span>
        </div>
      </div>
    </div>
  )
}
