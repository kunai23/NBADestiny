import type { CareerStage, PlayerProfile } from '../types'
import { contractCurrency, formatMoney, playerOverall } from '../engine'

const ATTR_LIST: { key: keyof PlayerProfile['attributes']; label: string }[] = [
  { key: 'shooting', label: 'Tir' },
  { key: 'playmaking', label: 'Passe' },
  { key: 'defense', label: 'Défense' },
  { key: 'athleticism', label: 'Athlétisme' },
  { key: 'iq', label: 'QI Basket' },
  { key: 'charisma', label: 'Charisme' },
]

const BACKGROUND_LABELS: Record<PlayerProfile['background'], string> = {
  HOOD: 'Quartiers populaires',
  NBA_LEGACY: "Fils d'un joueur NBA",
  SELF_MADE: 'Révélé sur le tas',
}

const LIFESTYLE_LABELS: Record<PlayerProfile['lifestyle'], string> = {
  hygiene: 'Hygiène de vie rigoureuse',
  family: 'Famille encadrante',
  friends: 'Bonne bande de potes',
}

function Stars({ count }: { count: number }) {
  return (
    <span className="star-preview" aria-label={`Potentiel : ${count} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? 'star star-filled' : 'star'}>
          ★
        </span>
      ))}
    </span>
  )
}

export function PlayerCard({ player, stage }: { player: PlayerProfile; stage?: CareerStage }) {
  const overall = playerOverall(player.attributes)
  const currency = contractCurrency(stage ?? 'NBA')
  return (
    <div className="player-card">
      <div className="player-card-header">
        <div>
          <h3>{player.name}</h3>
          <p className="player-meta">
            #{player.jerseyNumber} · {player.position} · {player.origin === 'USA' ? 'USA' : 'Europe'} · {player.age} ans
          </p>
          <p className="player-background">{BACKGROUND_LABELS[player.background]}</p>
          <p className="player-lifestyle">{LIFESTYLE_LABELS[player.lifestyle]}</p>
        </div>
        <div className="overall-badge">{overall}</div>
      </div>
      <div className="potential-row">
        <span>Potentiel</span>
        <Stars count={player.potentialStars} />
      </div>
      <div className="contract-box">
        {player.contract > 0 ? (
          <>
            <span className="contract-label">Contrat annuel</span>
            <span className="contract-value">{formatMoney(player.contract, currency)}</span>
          </>
        ) : (
          <span className="contract-label">Statut amateur — pas de salaire</span>
        )}
        {player.careerEarnings > 0 && (
          <span className="contract-earnings">Cumul carrière : {formatMoney(player.careerEarnings, currency)}</span>
        )}
      </div>
      <div className="meter-row">
        <Meter label="Réputation" value={player.reputation} />
        <Meter label="Moral" value={player.morale} />
        <Meter label="Énergie" value={player.energy} />
      </div>
      <div className="attr-grid">
        {ATTR_LIST.map((a) => (
          <div className="attr-item" key={a.key}>
            <span className="attr-label">{a.label}</span>
            <div className="attr-bar">
              <div className="attr-bar-fill" style={{ width: `${player.attributes[a.key]}%` }} />
            </div>
            <span className="attr-value">{player.attributes[a.key]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="meter">
      <span>{label}</span>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
