import { useGame } from '../state/gameStore'
import { generateHeadline, STAGE_LABELS } from '../data'
import { contractCurrency, formatMoney, playerOverall, seasonAverages } from '../engine'

export function SeasonSummary() {
  const { state, dispatch } = useGame()
  const { season, player, lastSeasonAwards, lastSeasonIncome, lastNewspaperName, lastSatiricalNews, lastSponsorText } = state
  if (!season || !player) return null

  const avg = seasonAverages(season)
  const currency = contractCurrency(season.stage)
  const gamesPlayed = season.wins + season.losses
  const winPct = gamesPlayed > 0 ? season.wins / gamesPlayed : 0
  const objectiveMet = winPct >= season.objectiveWinPct
  const isMvp = lastSeasonAwards.some((a) => a.startsWith('MVP de la saison'))
  const headline = generateHeadline(season.wins, season.losses, isMvp, player.name)

  return (
    <div className="screen">
      <div className="card newspaper-card">
        <div className="newspaper-masthead">
          <span className="newspaper-name">{lastNewspaperName ?? 'La Gazette du Panier'}</span>
          <span className="newspaper-date">{STAGE_LABELS[season.stage]} · Saison {season.seasonNumber}</span>
        </div>
        <h2 className="newspaper-headline">{headline}</h2>
        <p className="newspaper-byline">
          {season.team.name} termine la saison avec un bilan de <strong>{season.wins}</strong> victoires et{' '}
          <strong>{season.losses}</strong> défaites.
        </p>

        <div className={`objective-banner ${objectiveMet ? 'objective-met' : 'objective-missed'}`}>
          <span className="objective-label">Objectif de la franchise : {season.objectiveLabel}</span>
          <span className="objective-result">{objectiveMet ? 'Rempli ✅' : 'Manqué ❌'}</span>
        </div>

        {lastSeasonIncome > 0 && (
          <div className="award-banner">💰 Revenus de la saison : {formatMoney(lastSeasonIncome, currency)}</div>
        )}
        {lastSponsorText && <div className="award-banner">🤝 {lastSponsorText}</div>}

        <div className="season-stats-grid summary-season-stats">
          <StatBox label="PTS/match" value={avg.ppg} />
          <StatBox label="REB/match" value={avg.rpg} />
          <StatBox label="PAS/match" value={avg.apg} />
          <StatBox label="CTR/match" value={avg.bpg} />
        </div>

        {lastSeasonAwards.length > 0 && (
          <div className="awards-list">
            <h3>Récompenses de la saison</h3>
            <ul>
              {lastSeasonAwards.map((a, i) => (
                <li key={i} className="award-banner">🏆 {a}</li>
              ))}
            </ul>
          </div>
        )}

        {season.highlights.length > 0 && (
          <div className="awards-list">
            <h3>Faits marquants de la saison</h3>
            <ul>
              {season.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="summary-stats">
          <div>
            <span className="summary-label">Overall joueur</span>
            <span className="summary-value">{playerOverall(player.attributes)}</span>
          </div>
          <div>
            <span className="summary-label">Âge</span>
            <span className="summary-value">{player.age} ans</span>
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

        {lastSatiricalNews && <p className="newspaper-filler">{lastSatiricalNews}</p>}

        <button className="btn btn-primary" onClick={() => dispatch({ type: 'CONTINUE_CAREER' })}>
          Continuer la carrière
        </button>
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
