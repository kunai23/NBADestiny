import { useMemo, useState } from 'react'
import { useGame } from '../state/gameStore'
import type { Background, Position } from '../types'
import { computePotentialStars } from '../engine'

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'PG', label: 'Meneur (PG)' },
  { value: 'SG', label: 'Arrière (SG)' },
  { value: 'SF', label: 'Ailier (SF)' },
  { value: 'PF', label: 'Ailier fort (PF)' },
  { value: 'C', label: 'Pivot (C)' },
]

const BACKGROUNDS: { value: Background; label: string; desc: string }[] = [
  { value: 'HOOD', label: 'Enfant des quartiers populaires', desc: "Formé sur le bitume, une hargne et une créativité rares." },
  { value: 'NBA_LEGACY', label: "Fils d'un joueur NBA", desc: 'Un nom qui ouvre des portes, entouré du basket depuis le berceau.' },
  { value: 'SELF_MADE', label: "Révélé sur le tas", desc: "Repéré tardivement, tout est encore à prouver." },
]

function StarPreview({ stars }: { stars: number }) {
  return (
    <span className="star-preview" aria-label={`Potentiel : ${stars} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < stars ? 'star star-filled' : 'star'}>
          ★
        </span>
      ))}
    </span>
  )
}

export function CharacterCreation() {
  const { dispatch } = useGame()
  const [name, setName] = useState('')
  const [position, setPosition] = useState<Position>('PG')
  const [jerseyNumber, setJerseyNumber] = useState(23)
  const [background, setBackground] = useState<Background>('HOOD')
  const [hygiene, setHygiene] = useState(true)
  const [family, setFamily] = useState(true)
  const [friends, setFriends] = useState(true)

  const potential = useMemo(
    () => computePotentialStars(background, { hygiene, family, friends }),
    [background, hygiene, family, friends],
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    dispatch({
      type: 'CREATE_PLAYER',
      name: name.trim() || 'Rookie',
      position,
      jerseyNumber,
      background,
      hygiene,
      family,
      friends,
    })
  }

  return (
    <div className="screen">
      <div className="card creation-card">
        <h2>Crée ton joueur</h2>
        <form onSubmit={handleSubmit} className="creation-form">
          <label className="field">
            <span>Nom du joueur</span>
            <input
              type="text"
              value={name}
              maxLength={24}
              placeholder="Ex : Jordan Martin"
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Poste</span>
              <select value={position} onChange={(e) => setPosition(e.target.value as Position)}>
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Numéro de maillot</span>
              <input
                type="number"
                min={0}
                max={99}
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="field">
            <span>Ton histoire</span>
            <div className="option-cards">
              {BACKGROUNDS.map((b) => (
                <button
                  type="button"
                  key={b.value}
                  className={`option-card ${background === b.value ? 'option-card-selected' : ''}`}
                  onClick={() => setBackground(b.value)}
                >
                  <span className="option-card-label">{b.label}</span>
                  <span className="option-card-desc">{b.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Ton mode de vie</span>
            <div className="toggle-list">
              <ToggleRow
                label="Hygiène de vie"
                trueLabel="Rigoureuse"
                falseLabel="Relâchée"
                value={hygiene}
                onChange={setHygiene}
              />
              <ToggleRow
                label="Famille"
                trueLabel="Encadrante"
                falseLabel="Absente"
                value={family}
                onChange={setFamily}
              />
              <ToggleRow
                label="Entourage"
                trueLabel="Bonne bande de potes"
                falseLabel="Mauvaises fréquentations"
                value={friends}
                onChange={setFriends}
              />
            </div>
          </div>

          <div className="potential-preview">
            <span>Potentiel estimé</span>
            <StarPreview stars={potential} />
          </div>

          <button type="submit" className="btn btn-primary">
            Commencer l'histoire
          </button>
        </form>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  trueLabel,
  falseLabel,
  value,
  onChange,
}: {
  label: string
  trueLabel: string
  falseLabel: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="toggle-row">
      <span className="toggle-row-label">{label}</span>
      <div className="toggle-pair">
        <button
          type="button"
          className={`toggle-btn ${value ? 'toggle-btn-active' : ''}`}
          onClick={() => onChange(true)}
        >
          {trueLabel}
        </button>
        <button
          type="button"
          className={`toggle-btn ${!value ? 'toggle-btn-active' : ''}`}
          onClick={() => onChange(false)}
        >
          {falseLabel}
        </button>
      </div>
    </div>
  )
}
