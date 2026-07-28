import type { PlayerProfile } from '../types'
import { playerOverall } from '../engine'

const ATTR_LIST: { key: keyof PlayerProfile['attributes']; label: string }[] = [
  { key: 'shooting', label: 'Tir' },
  { key: 'playmaking', label: 'Passe' },
  { key: 'defense', label: 'Défense' },
  { key: 'athleticism', label: 'Athlétisme' },
  { key: 'iq', label: 'QI Basket' },
  { key: 'charisma', label: 'Charisme' },
]

export function PlayerCard({ player }: { player: PlayerProfile }) {
  const overall = playerOverall(player.attributes)
  return (
    <div className="player-card">
      <div className="player-card-header">
        <div>
          <h3>{player.name}</h3>
          <p className="player-meta">
            #{player.jerseyNumber} · {player.position} · {player.origin === 'USA' ? 'USA' : 'Europe'} · {player.age} ans
          </p>
        </div>
        <div className="overall-badge">{overall}</div>
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
