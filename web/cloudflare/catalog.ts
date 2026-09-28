import snapshot from './generated/catalog.json';
import type { EventDetail, SearchFilters, SearchResponse } from '../lib/contracts/event-gtm';
const events = snapshot.events as EventDetail[];
export function getEventDetail(id: string): EventDetail | null { return events.find(event => event.id === id) ?? null; }
export function searchEvents(filters: SearchFilters): SearchResponse {
  const normalized = (value: string | null) => (value ?? '').toLowerCase();
  const terms = filters.q.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter(term => term.length > 1) ?? [];
  const found = events.filter(event => {
    if (filters.city && !normalized(event.city).includes(normalized(filters.city))) return false;
    if (filters.country && normalized(event.country) !== normalized(filters.country)) return false;
    if (filters.from && (!event.startDate || event.startDate.slice(0, 10) < filters.from)) return false;
    if (filters.to && (!event.startDate || event.startDate.slice(0, 10) > filters.to)) return false;
    const text = `${event.title} ${event.topics.join(' ')} ${event.category}`.toLowerCase();
    return !terms.length || terms.some(term => text.includes(term));
  });
  const size = Math.min(filters.pageSize || 24, 50);
  return { events: found.slice((filters.page - 1) * size, filters.page * size), total: found.length, page: filters.page, pageSize: size, totalPages: Math.ceil(found.length / size), evaluatedAt: snapshot.exportedAt, countries: [...new Set(events.flatMap(event => event.country ? [event.country] : []))], stats: { total: events.length, upcoming: events.length, sponsorRelations: events.reduce((sum, event) => sum + event.roles.length, 0), sponsorCompanies: new Set(events.flatMap(event => event.roles.map(role => role.companyId))).size, cutoff: snapshot.exportedAt } };
}
