// Minimal date declaration extracted from GrowthX contracts/evaluation.ts.
// Unknown precision or timezone stays explicit; this is not a claim revision.
export type DeclaredDate =
  | { precision: 'instant'; iso: string; timezone: string }
  | { precision: 'date_only'; date: string; timezone: string | null }
  | { precision: 'ambiguous'; text: string; earliest: string | null; latest: string | null }
  | { precision: 'unknown' };
