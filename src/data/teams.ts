import type { CareerStage } from '../types'

export const OWN_TEAM_NAMES: Record<CareerStage, string[]> = {
  US_HIGH_SCHOOL: ['Lincoln High Eagles', 'Riverside Warriors', 'Jefferson Comets'],
  US_COLLEGE: ['Bay Area Tech Sharks', 'Riverdale State Wolves', 'Midwest Union Hawks'],
  EURO_ACADEMY: ['Academia Estrella', 'Torino Giovani', 'Belgrade Mladost'],
  EUROLEAGUE: ['Madrid Lobos', 'Milano Fenice', 'Istanbul Simsek', 'Berlin Adler'],
  NBA: ['New York Comets', 'LA Volt', 'Chicago Ironhawks', 'Miami Tide', 'Houston Rockets Jr.'],
  DRAFT: [],
}

export const OPPONENT_POOLS: Record<CareerStage, string[]> = {
  US_HIGH_SCHOOL: [
    'Central High Tigers',
    'Northside Raptors',
    'Oakwood Panthers',
    'Franklin Bulldogs',
    'Southside Hornets',
    'Kennedy Prep Owls',
  ],
  US_COLLEGE: [
    'Coastal State Pirates',
    'Mountain View Grizzlies',
    'Lakeshore Titans',
    'Prairie A&M Bison',
    'Metro City Knights',
    'Redwood Ducks',
  ],
  EURO_ACADEMY: [
    'Barcelona Cadetes',
    'Athens Neoi',
    'Munich Junior Bayern',
    'Vilnius Jaunimas',
    'Lyon Espoirs',
    'Zagreb Mladi',
  ],
  EUROLEAGUE: [
    'Paris Basket Club',
    'Athens Olympiacos Jr',
    'Moscow Bears',
    'Vilnius Rytas',
    'Barcelona Blaugrana',
    'Belgrade Crvena',
  ],
  NBA: [
    'Boston Colonials',
    'Golden Gate Wave',
    'Dallas Mustangs',
    'Toronto Maple Ballers',
    'Phoenix Sundevils',
    'Denver Peaks',
  ],
  DRAFT: [],
}

export function pickOpponents(stage: CareerStage, count: number): string[] {
  const pool = [...OPPONENT_POOLS[stage]]
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    if (pool.length === 0) pool.push(...OPPONENT_POOLS[stage])
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool[idx])
    pool.splice(idx, 1)
  }
  return result
}

export function pickOwnTeamName(stage: CareerStage): string {
  const pool = OWN_TEAM_NAMES[stage]
  return pool[Math.floor(Math.random() * pool.length)]
}

export type MarketTier = 'big' | 'small'

export const MARKET_TEAM_NAMES: Partial<Record<CareerStage, Record<MarketTier, string[]>>> = {
  NBA: {
    big: ['New York Comets', 'LA Volt', 'Chicago Ironhawks', 'Miami Tide'],
    small: ['Denver Peaks', 'Phoenix Sundevils', 'Memphis Riverkings', 'Oklahoma Thunderbirds'],
  },
  EUROLEAGUE: {
    big: ['Madrid Lobos', 'Milano Fenice', 'Istanbul Simsek'],
    small: ['Berlin Adler', 'Vilnius Zalgirio', 'Zagreb Cibonia'],
  },
}

export function pickMarketTeamName(stage: CareerStage, tier: MarketTier): string {
  const pools = MARKET_TEAM_NAMES[stage]
  const pool = pools ? pools[tier] : undefined
  if (!pool || pool.length === 0) return pickOwnTeamName(stage)
  return pool[Math.floor(Math.random() * pool.length)]
}

export const STAGE_LABELS: Record<CareerStage, string> = {
  US_HIGH_SCHOOL: 'Lycée (USA)',
  US_COLLEGE: 'Université (NCAA)',
  EURO_ACADEMY: 'Académie (Europe)',
  DRAFT: 'Draft',
  EUROLEAGUE: 'Pro - EuroLigue',
  NBA: 'Pro - NBA',
}
