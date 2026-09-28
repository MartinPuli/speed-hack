// Date.parse normalizes some impossible dates (February 30 becomes March).
// Validate the published calendar fields before applying GrowthX's UTC range.
export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function hasValidCalendarFields(value: string): boolean {
  if (!isCalendarDate(value.slice(0, 10))) return false;
  if (value.length === 10) return true;
  const time = /^[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?/.exec(value.slice(10));
  return time !== null && Number(time[1]) < 24 && Number(time[2]) < 60 && Number(time[3] ?? 0) < 60;
}
