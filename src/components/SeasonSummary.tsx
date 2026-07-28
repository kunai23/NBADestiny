import { useGame } from '../state/gameStore'
import { STAGE_LABELS } from '../data'
import { playerOverall } from '../engine'

export function SeasonSummary() {
  const { state, dispatch } = useGame()
  const { season, player, awards } = state
  if (!season || !player) return null

  const latestAward = awards[awards.length - 1]
  const wasAwardedThisSeason = latestAward && state.seasonHistory.length > 0

  return (
    <div className="screen">
      <div className="card summary-card">
        <span className="badge">Bilan de saison</span>
        <h2>{STAGE_LABELS[season.stage]} — Saison {season.seasonNumber}</h2>
        <p className="summary-record">
          {season.team.name} termine la saison avec un bilan de <strong>{season.wins}</strong> victoires et{' '}
          <strong>{season.losses}</strong> défaites.
        </p>

        {wasAwardedThisSeason && (
          <div className="award-banner">🏆 {latestAward}</div>
        )}

        <div className="summary-stats">
          <div>
            <span className="summary-label">Overall joueur</span>
            <span className="summary-value">{playerOverall(player.attributes)}</span>
          </div>
          <div>
            <span className="summary-label">Réputation</span>
            <span className="summary-value">{player.reputation}</span>
          </div>
          <div>
            <span className="summary-label">Moral</span>
            <span className="summary-value">{player.morale}</span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => dispatch({ type: 'CONTINUE_CAREER' })}>
          Continuer la carrière
        </button>
      </div>
    </div>
  )
}
