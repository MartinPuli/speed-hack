// Reused from GrowthX frontend/lib/temporal/declared-date.ts; adapted to the catalog date contract.
import type { DeclaredDate } from './types.ts';
import { classifyEventValidity, type EventValidity } from './event-validity.ts';
type EditionValidityView = { validity: EventValidity; reason: string };

export function classifyDeclaredDate(date: DeclaredDate, evaluationInstant: string): EditionValidityView {
  switch (date.precision) {
    case 'instant': {
      const result = classifyEventValidity(date.iso, evaluationInstant);
      return { validity: result.validity, reason: result.reason };
    }
    case 'date_only': {
      const result = classifyEventValidity(date.date, evaluationInstant);
      return { validity: result.validity, reason: result.reason };
    }
    case 'ambiguous': {
      // Reuse the same calendar validation, unknown-zone ranges and inclusive
      // expiry boundary as all other date declarations.
      const earliest = classifyEventValidity(date.earliest, evaluationInstant);
      const latest = classifyEventValidity(date.latest, evaluationInstant);
      const inverted = earliest.startRange && latest.startRange
        && earliest.startRange.earliest > latest.startRange.latest;
      if (!inverted && latest.validity === 'past') {
        return {
          validity: 'past',
          reason: `Declared range ends (${date.latest}) at or before the evaluation instant; expired as an opportunity, kept as antecedent.`,
        };
      }
      if (!inverted && earliest.validity === 'upcoming') {
        return {
          validity: 'upcoming',
          reason: `Declared range starts (${date.earliest}) after the evaluation instant.`,
        };
      }
      return {
        validity: 'date_ambiguous',
        reason: `Declared date "${date.text}" is ambiguous around the evaluation instant; it stays pending instead of guessing.`,
      };
    }
    case 'unknown':
      return {
        validity: 'date_pending',
        reason: 'No declared start date; the date stays pending and is never replaced by the current time.',
      };
  }
}
