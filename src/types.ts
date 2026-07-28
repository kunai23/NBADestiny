// Core domain types for the basketball career narrative game

export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C'

export type League = 'US_HIGH_SCHOOL' | 'US_COLLEGE' | 'EURO_ACADEMY' | 'EUROLEAGUE' | 'NBA'

export type Background = 'HOOD' | 'NBA_LEGACY' | 'SELF_MADE'

export type LifestyleChoice = 'hygiene' | 'family' | 'friends'

export interface Attributes {
  shooting: number // scoring, jumpshot
  playmaking: number // passing, IQ on offense
  defense: number
  athleticism: number // speed, vertical, stamina
  iq: number // basketball IQ, decision making
  charisma: number // leadership, media, locker room
}

export type AttributeKey = keyof Attributes

export interface Attribute {
  key: AttributeKey
  value: number
}

export interface PlayerProfile {
  name: string
  position: Position
  origin: 'USA' | 'EUROPE'
  background: Background
  lifestyle: LifestyleChoice
  potentialStars: number // 1-5, scales attribute growth from choices
  attributes: Attributes
  reputation: number // 0-100, fame/legacy
  morale: number // 0-100
  energy: number // 0-100
  age: number
  jerseyNumber: number
  contract: number // current annual salary ($), 0 while amateur
  careerEarnings: number // cumulative money earned as a pro
}

export interface TeamInfo {
  name: string
  league: League
  overall: number // computed team strength baseline (AI teammates+opponents)
}

export type ChoiceEffect = Partial<Record<AttributeKey, number>> & {
  reputation?: number
  morale?: number
  energy?: number
  flag?: string // sets a story flag
}

export interface StoryChoice {
  id: string
  text: string
  effect: ChoiceEffect
  resultText: string
}

export interface StoryEvent {
  id: string
  title: string
  body: string
  choices: StoryChoice[]
}

export interface CrucialMomentChoice {
  id: string
  text: string
  // swing applied to player's contribution in the crucial game (-x..+x)
  swing: number
  successChance: number // 0-1, chance the swing applies fully; else reduced
  effect?: ChoiceEffect
  resultTextSuccess: string
  resultTextFail: string
}

export interface CrucialMoment {
  id: string
  title: string
  body: string
  choices: CrucialMomentChoice[]
}

export type GamePhase =
  | 'landing'
  | 'creation'
  | 'prologue'
  | 'hub'
  | 'story_event'
  | 'season_game'
  | 'crucial_moment'
  | 'season_summary'
  | 'career_end'

export type CareerStage = 'US_HIGH_SCHOOL' | 'US_COLLEGE' | 'EURO_ACADEMY' | 'DRAFT' | 'EUROLEAGUE' | 'NBA'

export interface OpponentTeam {
  name: string
  overall: number
}

export interface PlayerStatline {
  pts: number
  reb: number
  ast: number
  blk: number
}

export interface GameResult {
  opponent: string
  isCrucial: boolean
  hasHighlight: boolean
  played: boolean
  won?: boolean
  teamScore?: number
  oppScore?: number
  playerStatline?: PlayerStatline
}

export interface SeasonState {
  stage: CareerStage
  seasonNumber: number
  team: TeamInfo
  schedule: GameResult[]
  currentGameIndex: number
  wins: number
  losses: number
  seasonStats: PlayerStatline
  highlights: string[]
}

export interface CrucialBase {
  teamOverall: number
  oppOverall: number
  baseScore: number
  naturalMargin: number
}

export interface CareerLogEntry {
  season: number
  stage: CareerStage
  text: string
}

export type StoryContext = 'prologue' | 'transition'

export interface GameState {
  phase: GamePhase
  player: PlayerProfile | null
  season: SeasonState | null
  pendingStoryEventId: string | null
  storyContext: StoryContext | null
  storyQueue: string[] // queued story event ids for hub/interstitials
  completedEventIds: string[]
  usedCrucialMomentIds: string[]
  stageHistoryCount: Partial<Record<CareerStage, number>>
  pendingCrucialMomentId: string | null
  pendingCrucialBase: CrucialBase | null
  lastGameResult: GameResult | null
  lastEventResultText: string | null
  lastCrucialSuccess: boolean | null
  lastSeasonAwards: string[]
  lastSeasonIncome: number
  lastContractChangeText: string | null
  flags: Record<string, boolean>
  careerLog: CareerLogEntry[]
  awards: string[]
  seasonHistory: { stage: CareerStage; seasonNumber: number; wins: number; losses: number }[]
}
