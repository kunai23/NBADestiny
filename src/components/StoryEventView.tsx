import { useGame } from '../state/gameStore'
import { getStoryEventById } from '../data'

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
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
