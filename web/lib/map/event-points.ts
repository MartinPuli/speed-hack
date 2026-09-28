// Adapted from GrowthX's map-opportunities boundary. This catalog has published
// coordinate metadata, not reviewed location claims or a San Francisco boundary.
import type { EventSummary } from '../contracts/event-gtm.ts';
import { evidenceLink } from '../evidence/source-link.ts';

export interface EventPoint {
  event: EventSummary;
  coordinates: [number, number];
  approximate: boolean;
  precisionLabel: string;
}

export function eventPoint(event: EventSummary): EventPoint | null {
  const { latitude, longitude, precision, sourceUrl } = event.location;
  if (latitude === null || longitude === null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || (latitude === 0 && longitude === 0)) return null;
  if (!precision || /unknown|unlocated|ungeocoded/.test(precision)) return null;
  if (!evidenceLink(sourceUrl ?? event.source?.url ?? null).href) return null;
  const approximate = /centroid|approximate|city/.test(precision);
  return {
    event,
    coordinates: [longitude, latitude],
    approximate,
    precisionLabel: approximate
      ? 'City centroid · approximate area, not an event venue'
      : `Published point · ${precision.replaceAll('_', ' ')} · not independently surveyed`,
  };
}

export function groupEventPoints(points: EventPoint[]) {
  const groups = new Map<string, { id: string; coordinates: [number, number]; entries: EventPoint[] }>();
  for (const point of points) {
    // Group only identical published points, without changing their coordinates.
    const id = point.coordinates.join(',');
    const group = groups.get(id) ?? { id, coordinates: point.coordinates, entries: [] };
    group.entries.push(point);
    groups.set(id, group);
  }
  return [...groups.values()];
}
