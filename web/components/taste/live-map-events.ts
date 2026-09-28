import { CITY_CENTERS } from '@/lib/contracts/event-brief';
import type { WorkspaceSnapshot } from '@/lib/contracts/agent-workspace';
import { TASTE_OPPORTUNITIES, type TasteOpportunity } from '@/lib/demo/taste-labs';

// Reuse the approved visual treatment. All copy comes from persisted agent output.
export function liveMapEvents(workspace: WorkspaceSnapshot | null, city = 'San Francisco'): TasteOpportunity[] {
  if (!workspace) return [];
  return workspace.opportunities.flatMap(opportunity => {
    const event = opportunity.event;
    const sf = event?.city?.toLowerCase().includes(city.toLowerCase()) || (!event && opportunity.action === 'host' && workspace.latestBrief?.geography.toLowerCase().includes(city.toLowerCase()));
    const longitude = event?.location.longitude;
    const latitude = event?.location.latitude;
    if ((longitude == null || latitude == null) && !sf) return [];
    const draft = workspace.drafts.find(item => item.opportunityId === opportunity.id);
    const visual = TASTE_OPPORTUNITIES[opportunity.action === 'host' ? 0 : 1];
    return [{ ...visual, ...(draft?.fields.coverImageUrl ? { image: draft.fields.coverImageUrl } : {}), id: opportunity.id, kind: opportunity.action === 'host' ? 'host' : 'sponsor', region: sf ? 'sf' : 'world', title: draft?.fields.title ?? opportunity.title, shortTitle: draft?.fields.title ?? opportunity.title, reason: opportunity.rationale, recommendation: opportunity.rationale, coordinates: [longitude ?? CITY_CENTERS[city]?.[0] ?? -122.4194, latitude ?? CITY_CENTERS[city]?.[1] ?? 37.7749], city: event?.city ?? city, dateLabel: event?.startDate ?? 'Date to propose', date: event?.startDate ?? '', venue: draft?.fields.location || 'Venue to confirm', locationNote: longitude != null && latitude != null ? `Catalog location · ${event?.location.precision ?? 'approximate'}` : 'Proposed city only; no venue has been chosen.', budget: [], rationale: [], agenda: [], sources: [] } as TasteOpportunity];
  });
}
