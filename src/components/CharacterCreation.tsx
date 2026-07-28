import { useState } from 'react'
import { useGame } from '../state/gameStore'
import type { Position } from '../types'

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'PG', label: 'Meneur (PG)' },
  { value: 'SG', label: 'Arrière (SG)' },
  { value: 'SF', label: 'Ailier (SF)' },
  { value: 'PF', label: 'Ailier fort (PF)' },
  { value: 'C', label: 'Pivot (C)' },
]

export function CharacterCreation() {
  const { dispatch } = useGame()
  const [name, setName] = useState('')
  const [position, setPosition] = useState<Position>('PG')
  const [jerseyNumber, setJerseyNumber] = useState(23)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    dispatch({ type: 'CREATE_PLAYER', name: name.trim() || 'Rookie', position, jerseyNumber })
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

          <button type="submit" className="btn btn-primary">
            Commencer l'histoire
          </button>
        </form>
      </div>
    </div>
  )
}
