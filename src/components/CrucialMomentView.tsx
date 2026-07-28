import { useGame } from '../state/gameStore'
import { CRUCIAL_MOMENTS } from '../data/crucialMoments'

export function CrucialMomentView() {
  const { state, dispatch } = useGame()
  const cm = CRUCIAL_MOMENTS.find((c) => c.id === state.pendingCrucialMomentId)
  const game = state.season?.schedule[state.season.currentGameIndex]

  if (!cm) return null

  return (
    <div className="screen">
      <div className="card crucial-card">
        <span className="badge badge-crucial">MOMENT DÉCISIF</span>
        {game && (
          <p className="crucial-opponent">
            vs {game.opponent} — {state.season?.team.name}
          </p>
        )}
        <h2>{cm.title}</h2>
        <p className="story-body">{cm.body}</p>
        <div className="choice-list">
          {cm.choices.map((choice) => (
            <button
              key={choice.id}
              className="choice-btn choice-btn-crucial"
              onClick={() => dispatch({ type: 'CHOOSE_CRUCIAL_OPTION', choiceId: choice.id })}
            >
              <span className="choice-text">{choice.text}</span>
              <span className="choice-effect">Chance de réussite : {Math.round(choice.successChance * 100)}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
