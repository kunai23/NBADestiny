import { useGame, hasSavedGame } from '../state/gameStore'

export function Landing() {
  const { dispatch } = useGame()
  const canContinue = hasSavedGame()

  return (
    <div className="screen landing-screen">
      <div className="landing-hero">
        <span className="badge">CARRIÈRE BASKET</span>
        <h1>
          HOOP <span className="accent">DESTINY</span>
        </h1>
        <p className="tagline">
          Crée ton joueur, choisis ton parcours entre les États-Unis et l'Europe, et écris ta légende
          match après match, décision après décision.
        </p>
        <div className="landing-actions">
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'NEW_GAME' })}>
            Nouvelle carrière
          </button>
          {canContinue && (
            <button className="btn btn-secondary" onClick={() => dispatch({ type: 'RESTART' })}>
              Effacer la sauvegarde
            </button>
          )}
        </div>
      </div>
      <div className="landing-leagues">
        <div className="league-pill">🏀 NBA</div>
        <div className="league-pill">🇪🇺 EuroLigue</div>
        <div className="league-pill">🎓 NCAA</div>
        <div className="league-pill">🏫 Lycée USA</div>
        <div className="league-pill">🌟 Académie Europe</div>
      </div>
    </div>
  )
}
