import { useGame } from '../state/gameStore'
import { getStoryEventById } from '../data'

const ATTR_LABELS: Record<string, string> = {
  shooting: 'Tir',
  playmaking: 'Passe',
  defense: 'Défense',
  athleticism: 'Athlétisme',
  iq: 'QI Basket',
  charisma: 'Charisme',
}

function effectSummary(effect: Record<string, number | string | undefined>): string {
  const parts: string[] = []
  for (const [key, value] of Object.entries(effect)) {
    if (key === 'flag' || typeof value !== 'number' || value === 0) continue
    const label = ATTR_LABELS[key] ?? (key === 'reputation' ? 'Réputation' : key === 'morale' ? 'Moral' : key === 'energy' ? 'Énergie' : key)
    parts.push(`${label} ${value > 0 ? '+' : ''}${value}`)
  }
  return parts.join(' · ')
}

export function StoryEventView() {
  const { state, dispatch } = useGame()
  const event = state.pendingStoryEventId ? getStoryEventById(state.pendingStoryEventId) : null

  if (!event) return null

  return (
    <div className="screen">
      <div className="card story-card">
        <h2>{event.title}</h2>
        <p className="story-body">{event.body}</p>
        <div className="choice-list">
          {event.choices.map((choice) => (
            <button
              key={choice.id}
              className="choice-btn"
              onClick={() => dispatch({ type: 'CHOOSE_STORY_OPTION', choiceId: choice.id })}
            >
              <span className="choice-text">{choice.text}</span>
              {effectSummary(choice.effect) && (
                <span className="choice-effect">{effectSummary(choice.effect)}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
