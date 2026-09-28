import type { EventSummary } from '../../lib/contracts/event-gtm';
import type { WorkspaceOpportunity } from '../../lib/contracts/agent-workspace';
import { eventPoint, type EventPoint } from '../../lib/map/event-points';

export type OpportunityVisualState = 'verified' | 'needs_review' | 'proposed' | 'active' | 'historical';

const SCORE_LIMIT = 3;

export function rankOpportunities(opportunities: WorkspaceOpportunity[], limit = SCORE_LIMIT): WorkspaceOpportunity[] {
  return opportunities.slice().sort((left, right) => {
    if (left.fit === null && right.fit !== null) return 1;
    if (right.fit === null && left.fit !== null) return -1;
    if (left.fit !== null && right.fit !== null && left.fit !== right.fit) return right.fit - left.fit;
    return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
  }).slice(0, Math.max(0, limit));
}

export function opportunityForEvent(eventId: string, opportunities: WorkspaceOpportunity[]): WorkspaceOpportunity | null {
  const matches = opportunities.filter(opportunity => opportunity.catalogEventId === eventId);
  const active = matches.filter(opportunity => opportunity.state === 'active');
  if (active.length) return rankOpportunities(active, active.length)[0] ?? null;
  return rankOpportunities(matches, matches.length)[0] ?? null;
}

export function mapPointForEvent(event: EventSummary): EventPoint | null {
  if (/online|virtual/i.test(event.modality ?? '')) return null;
  return eventPoint(event);
}

export function opportunityVisualState(event: EventSummary, opportunity: WorkspaceOpportunity | null = null): OpportunityVisualState {
  if (opportunity?.catalogEventId === null) return 'proposed';
  if (opportunity?.state === 'historical' || event.temporalStatus === 'past') return 'historical';
  if (opportunity?.state === 'active') return 'active';

  const hasKnownDate = Boolean(event.startDate) && ['upcoming', 'today'].includes(event.temporalStatus);
  const hasUncertainDateOrStatus = event.missing.some(reason => /date|time|timezone|reschedul|cancel|unconfirm|occurr/i.test(reason));
  const hasKnownLocation = /online|virtual/i.test(event.modality ?? '')
    || (() => {
      const point = eventPoint(event);
      return Boolean(point && !point.approximate);
    })();

  return hasKnownDate && hasKnownLocation && !hasUncertainDateOrStatus && event.missing.length === 0
    ? 'verified'
    : 'needs_review';
}

export function opportunityStateLabel(state: OpportunityVisualState): string {
  return {
    verified: 'Verified upcoming',
    needs_review: 'Needs review',
    proposed: 'Team concept',
    active: 'Active plan',
    historical: 'Historical',
  }[state];
}
