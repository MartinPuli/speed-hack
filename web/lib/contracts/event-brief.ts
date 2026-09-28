import type { ResearchBrief } from './event-gtm';

export type EventPreferences = Partial<Record<'companyDescription' | 'successMetric' | 'guestCount' | 'formats' | 'existingEvents' | 'partners' | 'atmosphere' | 'accessibility' | 'notes', string>>;
export interface TeamBrief { website: string; goal: string; audience: string; budget: string; city: string; from: string; to: string; preferences: EventPreferences }
export const DEFAULT_BRIEF: TeamBrief = { website: 'tastelabs.com', goal: 'Product adoption', audience: 'Developers & design engineers building AI apps', budget: '15000', city: 'San Francisco', from: '2026-10-01', to: '2026-11-30', preferences: {} };
export const CITY_CENTERS: Record<string, [number, number]> = { 'San Francisco': [-122.4194, 37.7749], 'New York': [-74.006, 40.7128], London: [-0.1276, 51.5072], Austin: [-97.7431, 30.2672], Berlin: [13.405, 52.52], 'Buenos Aires': [-58.3816, -34.6037] };
export function briefFromSaved(brief: ResearchBrief): TeamBrief {
  return { website: brief.website, goal: brief.objective === 'partnerships' ? 'Partnerships' : brief.objective === 'feedback' ? 'Community' : 'Product adoption', audience: brief.audience, budget: brief.budget, city: Object.keys(CITY_CENTERS).find(city => brief.geography.includes(city)) ?? 'San Francisco', from: brief.from, to: brief.to, preferences: brief.preferences ?? {} };
}
export function validPreferences(value: unknown): boolean {
  return value === undefined || (value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length <= 9 && Object.values(value).every(item => typeof item === 'string' && item.length <= 800));
}
