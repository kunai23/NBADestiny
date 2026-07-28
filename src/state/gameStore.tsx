import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type {
  Background,
  CareerStage,
  GameState,
  League,
  LifestyleChoice,
  PlayerProfile,
  PlayerStatline,
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
  applyAging,
  applyChoiceEffect,
  computePotentialStars,
  computeRookieContract,
  computeSeasonAwards,
  computeTeamOverall,
  contractCurrency,
  emptyStatline,
  formatMoney,
  generateSchedule,
  isProStage,
  ownTeamNameFor,
  renewContract,
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
    lastCrucialSuccess: null,
    lastSeasonAwards: [],
    lastSeasonIncome: 0,
    lastContractChangeText: null,
    flags: {},
    careerLog: [],
    awards: [],
    seasonHistory: [],
  }
}

type Action =
  | { type: 'NEW_GAME' }
  | { type: 'CONTINUE_SAVED' }
  | {
      type: 'CREATE_PLAYER'
      name: string
      position: Position
      jerseyNumber: number
      background: Background
      lifestyle: LifestyleChoice
    }
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

const DRAFT_TRANSITIONS = new Set(['transition_us_college_to_draft', 'transition_euro_academy2_to_draft'])

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
    seasonStats: emptyStatline(),
    highlights: [],
  }
}

function addStatline(a: PlayerStatline, b: PlayerStatline): PlayerStatline {
  return { pts: a.pts + b.pts, reb: a.reb + b.reb, ast: a.ast + b.ast, blk: a.blk + b.blk }
}

function formatAwards(season: SeasonState): string[] {
  const label = STAGE_LABELS[season.stage]
  return computeSeasonAwards(season).map(
    (a) => `${a.label} - ${label} saison ${season.seasonNumber} (${a.detail})`,
  )
}

function recordAwardFor(season: SeasonState): string | null {
  const label = STAGE_LABELS[season.stage]
  if (season.wins === season.schedule.length) {
    return `Saison invaincue - ${label} (saison ${season.seasonNumber})`
  }
  if (season.wins - season.losses >= 4) {
    return `Saison brillante - ${label} (${season.wins}-${season.losses})`
  }
  return null
}

function finalizeSeason(state: GameState, season: SeasonState, player: PlayerProfile): Partial<GameState> {
  const statAwards = formatAwards(season)
  const recordAward = recordAwardFor(season)
  const newAwards = recordAward ? [recordAward, ...statAwards] : statAwards
  const income = isProStage(season.stage) ? player.contract : 0
  const updatedPlayer = income > 0 ? { ...player, careerEarnings: player.careerEarnings + income } : player
  return {
    season,
    player: updatedPlayer,
    phase: 'season_summary',
    stageHistoryCount: {
      ...state.stageHistoryCount,
      [season.stage]: (state.stageHistoryCount[season.stage] ?? 0) + 1,
    },
    seasonHistory: [
      ...state.seasonHistory,
      { stage: season.stage, seasonNumber: season.seasonNumber, wins: season.wins, losses: season.losses },
    ],
    awards: [...state.awards, ...newAwards],
    lastSeasonAwards: newAwards,
    lastSeasonIncome: income,
    pendingStoryEventId: null,
    storyContext: null,
  }
}

