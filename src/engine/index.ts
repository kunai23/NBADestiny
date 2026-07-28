import type {
  Attributes,
  Background,
  CareerStage,
  ChoiceEffect,
  GameResult,
  Lifestyle,
  PlayerProfile,
  PlayerStatline,
  SeasonState,
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

const BACKGROUND_BASE_POTENTIAL: Record<Background, number> = {
  NBA_LEGACY: 3,
  HOOD: 2,
  SELF_MADE: 2,
}

export function computePotentialStars(background: Background, lifestyle: Lifestyle): number {
  let stars = BACKGROUND_BASE_POTENTIAL[background]
  if (lifestyle.hygiene) stars += 1
  if (lifestyle.family) stars += 1
  if (lifestyle.friends) stars += 1
  if (lifestyle.hygiene && lifestyle.family && lifestyle.friends) stars += 1 // synergie parfaite
  return clamp(stars, 1, 5)
}

function growthFactor(potentialStars: number): number {
  return 0.85 + potentialStars * 0.06
}

export function applyChoiceEffect(player: PlayerProfile, effect: ChoiceEffect): PlayerProfile {
  const attrs = { ...player.attributes }
  const factor = growthFactor(player.potentialStars)
  for (const key of ATTRIBUTE_KEYS) {
    const delta = effect[key]
    if (typeof delta === 'number') {
      const scaled = delta > 0 ? Math.round(delta * factor) : delta
      attrs[key] = clamp(attrs[key] + scaled)
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

export function emptyStatline(): PlayerStatline {
  return { pts: 0, reb: 0, ast: 0, blk: 0 }
}

interface SimResult {
  won: boolean
  teamScore: number
  oppScore: number
  playerStatline: PlayerStatline
}

function statlineFor(player: PlayerProfile, won: boolean): PlayerStatline {
  const { shooting, playmaking, athleticism, defense } = player.attributes
  const energyFactor = 0.7 + (player.energy / 100) * 0.5
  const pts = Math.round((8 + shooting * 0.22 + athleticism * 0.05) * energyFactor * (won ? 1.05 : 0.95))
  const ast = Math.round((1 + playmaking * 0.09) * energyFactor)
  const reb = Math.round((2 + athleticism * 0.06) * energyFactor)
  const blk = Math.round((0.3 + defense * 0.035) * energyFactor)
  return { pts: Math.max(0, pts), ast: Math.max(0, ast), reb: Math.max(0, reb), blk: Math.max(0, blk) }
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

const STAGE_BENCHMARKS: Record<CareerStage, { ppg: number; rpg: number; apg: number; bpg: number }> = {
  US_HIGH_SCHOOL: { ppg: 12, rpg: 5, apg: 3, bpg: 1 },
  US_COLLEGE: { ppg: 14, rpg: 6, apg: 3.5, bpg: 1.2 },
  EURO_ACADEMY: { ppg: 11, rpg: 5, apg: 3, bpg: 1 },
  DRAFT: { ppg: 14, rpg: 6, apg: 3.5, bpg: 1.2 },
  EUROLEAGUE: { ppg: 15, rpg: 6.5, apg: 4, bpg: 1.3 },
  NBA: { ppg: 18, rpg: 7, apg: 5, bpg: 1.5 },
}

export interface SeasonAward {
  key: 'TOP_SCORER' | 'TOP_PASSER' | 'TOP_REBOUNDER' | 'TOP_BLOCKER' | 'MVP'
  label: string
  detail: string
}

export function seasonAverages(season: SeasonState): { ppg: number; rpg: number; apg: number; bpg: number } {
  const gamesPlayed = season.wins + season.losses
  if (gamesPlayed === 0) return { ppg: 0, rpg: 0, apg: 0, bpg: 0 }
  return {
    ppg: season.seasonStats.pts / gamesPlayed,
    rpg: season.seasonStats.reb / gamesPlayed,
    apg: season.seasonStats.ast / gamesPlayed,
    bpg: season.seasonStats.blk / gamesPlayed,
  }
}

export function computeSeasonAwards(season: SeasonState): SeasonAward[] {
  const gamesPlayed = season.wins + season.losses
  if (gamesPlayed === 0) return []
  const avg = seasonAverages(season)
  const bench = STAGE_BENCHMARKS[season.stage]
  const awards: SeasonAward[] = []

  const categories: { key: SeasonAward['key']; label: string; value: number; bench: number; unit: string }[] = [
    { key: 'TOP_SCORER', label: 'Meilleur marqueur', value: avg.ppg, bench: bench.ppg, unit: 'PTS/match' },
    { key: 'TOP_PASSER', label: 'Meilleur passeur', value: avg.apg, bench: bench.apg, unit: 'PAS/match' },
    { key: 'TOP_REBOUNDER', label: 'Meilleur rebondeur', value: avg.rpg, bench: bench.rpg, unit: 'REB/match' },
    { key: 'TOP_BLOCKER', label: 'Meilleur contreur', value: avg.bpg, bench: bench.bpg, unit: 'CTR/match' },
  ]

  let wonCount = 0
  for (const cat of categories) {
    const ratio = cat.value / cat.bench
    if (ratio > 1) {
      const chance = clamp((ratio - 1) * 0.9, 0, 0.85)
      if (Math.random() < chance) {
        awards.push({ key: cat.key, label: cat.label, detail: `${cat.value.toFixed(1)} ${cat.unit}` })
        wonCount++
      }
    }
  }

  const winPct = season.wins / gamesPlayed
  const eligibleForMvp = (winPct >= 0.5 && wonCount >= 1) || wonCount >= 3
  const mvpChance = clamp(wonCount * 0.2 + winPct * 0.5, 0.15, 0.9)
  if (eligibleForMvp && Math.random() < mvpChance) {
    awards.unshift({ key: 'MVP', label: 'MVP de la saison', detail: `${season.wins}V-${season.losses}D` })
  }

  return awards
}
