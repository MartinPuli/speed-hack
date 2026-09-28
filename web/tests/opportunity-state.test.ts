import test from 'node:test';
import assert from 'node:assert/strict';
import type { EventSummary } from '../lib/contracts/event-gtm.ts';
import type { WorkspaceOpportunity } from '../lib/contracts/agent-workspace.ts';
import { mapPointForEvent, opportunityVisualState, rankOpportunities } from '../components/events/opportunity-state.ts';

function event(overrides: Partial<EventSummary> = {}): EventSummary {
  return {
    id: 'evt-1', title: 'Research Summit', url: 'https://python.org/events', startDate: '2026-10-15', endDate: null,
    timezone: 'America/Los_Angeles', status: 'announced', temporalStatus: 'upcoming', city: 'San Francisco', country: 'United States', modality: 'in_person',
    category: 'technology', topics: ['AI'], sponsorCount: 0, missing: [],
    source: { id: 'src-1', url: 'https://python.org/events', title: 'Event page', publisher: 'Example', observedAt: '2026-09-28', reuseStatus: null },
    location: { latitude: 37.775, longitude: -122.418, precision: 'venue_exact_publisher', method: 'publisher_supplied', sourceUrl: 'https://python.org/events' },
    ...overrides,
  };
}

function opportunity(id: string, fit: number | null, overrides: Partial<WorkspaceOpportunity> = {}): WorkspaceOpportunity {
  return {
    id, catalogEventId: 'evt-1', title: `Opportunity ${id}`, state: 'planned', action: 'attend', fit,
    rationale: `Reason ${id}`, evidenceIds: [], createdAt: '2026-09-28T10:00:00Z', updatedAt: '2026-09-28T10:00:00Z',
    ...overrides,
  };
}

test('opportunity ranking returns at most three by relative fit, with unscored entries last', () => {
  const ranked = rankOpportunities([
    opportunity('low', 34), opportunity('unscored', null), opportunity('high', 91), opportunity('middle', 68), opportunity('highest', 97),
  ]);
  assert.deepEqual(ranked.map(item => item.id), ['highest', 'high', 'middle']);
});

test('semantic priority keeps concepts violet, active plans blue and historical records gray', () => {
  const published = event();
  assert.equal(opportunityVisualState(published, opportunity('concept', 70, { catalogEventId: null })), 'proposed');
  assert.equal(opportunityVisualState(published, opportunity('active', 70, { state: 'active' })), 'active');
  assert.equal(opportunityVisualState(event({ temporalStatus: 'past' }), opportunity('past-active', 80, { state: 'active' })), 'historical');
  assert.equal(opportunityVisualState(published, opportunity('existing-proposal', 70, { state: 'proposal' })), 'verified');
});

test('exact upcoming points can be green; online and unlocated records stay list-only and centroids remain approximate', () => {
  const exact = event();
  assert.equal(mapPointForEvent(exact)?.approximate, false);
  assert.equal(opportunityVisualState(exact), 'verified');

  const online = event({ modality: 'online' });
  assert.equal(mapPointForEvent(online), null);
  assert.equal(opportunityVisualState(online), 'verified');

  const unlocated = event({ location: { latitude: null, longitude: null, precision: 'unlocated', method: null, sourceUrl: null } });
  assert.equal(mapPointForEvent(unlocated), null);
  assert.equal(opportunityVisualState(unlocated), 'needs_review');

  const centroid = event({ location: { latitude: 37.775, longitude: -122.418, precision: 'city_centroid_publisher_gazetteer', method: 'published_city_centroid', sourceUrl: 'https://python.org/events' } });
  const centroidPoint = mapPointForEvent(centroid);
  assert.equal(centroidPoint?.approximate, true);
  assert.match(centroidPoint?.precisionLabel ?? '', /approximate area, not an event venue/);
  assert.equal(opportunityVisualState(centroid), 'needs_review');
});