// Simulates every remaining regular-season game in bulk (auto-resolving narrative
// highlights along the way) and only stops for a crucial match or season end.
function advanceSeason(state: GameState): Partial<GameState> {
  const season = state.season!
  let player = state.player!
  let idx = season.currentGameIndex
  let wins = season.wins
  let losses = season.losses
  let stats = season.seasonStats
  const highlights = [...season.highlights]
  let completedEventIds = [...state.completedEventIds]
  const schedule = [...season.schedule]

  while (idx < schedule.length) {
    const game = schedule[idx]

    if (game.isCrucial) {
      const base = simulateCrucialGameBase(season.stage, player, season.seasonNumber)
      const cm = pickRandomCrucialMoment(state.usedCrucialMomentIds)
      const inProgressSeason: SeasonState = { ...season, schedule, currentGameIndex: idx, wins, losses, seasonStats: stats, highlights }
      return {
        player,
        season: inProgressSeason,
        completedEventIds,
        phase: 'crucial_moment',
        pendingCrucialMomentId: cm.id,
        pendingCrucialBase: base,
        usedCrucialMomentIds: [...state.usedCrucialMomentIds, cm.id],
        pendingStoryEventId: null,
        storyContext: null,
        lastCrucialSuccess: null,
        lastGameResult: null,
      }
    }

    if (game.hasHighlight) {
      const event = pickRandomInterstitial(completedEventIds.slice(-3))
      const choice = event.choices[Math.floor(Math.random() * event.choices.length)]
      player = applyChoiceEffect(player, choice.effect)
      highlights.push(`${event.title} — ${choice.resultText}`)
      completedEventIds = [...completedEventIds, event.id]
    }

    const result = simulateRegularGame(season.stage, player, season.seasonNumber)
    schedule[idx] = {
      ...game,
      played: true,
      won: result.won,
      teamScore: result.teamScore,
      oppScore: result.oppScore,
      playerStatline: result.playerStatline,
    }
    wins += result.won ? 1 : 0
    losses += result.won ? 0 : 1
    stats = addStatline(stats, result.playerStatline)
    idx++
  }

  const finishedSeason: SeasonState = { ...season, schedule, currentGameIndex: idx, wins, losses, seasonStats: stats, highlights }
  return { completedEventIds, ...finalizeSeason(state, finishedSeason, player) }
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
      const potentialStars = computePotentialStars(action.background, action.lifestyle)
      const player: NonNullable<GameState['player']> = {
        name: action.name || 'Rookie',
        position: action.position,
        jerseyNumber: action.jerseyNumber,
        origin: 'USA',
        background: action.background,
        lifestyle: action.lifestyle,
        potentialStars,
        age: 16,
        reputation: 8,
        morale: 70,
        energy: 100,
        contract: 0,
        careerEarnings: 0,
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
        const completedSeason = state.season!
        const nextStage: CareerStage = TRANSITION_NEXT_STAGE[event.id] ?? completedSeason.stage
        const nextSeasonNumber = completedSeason.seasonNumber + 1
        const agedPlayer = applyAging(updatedPlayer)

        let contractedPlayer = agedPlayer
        let lastContractChangeText: string | null = null
        if (DRAFT_TRANSITIONS.has(event.id)) {
          const currency = contractCurrency(nextStage)
          const rookieContract = computeRookieContract(agedPlayer, nextStage as 'NBA' | 'EUROLEAGUE')
          contractedPlayer = { ...agedPlayer, contract: rookieContract }
          lastContractChangeText = `Premier contrat professionnel signé : ${formatMoney(rookieContract, currency)} / an`
        } else if (event.id === 'transition_pro_continue') {
          const currency = contractCurrency(completedSeason.stage)
          const awardsCount = state.lastSeasonAwards.length
          const newContract = renewContract(agedPlayer.contract, completedSeason, awardsCount)
          const oldContract = agedPlayer.contract
          contractedPlayer = { ...agedPlayer, contract: newContract }
          const pctChange = oldContract > 0 ? Math.round(((newContract - oldContract) / oldContract) * 100) : null
          lastContractChangeText =
            pctChange === null
              ? `Nouveau contrat : ${formatMoney(newContract, currency)} / an`
              : `Nouveau contrat : ${formatMoney(newContract, currency)} / an (${pctChange >= 0 ? '+' : ''}${pctChange}%)`
        }

        const season = buildSeason(nextStage, nextSeasonNumber, contractedPlayer)
        return {
          ...base,
          player: contractedPlayer,
          storyQueue: [],
          pendingStoryEventId: null,
          storyContext: null,
          season,
          phase: 'hub',
          lastContractChangeText,
        }
      }

      return { ...base, storyQueue: [], pendingStoryEventId: null, storyContext: null, phase: 'hub' }
    }

    case 'NEXT_GAME': {
      if (!state.season || state.phase !== 'hub') return state
      return { ...state, ...advanceSeason(state), lastEventResultText: null }
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
        seasonStats: addStatline(season.seasonStats, result.playerStatline),
      }

      const nextState: GameState = {
        ...state,
        player: updatedPlayer,
        pendingCrucialMomentId: null,
        pendingCrucialBase: null,
        lastEventResultText: success ? choice.resultTextSuccess : choice.resultTextFail,
        lastCrucialSuccess: success,
      }

      if (newSeason.currentGameIndex >= newSeason.schedule.length) {
        return { ...nextState, ...finalizeSeason(nextState, newSeason, updatedPlayer), lastGameResult: newSchedule[idx] }
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
        lastSeasonAwards: [],
        lastContractChangeText: null,
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
