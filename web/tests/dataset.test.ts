import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCatalogStats, getEventDetail, parseFilters, searchEvents } from '../lib/server/dataset-repository.ts';

const DATASET = process.env.EVENT_GTM_DATASET_PATH ?? resolve(process.cwd(), '../event-gtm-2026-09-28/scale-expansion-20260928/dataset.sqlite');
const reference = new DatabaseSync(DATASET, { readOnly: true });
reference.exec('PRAGMA query_only=ON');
const initialStat = statSync(DATASET);
const NOW = '2026-09-28T12:00:00Z';
const filters = (params = '') => parseFilters(new URLSearchParams(params));
type Row = Record<string, string | number | null>;

test.after(() => {
  reference.close();
  const finalStat = statSync(DATASET);
  assert.equal(finalStat.size, initialStat.size, 'catalog size changed');
  assert.equal(finalStat.mtimeMs, initialStat.mtimeMs, 'catalog was modified by read operations');
});

test('filter validation bounds pagination and rejects impossible dates', () => {
  const result = filters('page=-2&pageSize=999&from=2026-02-30&to=2026-10-01&scope=invalid');
  assert.equal(result.page, 1);
  assert.equal(result.pageSize, 50);
  assert.equal(result.from, '');
  assert.equal(result.to, '2026-10-01');
  assert.equal(result.scope, 'upcoming');
  assert.equal(filters('page=NaN&pageSize=Infinity').pageSize, 24);
});

test('catalog stats count canonical records and never expose aliases twice', () => {
  const expected = reference.prepare('SELECT count(*) AS n FROM canonical_event_editions').get() as Row;
  assert.equal(getCatalogStats(NOW).total, Number(expected.n));
  const page = searchEvents(filters('scope=all&sector=all&pageSize=50'), NOW);
  assert.equal(new Set(page.events.map(event => event.id)).size, page.events.length);
  for (const event of page.events) assert.equal(reference.prepare('SELECT id FROM scale_event_redirects WHERE alias_event_id=?').get(event.id), undefined);
  const redirect = reference.prepare('SELECT alias_event_id, canonical_event_id FROM scale_event_redirects LIMIT 1').get() as Row;
  assert.ok(redirect, 'the real dataset should exercise canonical redirects');
  assert.equal(getEventDetail(String(redirect.alias_event_id), NOW)?.id, redirect.canonical_event_id);
});

test('page limits remain bounded even for a hostile or stale requested page', () => {
  const result = searchEvents(filters('scope=all&pageSize=500&page=99999999'), NOW);
  assert.equal(result.pageSize, 50);
  assert.equal(result.page, result.totalPages);
  assert.ok(result.events.length > 0 && result.events.length <= 50);
  assert.equal(new Set(result.events.map(event => event.id)).size, result.events.length);
});

test('natural-language punctuation and FTS operators cannot alter SQL or crash search', () => {
  for (const q of ['"NEAR( python : data )* -', 'C++ / C# & AI, cloud!', '))) *** : "', "'; DROP TABLE event_editions; --"]) {
    const result = searchEvents(parseFilters(new URLSearchParams({ q, scope: 'all', pageSize: '2' })), NOW);
    assert.ok(Array.isArray(result.events));
    assert.ok(result.events.length <= 2);
  }
  const injection = searchEvents(parseFilters(new URLSearchParams({ country: "' OR 1=1 --", scope: 'all', sector: 'all' })), NOW);
  assert.equal(injection.total, 0);
  const python = searchEvents(filters('q=python&scope=all&pageSize=5'), NOW);
  assert.ok(python.total > 0);
  assert.ok(python.events.every(event => /python|pycon/i.test(`${event.title} ${event.topics.join(' ')}`)));
});

