import { HomeIcon, RestartIcon, TrophyIcon } from './Icons.jsx'

export default function GameOverScreen({ result, onRestart, onMenu }) {
  if (!result) return null

  return (
    <div className="overlay">
      <div className="panel panel--over">
        {result.newBest && <div className="newbest">Yangi rekord</div>}
        <span className="eyebrow">Poyga yakunlandi</span>
        <h2>O'YIN TUGADI</h2>

        <div className="result-grid">
          <div className="result">
            <span>Ball</span>
            <b>{result.score.toLocaleString()}</b>
          </div>
          <div className="result">
            <span>Tangalar</span>
            <b>{result.coins}</b>
          </div>
          <div className="result">
            <span>Masofa</span>
            <b>
              {result.distance.toLocaleString()}
              <small>m</small>
            </b>
          </div>
        </div>

        <div className="best-line">
          <TrophyIcon width={16} height={16} />
          Eng yaxshi natija: <b>{result.best.toLocaleString()}</b>
        </div>

        <div className="panel__actions">
          <button className="btn btn--primary" onClick={onRestart} type="button">
            <RestartIcon width={15} height={15} /> Yana o'ynash
          </button>
          <button className="btn btn--ghost" onClick={onMenu} type="button">
            <HomeIcon width={15} height={15} /> Bosh menyu
          </button>
        </div>
      </div>
    </div>
  )
}
