import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type {
  CareerStage,
  GameState,
  League,
  Position,
  SeasonState,
} from '../types'
import {
  getStoryEventById,
  pickRandomCrucialMoment,
  pickRandomInterstitial,
  STAGE_LABELS,
} from '../data'
import { CRUCIAL_MOMENTS } from '../data/crucialMoments'
import {
  applyChoiceEffect,
  computeTeamOverall,
  generateSchedule,
  ownTeamNameFor,
  resolveCrucialGame,
  simulateCrucialGameBase,
  simulateRegularGame,
} from '../engine'

const STORAGE_KEY = 'nba-destiny-save-v1'

function initialState(): GameState {
  return {
    phase: 'landing',
    player: null,
    season: null,
    pendingStoryEventId: null,
    storyContext: null,
    storyQueue: [],
    completedEventIds: [],
    usedCrucialMomentIds: [],
    stageHistoryCount: {},
    pendingCrucialMomentId: null,
    pendingCrucialBase: null,
    lastGameResult: null,
    lastEventResultText: null,
    flags: {},
    careerLog: [],
    awards: [],
    seasonHistory: [],
  }
}

type Action =
  | { type: 'NEW_GAME' }
  | { type: 'CONTINUE_SAVED' }
  | { type: 'CREATE_PLAYER'; name: string; position: Position; jerseyNumber: number }
  | { type: 'CHOOSE_STORY_OPTION'; choiceId: string }
  | { type: 'NEXT_GAME' }
  | { type: 'CHOOSE_CRUCIAL_OPTION'; choiceId: string }
  | { type: 'CONTINUE_CAREER' }
  | { type: 'RESTART' }

const TRANSITION_NEXT_STAGE: Record<string, CareerStage> = {
  transition_us_hs_to_college: 'US_COLLEGE',
  transition_us_college_to_draft: 'NBA',
  transition_euro_academy1_to_academy2: 'EURO_ACADEMY',
  transition_euro_academy2_to_draft: 'EUROLEAGUE',
}

function buildSeason(stage: CareerStage, seasonNumber: number, player: GameState['player']): SeasonState {
  const overall = computeTeamOverall(stage, player!, seasonNumber)
  return {
    stage,
    seasonNumber,
    team: { name: ownTeamNameFor(stage), league: stage as League, overall },
    schedule: generateSchedule(stage, seasonNumber, player!),
    currentGameIndex: 0,
    wins: 0,
    losses: 0,
  }
}

function computeAwards(existing: string[], season: SeasonState): string[] {
  const awards = [...existing]
  const label = STAGE_LABELS[season.stage]
  if (season.wins === season.schedule.length) {
    awards.push(`Saison invaincue - ${label} (saison ${season.seasonNumber})`)
  } else if (season.wins - season.losses >= 4) {
    awards.push(`Saison brillante - ${label} (${season.wins}-${season.losses})`)
  }
  return awards
}

function finalizeSeason(state: GameState, season: SeasonState): Partial<GameState> {
  return {
    season,
    phase: 'season_summary',
    stageHistoryCount: {
      ...state.stageHistoryCount,
      [season.stage]: (state.stageHistoryCount[season.stage] ?? 0) + 1,
    },
    seasonHistory: [
      ...state.seasonHistory,
      { stage: season.stage, seasonNumber: season.seasonNumber, wins: season.wins, losses: season.losses },
    ],
    awards: computeAwards(state.awards, season),
    pendingStoryEventId: null,
    storyContext: null,
  }
}

