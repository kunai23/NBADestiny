import { useGame } from '../state/gameStore'
import { computeLegacyRating, playerOverall } from '../engine'

export function CareerEnd() {
  const { state, dispatch } = useGame()
  const { player, awards, seasonHistory } = state
  if (!player) return null

  const legacy = computeLegacyRating(player, awards, seasonHistory)
  const totalWins = seasonHistory.reduce((a, s) => a + s.wins, 0)
  const totalLosses = seasonHistory.reduce((a, s) => a + s.losses, 0)

  return (
    <div className="screen">
      <div className="card end-card">
        <span className="badge">Fin de carrière</span>
        <h2>{player.name}</h2>
        <p className="tagline">Une carrière qui restera gravée dans les mémoires du basket.</p>

        <div className="summary-stats">
          <div>
            <span className="summary-label">Note de légende</span>
            <span className="summary-value">{legacy}</span>
          </div>
          <div>
            <span className="summary-label">Overall final</span>
            <span className="summary-value">{playerOverall(player.attributes)}</span>
          </div>
          <div>
            <span className="summary-label">Bilan total</span>
            <span className="summary-value">{totalWins}V - {totalLosses}D</span>
          </div>
        </div>

        {awards.length > 0 && (
          <div className="awards-list">
            <h3>Palmarès</h3>
            <ul>
              {awards.map((a, i) => (
                <li key={i}>🏆 {a}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="season-history">
          <h3>Parcours de carrière</h3>
          <ul>
            {seasonHistory.map((s, i) => (
              <li key={i}>
                Saison {s.seasonNumber} · {s.stage} · {s.wins}V-{s.losses}D
              </li>
            ))}
          </ul>
        </div>

        <button className="btn btn-primary" onClick={() => dispatch({ type: 'RESTART' })}>
          Commencer une nouvelle carrière
        </button>
      </div>
    </div>
  )
}
