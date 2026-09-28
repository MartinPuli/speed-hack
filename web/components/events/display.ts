import type { EventCost, EventSummary } from '@/lib/contracts/event-gtm';

export function displayDate(value: string | null): string {
  if (!value) return 'Date not documented';
  const day = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (!day) return value;
  const parsed = new Date(`${day}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(parsed);
}

export const displayLocation = (event: EventSummary) => [event.city, event.country].filter(Boolean).join(', ') || (event.modality === 'online' ? 'Online' : 'Location not documented');
export const humanize = (value: string | null) => value ? value.replaceAll('_', ' ') : 'Not documented';
export const temporalKind = (event: EventSummary) => /cancel/i.test(event.status || '') ? 'cancelled' : /reschedul/i.test(event.status || '') ? 'rescheduled' : event.temporalStatus;
export const temporalLabel = (event: EventSummary) => ({ upcoming: 'Upcoming', today: 'Starts today', past: 'Historical edition', undated: 'Date pending', cancelled: 'Cancelled', rescheduled: 'Rescheduled · confirm date' })[temporalKind(event)];

export function costText(cost: EventCost): string {
  if (cost.amountMin === null && cost.amountMax === null) return 'Amount not documented';
  const amount = cost.amountMin === cost.amountMax ? cost.amountMin : cost.amountMin !== null && cost.amountMax !== null ? `${cost.amountMin}–${cost.amountMax}` : cost.amountMin !== null ? `from ${cost.amountMin}` : `up to ${cost.amountMax}`;
  return `${cost.currency || 'Currency unknown'} ${amount}${cost.unit ? ` / ${humanize(cost.unit)}` : ''}`;
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined) return 'Value not documented';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value, null, 2);
}
