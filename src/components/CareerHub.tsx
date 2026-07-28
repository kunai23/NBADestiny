import { useGame } from '../state/gameStore'
import { PlayerCard } from './PlayerCard'
import { STAGE_LABELS } from '../data'

export function CareerHub() {
  const { state, dispatch } = useGame()
  const { player, season, lastGameResult, lastEventResultText } = state
  if (!player || !season) return null

  const nextGame = season.schedule[season.currentGameIndex]
  const seasonOver = season.currentGameIndex >= season.schedule.length

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

        {lastEventResultText && (
          <div className="card result-card">
            <p>{lastEventResultText}</p>
          </div>
        )}

        {lastGameResult && (
          <div className={`card result-card ${lastGameResult.won ? 'result-win' : 'result-loss'}`}>
            <p className="result-title">{lastGameResult.won ? 'Victoire' : 'Défaite'} vs {lastGameResult.opponent}</p>
            <p className="result-score">
              {season.team.name} {lastGameResult.teamScore} - {lastGameResult.oppScore} {lastGameResult.opponent}
            </p>
            {lastGameResult.playerStatline && (
              <p className="result-stats">
                Ta ligne de stats : {lastGameResult.playerStatline.pts} PTS · {lastGameResult.playerStatline.reb} REB ·{' '}
                {lastGameResult.playerStatline.ast} PAS
              </p>
            )}
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
