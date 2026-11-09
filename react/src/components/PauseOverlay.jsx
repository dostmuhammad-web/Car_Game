import { HomeIcon, PlayIcon, RestartIcon } from './Icons.jsx'

export default function PauseOverlay({ onResume, onRestart, onMenu }) {
  return (
    <div className="overlay">
      <div className="panel">
        <span className="eyebrow">Tanaffus</span>
        <h2>PAUZA</h2>
        <p className="panel__text">Nafas oling. Davom etishga tayyormisiz?</p>
        <div className="panel__actions">
          <button className="btn btn--primary" onClick={onResume} type="button">
            <PlayIcon width={15} height={15} /> Davom etish
          </button>
          <button className="btn btn--ghost" onClick={onRestart} type="button">
            <RestartIcon width={15} height={15} /> Qayta boshlash
          </button>
          <button className="btn btn--ghost" onClick={onMenu} type="button">
            <HomeIcon width={15} height={15} /> Bosh menyu
          </button>
        </div>
      </div>
    </div>
  )
}
