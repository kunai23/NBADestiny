import type { StoryEvent } from '../types'
import { PROLOGUE_EVENTS } from './prologue'
import { INTERSTITIAL_EVENTS } from './storyEvents'
import { STAGE_TRANSITION_EVENTS, PRO_SEASON_CONTINUE_EVENT } from './stageEvents'

export * from './teams'
export * from './prologue'
export * from './storyEvents'
export * from './stageEvents'
export * from './crucialMoments'
export * from './newspaper'

export function getStoryEventById(id: string): StoryEvent | undefined {
  const all: StoryEvent[] = [
    ...PROLOGUE_EVENTS,
    ...INTERSTITIAL_EVENTS,
    ...Object.values(STAGE_TRANSITION_EVENTS),
    PRO_SEASON_CONTINUE_EVENT,
  ]
  return all.find((e) => e.id === id)
}
