// Reused from GrowthX frontend/lib/temporal/display-date.ts; adapted to the catalog date contract.
import type { DeclaredDate } from './types.ts';
import { hasValidCalendarFields } from './calendar-validation.ts';

// Presentation only: preserve the declared timezone, uncertainty and saved text.
export function readableDate(value: string | null | undefined): string {
  if (!value) return 'Date pending';
  if (!hasValidCalendarFields(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
}
export function declaredDateLabel(date: DeclaredDate): string {
  if (date.precision === 'unknown') return 'Date pending';
  if (date.precision === 'ambiguous') return `${date.text} · Date disputed or ambiguous`;
  if (date.precision === 'date_only') return `${readableDate(date.date)} · ${date.timezone ?? 'Timezone pending'}`;
  if (date.precision !== 'instant') return 'Date pending';
  if (!hasValidCalendarFields(date.iso)) return `${date.iso} · Invalid declared date`;
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: date.timezone, timeZoneName: 'short' }).format(new Date(date.iso));
  } catch {
    // Numeric offsets are not accepted by every Intl runtime. Preserve the
    // original ISO and zone rather than display its UTC prefix as local time.
    return `${date.iso} · ${date.timezone} (timezone formatting unavailable)`;
  }
}