test('upcoming excludes today without an exact time and excludes canceled editions', () => {
  const today = reference.prepare("SELECT id FROM canonical_event_editions WHERE start_date='2026-09-28' AND start_at IS NULL LIMIT 1").get() as Row;
  assert.ok(today);
  assert.equal(getEventDetail(String(today.id), NOW)?.temporalStatus, 'today');
  const result = searchEvents(filters('scope=upcoming&sector=all&from=2026-09-28&to=2026-09-28&pageSize=50'), NOW);
  assert.ok(!result.events.some(event => event.id === today.id));
  const canceled = reference.prepare("SELECT id,start_date FROM canonical_event_editions WHERE status='EventCancelled' ORDER BY start_date DESC LIMIT 1").get() as Row;
  assert.ok(canceled);
  const before = new Date(`${canceled.start_date}T00:00:00Z`);
  before.setUTCDate(before.getUTCDate() - 7);
  const canceledDay = searchEvents(parseFilters(new URLSearchParams({ sector: 'all', from: String(canceled.start_date), to: String(canceled.start_date), scope: 'upcoming', pageSize: '50' })), before);
  assert.ok(canceledDay.events.every(event => !event.status?.toLowerCase().includes('cancel')));
  assert.equal(getEventDetail(String(canceled.id), NOW)?.status, 'EventCancelled');
});

test('history is evaluated at the supplied clock and reprogramming uncertainty survives', () => {
  const past = searchEvents(filters('scope=history&sector=all&pageSize=20'), NOW);
  assert.ok(past.events.length > 0);
  assert.ok(past.events.every(event => event.temporalStatus === 'past'));
  const changed = reference.prepare("SELECT id FROM canonical_event_editions WHERE status='EventRescheduled' LIMIT 1").get() as Row;
  const detail = getEventDetail(String(changed.id), NOW);
  assert.equal(detail?.status, 'EventRescheduled');
  assert.ok(detail?.missing.some(note => note.includes('Rescheduled')));
  assert.equal(searchEvents(filters('scope=upcoming&sector=all'), '2100-01-01T12:00:00Z').total, 0);
});

test('country and date constraints apply together', () => {
  const result = searchEvents(filters('scope=all&country=Germany&from=2025-01-01&to=2026-12-31&pageSize=50'), NOW);
  assert.ok(result.events.length > 0);
  assert.ok(result.events.every(event => event.country === 'Germany' && !!event.startDate && event.startDate >= '2025-01-01' && event.startDate <= '2026-12-31'));
});

test('city is an explicit escaped filter, independent from lexical OR search', () => {
  const result = searchEvents(filters('scope=upcoming&country=United%20States&city=San%20Francisco&q=AI%20infrastructure%20San%20Francisco&pageSize=50'), NOW);
  assert.ok(result.total > 0);
  assert.ok(result.events.every(event => event.city?.toLowerCase().includes('san francisco')));
  const wildcard = searchEvents(filters('scope=all&sector=all&city=%25&pageSize=50'), NOW);
  assert.equal(wildcard.total, 0, 'SQL wildcard characters in a city filter must be treated literally');
});

test('detail preserves source IDs, evidence class and actual sponsorship relationships', () => {
  const target = reference.prepare("SELECT e.id FROM canonical_event_editions e JOIN event_company_roles r ON r.event_id=e.id WHERE r.role='sponsor' GROUP BY e.id ORDER BY count(*) DESC LIMIT 1").get() as Row;
  const detail = getEventDetail(String(target.id), NOW);
  assert.ok(detail && detail.roles.length > 0 && detail.evidence.length > 0);
  const expected = reference.prepare("SELECT count(*) AS n FROM assertions WHERE entity_table IN ('event_editions','scale_event_metadata') AND entity_id=?").get(String(target.id)) as Row;
  assert.equal(detail.evidenceTotal, Number(expected.n));
  assert.ok(detail.evidence.length <= 100 && detail.evidenceTotal >= detail.evidence.length);
  for (const evidence of detail.evidence) {
    const stored = reference.prepare('SELECT source_id,evidence_class FROM assertions WHERE id=?').get(evidence.id) as Row;
    assert.equal(evidence.source?.id ?? null, stored.source_id);
    assert.equal(evidence.evidenceClass, stored.evidence_class);
  }
  for (const role of detail.roles) {
    const stored = reference.prepare('SELECT relationship_status,source_id FROM event_company_roles WHERE id=?').get(role.id) as Row;
    assert.equal(role.status, stored.relationship_status);
    assert.equal(role.source?.id ?? null, stored.source_id);
  }
  assert.equal(getEventDetail("' OR 1=1 --", NOW), null);
});
