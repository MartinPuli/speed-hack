import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type {
  CatalogStats, CompanyRole, EventCost, EventDetail, EventSummary, EvidenceRecord,
  SearchFilters, SearchResponse, SourceRecord, TemporalStatus,
} from '../contracts/event-gtm';
import { classifyEventValidity } from '../temporal/event-validity';

// New SQLite adapter. GrowthX's evidence/date semantics are retained; its PG stores,
// tenant queue, hard-coded SF policy and fabricated revision IDs are not imported.
type Row = Record<string, unknown>;
type Clock = Date | string | number;
const DATASET_RELATIVE = 'event-gtm-2026-09-28/scale-expansion-20260928/dataset.sqlite';
const EVIDENCE_LIMIT = 100;
const STOPWORDS = new Set(['a','an','and','are','as','at','be','by','for','from','i','in','is','it','me','my','of','on','or','our','the','to','want','with','find','events','event','quiero','buscar','busca','eventos','evento','para','una','uno','con','del','las','los','que','por','como','mi','un','de','la','el','en','y']);
let cached: { path: string; db: DatabaseSync; countries?: string[]; stats?: { key: string; value: CatalogStats } } | undefined;

export class DatasetUnavailableError extends Error {
  constructor() { super('The research catalog is unavailable. Check the server dataset configuration.'); this.name = 'DatasetUnavailableError'; }
}

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed && trimmed !== 'null' ? trimmed : null;
}
function date(value: string | null): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? value : '';
}
function integer(value: string | null, fallback: number, max: number): number {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) ? Math.max(1, Math.min(max, Math.floor(parsed))) : fallback;
}
function clock(now: Clock = new Date()): string {
  const value = new Date(now);
  if (!Number.isFinite(value.getTime())) throw new Error('A valid evaluation date is required.');
  return value.toISOString();
}
function parsed(value: unknown): unknown {
  if (typeof value !== 'string') return null;
  try { return JSON.parse(value); } catch { return value; }
}
function strings(value: unknown): string[] {
  const decoded = parsed(value);
  if (Array.isArray(decoded)) return decoded.filter((item): item is string => typeof item === 'string' && !!item.trim());
  if (decoded && typeof decoded === 'object') return Object.entries(decoded).map(([key, reason]) => `${key}: ${typeof reason === 'string' ? reason : JSON.stringify(reason)}`);
  return typeof decoded === 'string' && decoded.trim() ? [decoded] : [];
}
function publicUrl(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;
  try { const url = new URL(raw); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
function startValue(startAt: unknown, startDate: unknown): string | null {
  // The source's explicit timestamp has priority. No local timezone is guessed.
  return text(startAt) ?? text(startDate);
}
function validity(startAt: unknown, startDate: unknown, evaluatedAt: string) {
  return classifyEventValidity(startValue(startAt, startDate), evaluatedAt);
}

function connection() {
  const configured = process.env.EVENT_GTM_DATASET_PATH;
  const catalogPath = configured ? resolve(configured) : [resolve(process.cwd(), '..', DATASET_RELATIVE), resolve(process.cwd(), DATASET_RELATIVE)].find(existsSync);
  if (!catalogPath) throw new DatasetUnavailableError();
  if (cached?.path === catalogPath) return cached;
  try {
    const db = new DatabaseSync(catalogPath, { readOnly: true });
    db.exec('PRAGMA query_only = ON');
    db.function('event_validity', { deterministic: true }, (at, day, evaluatedAt) => validity(at, day, String(evaluatedAt)).validity);
    // Fail at the connection boundary rather than return a misleading empty catalog.
    db.prepare('SELECT id FROM canonical_event_editions LIMIT 1').get();
    cached?.db.close();
    cached = { path: catalogPath, db };
    return cached;
  } catch { throw new DatasetUnavailableError(); }
}

export function parseFilters(params: URLSearchParams): SearchFilters {
  const scope = params.get('scope');
  return {
    q: (params.get('q') ?? '').trim().slice(0, 500),
    from: date(params.get('from')), to: date(params.get('to')),
    country: (params.get('country') ?? '').trim().slice(0, 100),
    scope: scope === 'history' || scope === 'all' ? scope : 'upcoming',
    sector: params.get('sector') === 'all' ? 'all' : 'tech',
    page: integer(params.get('page'), 1, 100000),
    pageSize: integer(params.get('pageSize'), 24, 50),
  };
}

function normalizeFilters(filters: SearchFilters): SearchFilters {
  return parseFilters(new URLSearchParams(Object.entries(filters).map(([key, value]) => [key, String(value)])));
}

export function searchTokens(query: string): string[] {
  // User text never becomes FTS syntax: quotes, operators and punctuation are removed.
  return [...new Set((query.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter(token => token.length > 1 && token.length <= 48 && !STOPWORDS.has(token)))].slice(0, 16);
}

const SOURCE_FIELDS = `s.id AS source_record_id, s.url AS source_url, s.title AS source_title,
  s.publisher AS source_publisher, s.observed_at AS source_observed_at, s.reuse_status AS source_reuse_status`;
const EVENT_FIELDS = `e.*, m.city AS metadata_city, m.country_normalized AS metadata_country,
  m.category AS metadata_category, m.latitude AS metadata_latitude, m.longitude AS metadata_longitude,
  m.geo_precision AS metadata_precision, m.geo_method AS metadata_geo_method, ${SOURCE_FIELDS}`;
const EVENT_JOINS = `LEFT JOIN scale_event_metadata m ON m.event_id=e.id LEFT JOIN sources s ON s.id=e.source_id`;
const NOT_CANCELLED = `lower(coalesce(e.status,'')) NOT LIKE '%cancel%'`;
const TECH = `(e.sector IN ('technology','academic-technology') OR m.category IN ('technology','academic-technology'))`;

function source(row: Row): SourceRecord | null {
  const id = text(row.source_record_id);
  return id ? { id, url: publicUrl(row.source_url), title: text(row.source_title), publisher: text(row.source_publisher), observedAt: text(row.source_observed_at), reuseStatus: text(row.source_reuse_status) } : null;
}
function summaries(rows: Row[], evaluatedAt: string): EventSummary[] {
  if (!rows.length) return [];
  const ids = rows.map(row => String(row.id));
  const counts = connection().db.prepare(`SELECT event_id, count(DISTINCT company_id) AS n FROM event_company_roles WHERE role='sponsor' AND event_id IN (${ids.map(() => '?').join(',')}) GROUP BY event_id`).all(...ids) as Row[];
  const sponsorCounts = new Map(counts.map(row => [String(row.event_id), Number(row.n)]));
  return rows.map(row => {
    const state = validity(row.start_at, row.start_date, evaluatedAt);
    const start = text(row.start_date) ?? text(row.start_at)?.slice(0, 10) ?? null;
    const temporalStatus: TemporalStatus = state.validity === 'past' ? 'past' : start === evaluatedAt.slice(0, 10) ? 'today' : state.validity === 'upcoming' ? 'upcoming' : 'undated';
    const missing = strings(row.missing_reasons_json);
    if (state.validity === 'date_ambiguous') missing.push('Start time or timezone is uncertain; not treated as a confirmed future opportunity.');
    if (state.validity === 'date_pending') missing.push('A verifiable start date is missing.');
    if (String(row.status).toLowerCase().includes('reschedul')) missing.push('Rescheduled listing: reconfirm the current dates with the organizer.');
    if (String(row.status).includes('unconfirmed')) missing.push('Listed occurrence; actual occurrence and availability are unconfirmed.');
    const lat = row.metadata_latitude, lng = row.metadata_longitude;
    const coordinatesValid = typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
    const origin = source(row);
    return {
      id: String(row.id), title: text(row.title) ?? 'Untitled event', url: publicUrl(row.canonical_url),
      startDate: start, endDate: text(row.end_date), timezone: text(row.timezone), status: text(row.status), temporalStatus,
      city: text(row.metadata_city), country: text(row.metadata_country) ?? text(row.country), modality: text(row.modality),
      category: text(row.metadata_category) ?? text(row.sector), topics: strings(row.topics_json),
      location: { latitude: coordinatesValid ? lat : null, longitude: coordinatesValid ? lng : null,
        precision: text(row.metadata_precision) ?? text(row.geo_precision), method: text(row.metadata_geo_method), sourceUrl: origin?.url ?? null },
      source: origin, sponsorCount: sponsorCounts.get(String(row.id)) ?? 0, missing: [...new Set(missing)],
    };
  });
}

export function getCatalogStats(now?: Clock): CatalogStats {
  const evaluatedAt = clock(now), state = connection();
  if (state.stats?.key === evaluatedAt) return state.stats.value;
  const totals = state.db.prepare(`SELECT count(*) AS total,
    sum(CASE WHEN ${NOT_CANCELLED} AND event_validity(e.start_at,e.start_date,?)='upcoming' THEN 1 ELSE 0 END) AS upcoming FROM canonical_event_editions e`).get(evaluatedAt) as Row;
  const sponsor = state.db.prepare(`SELECT count(*) AS relations, count(DISTINCT r.company_id) AS companies FROM event_company_roles r JOIN canonical_event_editions e ON e.id=r.event_id WHERE r.role='sponsor'`).get() as Row;
  const observed = state.db.prepare('SELECT max(observed_at) AS cutoff FROM sources').get() as Row;
  const value = { total: Number(totals.total), upcoming: Number(totals.upcoming), sponsorRelations: Number(sponsor.relations), sponsorCompanies: Number(sponsor.companies), cutoff: text(observed.cutoff)?.slice(0, 10) ?? 'unknown' };
  state.stats = { key: evaluatedAt, value };
  return value;
}

export function searchEvents(input: SearchFilters, now?: Clock): SearchResponse {
  const filters = normalizeFilters(input), evaluatedAt = clock(now), state = connection();
  const conditions: string[] = [], args: SQLInputValue[] = [];
  const tokens = searchTokens(filters.q);
  const hasQuery = !!tokens.length;
  const searchJoin = hasQuery ? `JOIN (SELECT event_id, min(rank) AS search_rank FROM scale_event_search WHERE scale_event_search MATCH ? GROUP BY event_id) matched ON matched.event_id=e.id` : '';
  if (hasQuery) args.push(tokens.map(token => `"${token}"`).join(' OR '));
  // A punctuation-only query has no lexical meaning; it behaves as an empty search.
  if (filters.sector === 'tech') conditions.push(TECH);
  if (filters.scope === 'upcoming') { conditions.push(NOT_CANCELLED, `event_validity(e.start_at,e.start_date,?)='upcoming'`); args.push(evaluatedAt); }
  if (filters.scope === 'history') { conditions.push(`event_validity(e.start_at,e.start_date,?)='past'`); args.push(evaluatedAt); }
  if (filters.country) { conditions.push(`lower(coalesce(nullif(m.country_normalized,''),e.country,''))=lower(?)`); args.push(filters.country); }
  if (filters.from) { conditions.push('e.start_date >= ?'); args.push(filters.from); }
  if (filters.to) { conditions.push('e.start_date <= ?'); args.push(filters.to); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const from = `FROM canonical_event_editions e ${EVENT_JOINS} ${searchJoin} ${where}`;
  const count = state.db.prepare(`SELECT count(*) AS n ${from}`).get(...args) as Row;
  const total = Number(count.n), totalPages = Math.ceil(total / filters.pageSize);
  const page = totalPages ? Math.min(filters.page, totalPages) : 1;
  const order = `${hasQuery ? 'matched.search_rank ASC,' : ''} e.start_date ${filters.scope === 'history' ? 'DESC' : 'ASC'}, e.id ASC`;
  const rows = state.db.prepare(`SELECT ${EVENT_FIELDS} ${from} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...args, filters.pageSize, (page - 1) * filters.pageSize) as Row[];
  if (!state.countries) state.countries = (state.db.prepare(`SELECT DISTINCT coalesce(nullif(m.country_normalized,''),e.country) AS country FROM canonical_event_editions e LEFT JOIN scale_event_metadata m ON m.event_id=e.id WHERE coalesce(nullif(m.country_normalized,''),e.country) IS NOT NULL ORDER BY country`).all() as Row[]).map(row => String(row.country)).filter(Boolean);
  return { events: summaries(rows, evaluatedAt), total, page, pageSize: filters.pageSize, totalPages, evaluatedAt, countries: state.countries, stats: getCatalogStats(evaluatedAt) };
}

function canonicalId(id: string): string {
  const db = connection().db, visited = new Set<string>();
  let current = id;
  for (let i = 0; i < 10; i++) {
    if (visited.has(current)) return id;
    visited.add(current);
    const redirect = db.prepare('SELECT canonical_event_id FROM scale_event_redirects WHERE alias_event_id=?').get(current) as Row | undefined;
    if (!redirect) return current;
    current = String(redirect.canonical_event_id);
  }
  return current;
}

export function getEventDetail(id: string, now?: Clock): EventDetail | null {
  if (!id || id.length > 300) return null;
  const db = connection().db, evaluatedAt = clock(now), resolvedId = canonicalId(id);
  const row = db.prepare(`SELECT ${EVENT_FIELDS} FROM canonical_event_editions e ${EVENT_JOINS} WHERE e.id=?`).get(resolvedId) as Row | undefined;
  if (!row) return null;
  const summary = summaries([row], evaluatedAt)[0];
  const evidenceWhere = `(a.entity_table='event_editions' OR a.entity_table='scale_event_metadata') AND a.entity_id=?`;
  const count = db.prepare(`SELECT count(*) AS n FROM assertions a WHERE ${evidenceWhere}`).get(resolvedId) as Row;
  const assertionRows = db.prepare(`SELECT a.*, ${SOURCE_FIELDS} FROM assertions a LEFT JOIN sources s ON s.id=a.source_id WHERE ${evidenceWhere} ORDER BY a.observed_at DESC, a.field, a.id LIMIT ?`).all(resolvedId, EVIDENCE_LIMIT) as Row[];
  const evidence: EvidenceRecord[] = assertionRows.map(a => ({ id: String(a.id), field: String(a.field), value: parsed(a.value_json), text: text(a.evidence_paraphrase), locator: text(a.locator), evidenceClass: text(a.evidence_class), conflictStatus: text(a.conflict_status), observedAt: text(a.observed_at), source: source(a) }));
  const roleRows = db.prepare(`SELECT r.*, c.name AS company_name, c.domain AS company_domain, ${SOURCE_FIELDS} FROM event_company_roles r LEFT JOIN companies c ON c.id=r.company_id LEFT JOIN sources s ON s.id=r.source_id WHERE r.event_id=? ORDER BY r.role,c.name,r.id LIMIT 100`).all(resolvedId) as Row[];
  const roles: CompanyRole[] = roleRows.map(r => ({ id: String(r.id), companyId: String(r.company_id), name: text(r.company_name) ?? 'Unidentified organization', domain: text(r.company_domain), role: String(r.role), level: text(r.level), status: text(r.relationship_status), source: source(r) }));
  const costRows = db.prepare(`SELECT c.*, ${SOURCE_FIELDS} FROM event_costs c LEFT JOIN sources s ON s.id=c.source_id WHERE c.event_id=? ORDER BY c.category,c.id LIMIT 50`).all(resolvedId) as Row[];
  const costs: EventCost[] = costRows.map(c => ({ id: String(c.id), category: text(c.category), amountMin: text(c.amount_min), amountMax: text(c.amount_max), currency: text(c.currency), unit: text(c.unit), status: text(c.cost_status), source: source(c) }));
  // Series identity, not fuzzy names or the presence of the same sponsor, defines related editions.
  const related = text(row.series_id) ? db.prepare(`SELECT ${EVENT_FIELDS} FROM canonical_event_editions e ${EVENT_JOINS} WHERE e.series_id=? AND e.id<>? ORDER BY e.start_date DESC,e.id LIMIT 6`).all(String(row.series_id), resolvedId) as Row[] : [];
  if (Number(count.n) > EVIDENCE_LIMIT) summary.missing.push(`Showing ${EVIDENCE_LIMIT} of ${count.n} evidence assertions.`);
  if (!costs.length) summary.missing.push('Complete participation costs are unknown; missing prices do not mean free.');
  if (roles.length === 100) summary.missing.push('Company roles are limited to the first 100 records.');
  return { ...summary, evidence, evidenceTotal: Number(count.n), roles, costs, relatedEditions: summaries(related, evaluatedAt) };
}
