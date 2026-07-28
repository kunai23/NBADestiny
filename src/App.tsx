import './App.css'
import { useGame } from './state/gameStore'
import { Landing } from './components/Landing'
import { CharacterCreation } from './components/CharacterCreation'
import { StoryEventView } from './components/StoryEventView'
import { CareerHub } from './components/CareerHub'
import { CrucialMomentView } from './components/CrucialMomentView'
import { SeasonSummary } from './components/SeasonSummary'
import { CareerEnd } from './components/CareerEnd'

function App() {
  const { state } = useGame()

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="logo">🏀 HOOP DESTINY</span>
      </header>
      <main className="app-main">
        {state.phase === 'landing' && <Landing />}
        {state.phase === 'creation' && <CharacterCreation />}
        {state.phase === 'story_event' && <StoryEventView />}
        {state.phase === 'hub' && <CareerHub />}
        {state.phase === 'crucial_moment' && <CrucialMomentView />}
        {state.phase === 'season_summary' && <SeasonSummary />}
        {state.phase === 'career_end' && <CareerEnd />}
      </main>
    </div>
  )
}

export default App
