import type {
  Attributes,
  CareerStage,
  ChoiceEffect,
  GameResult,
  PlayerProfile,
} from '../types'
import { pickOpponents, pickOwnTeamName } from '../data/teams'

export const ATTRIBUTE_KEYS: (keyof Attributes)[] = [
  'shooting',
  'playmaking',
  'defense',
  'athleticism',
  'iq',
  'charisma',
]

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

export function playerOverall(attrs: Attributes): number {
  const sum = ATTRIBUTE_KEYS.reduce((acc, k) => acc + attrs[k], 0)
  return Math.round(sum / ATTRIBUTE_KEYS.length)
}

export function applyChoiceEffect(player: PlayerProfile, effect: ChoiceEffect): PlayerProfile {
  const attrs = { ...player.attributes }
  for (const key of ATTRIBUTE_KEYS) {
    const delta = effect[key]
    if (typeof delta === 'number') {
      attrs[key] = clamp(attrs[key] + delta)
    }
  }
  return {
    ...player,
    attributes: attrs,
    reputation: clamp(player.reputation + (effect.reputation ?? 0)),
    morale: clamp(player.morale + (effect.morale ?? 0)),
    energy: clamp(player.energy + (effect.energy ?? 0)),
  }
}

const STAGE_BASELINE: Record<CareerStage, { own: number; oppMin: number; oppMax: number }> = {
  US_HIGH_SCHOOL: { own: 52, oppMin: 42, oppMax: 62 },
  US_COLLEGE: { own: 62, oppMin: 52, oppMax: 74 },
  EURO_ACADEMY: { own: 52, oppMin: 44, oppMax: 64 },
  DRAFT: { own: 60, oppMin: 60, oppMax: 60 },
  EUROLEAGUE: { own: 74, oppMin: 64, oppMax: 86 },
  NBA: { own: 78, oppMin: 70, oppMax: 94 },
}

export function computeTeamOverall(stage: CareerStage, player: PlayerProfile, seasonNumber: number): number {
  const base = STAGE_BASELINE[stage].own
  const pOverall = playerOverall(player.attributes)
  const contribution = (pOverall - 50) * 0.35
  const seasonGrowth = Math.min(seasonNumber * 1.5, 8)
  return clamp(Math.round(base + contribution + seasonGrowth), 20, 99)
}

function randomOpponentOverall(stage: CareerStage): number {
  const { oppMin, oppMax } = STAGE_BASELINE[stage]
  return Math.round(oppMin + Math.random() * (oppMax - oppMin))
}

export function generateSchedule(stage: CareerStage, seasonNumber: number, player: PlayerProfile): GameResult[] {
  const gamesCount = 8
  const opponents = pickOpponents(stage, gamesCount)
  const crucialIndices = new Set<number>()
  crucialIndices.add(gamesCount - 1) // final game always crucial
  const midCrucial = 2 + Math.floor(Math.random() * (gamesCount - 4))
  crucialIndices.add(midCrucial)
  void seasonNumber
  void player
  return opponents.map((opponent, idx) => ({
    opponent,
    isCrucial: crucialIndices.has(idx),
    played: false,
  }))
}

export function ownTeamNameFor(stage: CareerStage): string {
  return pickOwnTeamName(stage)
}

interface SimResult {
  won: boolean
  teamScore: number
  oppScore: number
  playerStatline: { pts: number; reb: number; ast: number }
}

function statlineFor(player: PlayerProfile, won: boolean): { pts: number; reb: number; ast: number } {
  const { shooting, playmaking, athleticism } = player.attributes
  const energyFactor = 0.7 + (player.energy / 100) * 0.5
  const pts = Math.round((8 + shooting * 0.22 + athleticism * 0.05) * energyFactor * (won ? 1.05 : 0.95))
  const ast = Math.round((1 + playmaking * 0.09) * energyFactor)
  const reb = Math.round((2 + athleticism * 0.06) * energyFactor)
  return { pts: Math.max(0, pts), ast: Math.max(0, ast), reb: Math.max(0, reb) }
}

export function simulateRegularGame(stage: CareerStage, player: PlayerProfile, seasonNumber: number): SimResult {
  const teamOverall = computeTeamOverall(stage, player, seasonNumber)
  const oppOverall = randomOpponentOverall(stage)
  const diff = teamOverall - oppOverall
  const winProb = clamp(50 + diff * 1.8, 5, 95) / 100
  const won = Math.random() < winProb

  const baseScore = 70 + Math.round(Math.random() * 25)
  const margin = won
    ? 3 + Math.round(Math.random() * 15)
    : -(3 + Math.round(Math.random() * 15))
  const teamScore = won ? baseScore + Math.max(0, margin) : baseScore
  const oppScore = won ? baseScore : baseScore + Math.max(0, -margin)

  return {
    won,
    teamScore,
    oppScore,
    playerStatline: statlineFor(player, won),
  }
}

// For crucial games: compute a tight base game (close score) then resolve after player choice.
export function simulateCrucialGameBase(stage: CareerStage, player: PlayerProfile, seasonNumber: number) {
  const teamOverall = computeTeamOverall(stage, player, seasonNumber)
  const oppOverall = randomOpponentOverall(stage)
  const baseScore = 72 + Math.round(Math.random() * 20)
  // start close: small natural margin before the crucial swing is applied
  const naturalMargin = Math.round((teamOverall - oppOverall) * 0.3 + (Math.random() * 6 - 3))
  return { teamOverall, oppOverall, baseScore, naturalMargin }
}

export function resolveCrucialGame(
  base: { baseScore: number; naturalMargin: number },
  swingApplied: number,
  player: PlayerProfile,
): SimResult {
  const finalMargin = base.naturalMargin + swingApplied
  const won = finalMargin > 0
  const teamScore = won ? base.baseScore + Math.max(1, finalMargin) : base.baseScore
  const oppScore = won ? base.baseScore : base.baseScore + Math.max(1, -finalMargin)
  return {
    won,
    teamScore,
    oppScore,
    playerStatline: statlineFor(player, won),
  }
}

export function getNextStage(stage: CareerStage, seasonNumber: number, origin: 'USA' | 'EUROPE'): CareerStage {
  if (origin === 'USA') {
    if (stage === 'US_HIGH_SCHOOL') return 'US_COLLEGE'
    if (stage === 'US_COLLEGE') return 'NBA'
    return 'NBA'
  }
  if (stage === 'EURO_ACADEMY' && seasonNumber === 1) return 'EURO_ACADEMY'
  if (stage === 'EURO_ACADEMY') return 'EUROLEAGUE'
  return 'EUROLEAGUE'
}

export function isProStage(stage: CareerStage): boolean {
  return stage === 'NBA' || stage === 'EUROLEAGUE'
}

export function computeLegacyRating(player: PlayerProfile, awards: string[], seasonHistory: { wins: number; losses: number }[]): number {
  const totalWins = seasonHistory.reduce((a, s) => a + s.wins, 0)
  const totalGames = seasonHistory.reduce((a, s) => a + s.wins + s.losses, 0)
  const winPct = totalGames > 0 ? totalWins / totalGames : 0
  const overall = playerOverall(player.attributes)
  return Math.round(player.reputation * 0.4 + overall * 0.3 + winPct * 100 * 0.2 + awards.length * 5 * 0.1)
}