function advanceToNextGame(state: GameState): Partial<GameState> {
  const season = state.season!
  const idx = season.currentGameIndex
  if (idx >= season.schedule.length) {
    return finalizeSeason(state, season)
  }
  const game = season.schedule[idx]
  if (game.isCrucial) {
    const base = simulateCrucialGameBase(season.stage, state.player!, season.seasonNumber)
    const cm = pickRandomCrucialMoment(state.usedCrucialMomentIds)
    return {
      phase: 'crucial_moment',
      pendingCrucialMomentId: cm.id,
      pendingCrucialBase: base,
      usedCrucialMomentIds: [...state.usedCrucialMomentIds, cm.id],
      pendingStoryEventId: null,
      storyContext: null,
    }
  }
  const result = simulateRegularGame(season.stage, state.player!, season.seasonNumber)
  const newSchedule = [...season.schedule]
  newSchedule[idx] = {
    ...game,
    played: true,
    won: result.won,
    teamScore: result.teamScore,
    oppScore: result.oppScore,
    playerStatline: result.playerStatline,
  }
  const newSeason: SeasonState = {
    ...season,
    schedule: newSchedule,
    currentGameIndex: idx + 1,
    wins: season.wins + (result.won ? 1 : 0),
    losses: season.losses + (result.won ? 0 : 1),
  }
  if (newSeason.currentGameIndex >= newSeason.schedule.length) {
    return { ...finalizeSeason(state, newSeason), lastGameResult: newSchedule[idx] }
  }
  return {
    season: newSeason,
    phase: 'hub',
    lastGameResult: newSchedule[idx],
    pendingStoryEventId: null,
    storyContext: null,
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return { ...initialState(), phase: 'creation' }

    case 'RESTART':
      return { ...initialState(), phase: 'landing' }

    case 'CONTINUE_SAVED':
      return state

    case 'CREATE_PLAYER': {
      const player: NonNullable<GameState['player']> = {
        name: action.name || 'Rookie',
        position: action.position,
        jerseyNumber: action.jerseyNumber,
        origin: 'USA',
        age: 16,
        reputation: 8,
        morale: 70,
        energy: 100,
        attributes: {
          shooting: 28 + Math.round(Math.random() * 6),
          playmaking: 28 + Math.round(Math.random() * 6),
          defense: 28 + Math.round(Math.random() * 6),
          athleticism: 28 + Math.round(Math.random() * 6),
          iq: 28 + Math.round(Math.random() * 6),
          charisma: 28 + Math.round(Math.random() * 6),
        },
      }
      const queue = ['prologue_origin', 'prologue_training', 'prologue_mentor']
      return {
        ...state,
        player,
        phase: 'story_event',
        storyQueue: queue,
        pendingStoryEventId: queue[0],
        storyContext: 'prologue',
      }
    }

    case 'CHOOSE_STORY_OPTION': {
      if (!state.pendingStoryEventId || !state.player) return state
      const event = getStoryEventById(state.pendingStoryEventId)
      if (!event) return state
      const choice = event.choices.find((c) => c.id === action.choiceId)
      if (!choice) return state

      let updatedPlayer = applyChoiceEffect(state.player, choice.effect)
      let newFlags = { ...state.flags }
      if (choice.effect.flag === 'origin_usa') updatedPlayer = { ...updatedPlayer, origin: 'USA' }
      if (choice.effect.flag === 'origin_europe') updatedPlayer = { ...updatedPlayer, origin: 'EUROPE' }
      if (choice.effect.flag === 'retire') newFlags = { ...newFlags, retire: true }

      const remainingQueue = state.storyQueue.slice(1)
      const completedEventIds = [...state.completedEventIds, event.id]
      const base: GameState = {
        ...state,
        player: updatedPlayer,
        flags: newFlags,
        completedEventIds,
        lastEventResultText: choice.resultText,
      }

      if (remainingQueue.length > 0) {
        return {
          ...base,
          storyQueue: remainingQueue,
          pendingStoryEventId: remainingQueue[0],
        }
      }

      // queue exhausted: resolve based on context
      if (state.storyContext === 'prologue') {
        const stage: CareerStage = updatedPlayer.origin === 'USA' ? 'US_HIGH_SCHOOL' : 'EURO_ACADEMY'
        const season = buildSeason(stage, 1, updatedPlayer)
        return {
          ...base,
          storyQueue: [],
          pendingStoryEventId: null,
          storyContext: null,
          season,
          phase: 'hub',
        }
      }

      if (state.storyContext === 'interstitial') {
        return {
          ...base,
          storyQueue: [],
          pendingStoryEventId: null,
          storyContext: null,
          ...advanceToNextGame(base),
        }
      }

      if (state.storyContext === 'transition') {
        if (newFlags.retire) {
          return {
            ...base,
            storyQueue: [],
            pendingStoryEventId: null,
            storyContext: null,
            phase: 'career_end',
          }
        }
        const nextStage: CareerStage = TRANSITION_NEXT_STAGE[event.id] ?? state.season!.stage
        const nextSeasonNumber = state.season!.seasonNumber + 1
        const season = buildSeason(nextStage, nextSeasonNumber, updatedPlayer)
        return {
          ...base,
          storyQueue: [],
          pendingStoryEventId: null,
          storyContext: null,
          season,
          phase: 'hub',
        }
      }

      return { ...base, storyQueue: [], pendingStoryEventId: null, storyContext: null, phase: 'hub' }
    }

    case 'NEXT_GAME': {
      if (!state.season || state.phase !== 'hub') return state
      const showInterstitial = Math.random() < 0.4
      if (showInterstitial) {
        const recentIds = state.completedEventIds.slice(-3)
        const event = pickRandomInterstitial(recentIds)
        return {
          ...state,
          storyQueue: [event.id],
          pendingStoryEventId: event.id,
          storyContext: 'interstitial',
          phase: 'story_event',
          lastGameResult: null,
        }
      }
      return { ...state, ...advanceToNextGame(state), lastEventResultText: null }
    }

    case 'CHOOSE_CRUCIAL_OPTION': {
      if (!state.pendingCrucialMomentId || !state.pendingCrucialBase || !state.player || !state.season) return state
      const cm = CRUCIAL_MOMENTS.find((c) => c.id === state.pendingCrucialMomentId)
      if (!cm) return state
      const choice = cm.choices.find((c) => c.id === action.choiceId)
      if (!choice) return state

      const success = Math.random() < choice.successChance
      const swingApplied = success ? choice.swing : -Math.round(choice.swing * 0.4)
      const updatedPlayer = choice.effect ? applyChoiceEffect(state.player, choice.effect) : state.player
      const result = resolveCrucialGame(state.pendingCrucialBase, swingApplied, updatedPlayer)

      const season = state.season
      const idx = season.currentGameIndex
      const game = season.schedule[idx]
      const newSchedule = [...season.schedule]
      newSchedule[idx] = {
        ...game,
        played: true,
        won: result.won,
        teamScore: result.teamScore,
        oppScore: result.oppScore,
        playerStatline: result.playerStatline,
      }
      const newSeason: SeasonState = {
        ...season,
        schedule: newSchedule,
        currentGameIndex: idx + 1,
        wins: season.wins + (result.won ? 1 : 0),
        losses: season.losses + (result.won ? 0 : 1),
      }

      const nextState: GameState = {
        ...state,
        player: updatedPlayer,
        pendingCrucialMomentId: null,
        pendingCrucialBase: null,
        lastEventResultText: success ? choice.resultTextSuccess : choice.resultTextFail,
      }

      if (newSeason.currentGameIndex >= newSeason.schedule.length) {
        return { ...nextState, ...finalizeSeason(nextState, newSeason), lastGameResult: newSchedule[idx] }
      }
      return { ...nextState, season: newSeason, phase: 'hub', lastGameResult: newSchedule[idx] }
    }

    case 'CONTINUE_CAREER': {
      if (!state.season) return state
      const stage = state.season.stage
      const count = state.stageHistoryCount[stage] ?? 1
      let eventId: string
      if (stage === 'US_HIGH_SCHOOL') eventId = 'transition_us_hs_to_college'
      else if (stage === 'US_COLLEGE') eventId = 'transition_us_college_to_draft'
      else if (stage === 'EURO_ACADEMY' && count <= 1) eventId = 'transition_euro_academy1_to_academy2'
      else if (stage === 'EURO_ACADEMY') eventId = 'transition_euro_academy2_to_draft'
      else eventId = 'transition_pro_continue'

      return {
        ...state,
        storyQueue: [eventId],
        pendingStoryEventId: eventId,
        storyContext: 'transition',
        phase: 'story_event',
        lastGameResult: null,
      }
    }

    default:
      return state
  }
}

interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<Action>
}

const GameContext = createContext<GameContextValue | null>(null)

function loadInitial(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as GameState
  } catch {
    // ignore corrupt save
  }
  return initialState()
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}

export function hasSavedGame(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as GameState
    return parsed.phase !== 'landing' && parsed.player !== null
  } catch {
    return false
  }
}
