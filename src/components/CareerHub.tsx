import { useGame } from '../state/gameStore'
import { PlayerCard } from './PlayerCard'
import { STAGE_LABELS } from '../data'
import { seasonAverages } from '../engine'

export function CareerHub() {
  const { state, dispatch } = useGame()
  const { player, season, lastGameResult, lastEventResultText, lastCrucialSuccess } = state
  if (!player || !season) return null

  const nextGame = season.schedule[season.currentGameIndex]
  const seasonOver = season.currentGameIndex >= season.schedule.length
  const gamesPlayed = season.wins + season.losses
  const avg = seasonAverages(season)

  return (
    <div className="screen hub-screen">
      <div className="hub-sidebar">
        <PlayerCard player={player} />
      </div>
      <div className="hub-main">
        <div className="card team-card">
          <span className="badge">{STAGE_LABELS[season.stage]} · Saison {season.seasonNumber}</span>
          <h2>{season.team.name}</h2>
          <p className="team-record">
            Bilan : <strong>{season.wins}</strong> victoires - <strong>{season.losses}</strong> défaites
          </p>
        </div>

        <div className="card season-stats-card">
          <h3>Tes statistiques de saison</h3>
          {gamesPlayed > 0 ? (
            <div className="season-stats-grid">
              <StatBox label="Points" value={avg.ppg} />
              <StatBox label="Rebonds" value={avg.rpg} />
              <StatBox label="Passes" value={avg.apg} />
              <StatBox label="Contres" value={avg.bpg} />
            </div>
          ) : (
            <p className="season-stats-empty">Tes moyennes apparaîtront après ton premier match.</p>
          )}
        </div>

        {lastEventResultText && (
          <div className="card result-card">
            {lastCrucialSuccess !== null && (
              <span className={`crucial-outcome-badge ${lastCrucialSuccess ? 'crucial-outcome-success' : 'crucial-outcome-fail'}`}>
                {lastCrucialSuccess ? '✅ Action réussie' : '❌ Action manquée'}
              </span>
            )}
            <p>{lastEventResultText}</p>
          </div>
        )}

        {lastGameResult && (
          <div className={`card result-card ${lastGameResult.won ? 'result-win' : 'result-loss'}`}>
            <p className="result-title">{lastGameResult.won ? 'Victoire' : 'Défaite'} vs {lastGameResult.opponent}</p>
            <p className="result-score">
              {season.team.name} {lastGameResult.teamScore} - {lastGameResult.oppScore} {lastGameResult.opponent}
            </p>
          </div>
        )}

        <div className="card schedule-card">
          <h3>Calendrier</h3>
          <ul className="schedule-list">
            {season.schedule.map((g, idx) => (
              <li
                key={idx}
                className={`schedule-item ${g.played ? (g.won ? 'played-win' : 'played-loss') : ''} ${
                  idx === season.currentGameIndex && !g.played ? 'schedule-next' : ''
                }`}
              >
                <span>
                  {idx + 1}. vs {g.opponent} {g.isCrucial && <span className="crucial-tag">DÉCISIF</span>}
                </span>
                <span>
                  {g.played ? `${g.teamScore} - ${g.oppScore}` : '—'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hub-actions">
          {!seasonOver ? (
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'NEXT_GAME' })}>
              {nextGame?.isCrucial ? 'Aborder le prochain match décisif' : 'Jouer le prochain match'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'CONTINUE_CAREER' })}>
              Voir le bilan de saison
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-box">
      <span className="stat-box-value">{value.toFixed(1)}</span>
      <span className="stat-box-label">{label}</span>
    </div>
  )
}
