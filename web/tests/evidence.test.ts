import test from 'node:test';
import assert from 'node:assert/strict';
import type { EventSummary } from '../lib/contracts/event-gtm.ts';
import { evidenceLink, sameEvidenceUrl, sourceLink } from '../lib/evidence/source-link.ts';
import { declaredCalendarDay } from '../lib/evidence/calendar.ts';
import { classifyEventValidity } from '../lib/temporal/event-validity.ts';
import { classifyDeclaredDate } from '../lib/temporal/declared-date.ts';
import { declaredDateLabel, readableDate } from '../lib/temporal/display-date.ts';
import { eventPoint, groupEventPoints } from '../lib/map/event-points.ts';
import { activeWeightFraction, weightedScore } from '../lib/recommendations/score-utils.ts';

test('public evidence links reject executable URLs, credentials and synthetic hosts', () => {
  assert.deepEqual(evidenceLink(null), { kind: 'missing', href: null });
  for (const value of ['javascript:alert(1)', 'data:text/html,test', 'https://user:password@events.org', 'not a url']) {
    assert.equal(evidenceLink(value).kind, 'invalid');
  }
  for (const value of ['https://example.com/event', 'https://a.example.org', 'https://event.test', 'https://a.invalid']) {
    assert.equal(evidenceLink(value).kind, 'synthetic');
  }
  assert.equal(evidenceLink('https://python.org/events', true).kind, 'synthetic');
  assert.equal(sourceLink({ id: 's', url: 'https://python.org/events', publisher: null, title: null, observedAt: null, reuseStatus: null }).href, 'https://python.org/events');
});

test('same Luma event can use either domain, query or fragment without merging other pages', () => {
  assert.equal(sameEvidenceUrl('https://luma.com/event/?utm_source=site#top', 'https://lu.ma/event'), true);
  assert.equal(sameEvidenceUrl('https://python.org/events/1', 'https://python.org/events/2'), false);
  assert.equal(sameEvidenceUrl('javascript:alert(1)', 'javascript:alert(1)'), false);
});

test('missing and impossible dates remain pending without invented calendar values', () => {
  for (const value of [null, '', 'next week', '2026-02-30', '2025-02-29', '2026-13-01', '2026-04-31T12:00:00Z', '2026-09-28T24:00:00Z']) {
    assert.equal(classifyEventValidity(value, '2026-09-28T12:00:00Z').validity, 'date_pending', `${value}`);
  }
  assert.equal(classifyEventValidity('2024-02-29', '2026-09-28T12:00:00Z').validity, 'past');
  assert.equal(classifyEventValidity('2024-07-01T05:00:13.860000Z', '2026-09-28T12:00:00Z').validity, 'past');
});

test('an exact start has already begun, while unzoned dates retain their uncertainty', () => {
  const now = '2026-09-28T12:00:00Z';
  assert.equal(classifyEventValidity(now, now).validity, 'past');
  assert.equal(classifyEventValidity('2026-09-28T12:00:01Z', now).validity, 'upcoming');
  assert.equal(classifyEventValidity('2026-09-28', now).validity, 'date_ambiguous');
  assert.equal(classifyEventValidity('2026-09-28T12:00:00', now).validity, 'date_ambiguous');
  assert.equal(classifyEventValidity('2026-09-30', now).validity, 'upcoming');
  assert.throws(() => classifyEventValidity('2026-10-01', 'not-a-date'));
  assert.equal(classifyDeclaredDate({ precision: 'ambiguous', text: 'Published range', earliest: '2026-09-27T12:00:00Z', latest: now }, now).validity, 'past');
  assert.equal(classifyDeclaredDate({ precision: 'date_only', date: '2026-02-30', timezone: null }, now).validity, 'date_pending');
  assert.equal(readableDate('2026-02-30'), '2026-02-30');
  assert.equal(declaredDateLabel({ precision: 'unknown' }), 'Date pending');
});

test('declared calendar days use a real explicit timezone and reject invalid dates', () => {
  assert.equal(declaredCalendarDay({ precision: 'instant', iso: '2026-09-29T02:00:00Z', timezone: 'America/Los_Angeles' }), '2026-09-28');
  assert.equal(declaredCalendarDay({ precision: 'instant', iso: '2026-09-29T02:00:00Z', timezone: '-07:00' }), '2026-09-28');
  assert.equal(declaredCalendarDay({ precision: 'instant', iso: '2026-09-29T02:00:00', timezone: 'America/Los_Angeles' }), null);
  assert.equal(declaredCalendarDay({ precision: 'instant', iso: '2026-09-29T02:00:00Z', timezone: 'unknown' }), null);
  assert.equal(declaredCalendarDay({ precision: 'date_only', date: '2026-02-30', timezone: null }), null);
  assert.equal(declaredCalendarDay({ precision: 'unknown' }), null);
});

function event(overrides: Partial<EventSummary['location']> = {}): EventSummary {
  return {
    id: 'test-event', title: 'Published event', url: 'https://python.org/events', startDate: '2026-11-01', endDate: null,
    timezone: null, status: 'announced', temporalStatus: 'upcoming', city: 'Berlin', country: 'Germany', modality: null,
    category: 'technology', topics: [], sponsorCount: 0, missing: [], source: null,
    location: { latitude: 52.52, longitude: 13.405, precision: 'city_centroid_publisher_gazetteer', method: 'publisher_supplied_no_new_geocoding', sourceUrl: 'https://python.org/events', ...overrides },
  };
}

test('map preserves published coordinates and labels city centroids as approximate', () => {
  const point = eventPoint(event());
  assert.ok(point);
  assert.deepEqual(point.coordinates, [13.405, 52.52]);
  assert.equal(point.approximate, true);
  assert.match(point.precisionLabel, /not an event venue/);
  assert.equal(groupEventPoints([point, { ...point, event: { ...point.event, id: 'another-edition' } }])[0].entries.length, 2);
});

test('map never fabricates missing coordinates or treats invalid points as locations', () => {
  for (const patch of [
    { latitude: null }, { longitude: null }, { latitude: Number.NaN }, { longitude: Number.POSITIVE_INFINITY },
    { latitude: 91 }, { longitude: -181 }, { latitude: 0, longitude: 0 },
    { precision: 'unknown' }, { precision: 'location_text_ungeocoded' }, { sourceUrl: null },
  ]) assert.equal(eventPoint(event(patch)), null);
});

test('unknown scoring dimensions stay outside the weighted score and lower data coverage', () => {
  const weights = { fit: 1, audience: 1 };
  assert.equal(weightedScore({ fit: 0.8, audience: null }, weights), 80);
  assert.equal(activeWeightFraction({ fit: 0.8, audience: null }, weights), 0.5);
  assert.equal(weightedScore({ fit: 0.8, audience: 0 }, weights), 40);
});
