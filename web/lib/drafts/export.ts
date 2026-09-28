// Extraído del patrón composeDecisionBrief/copyText de GrowthX
// frontend/lib/research/decision-brief.ts. La salida es un brief local, sin publicación.
import type { EventSummary, ResearchBrief } from '../contracts/event-gtm.ts';
import { evidenceLink } from '../evidence/source-link.ts';

const line = (value: string | null | undefined) => value?.replace(/[\r\n]+/g, ' ').trim() || 'Pending';
const link = (value: string | null | undefined) => evidenceLink(value ?? null).href ?? 'Source unavailable';

export function composeResearchBrief(brief: ResearchBrief, events: EventSummary[]): string {
  return [
    '# Event GTM · Research brief',
    '',
    'Working shortlist for investigation. No participation, sponsor interest or event availability is confirmed by this export.',
    '',
    '## Your brief',
    `Company / product: ${line(brief.company)}`,
    `Website supplied by you (not automatically researched): ${line(brief.website)}`,
    `Objective: ${line(brief.objective)}`,
    `Desired audience: ${line(brief.audience)}`,
    `Topics: ${line(brief.topics)}`,
    `Geography: ${line(brief.geography)}`,
    `Date window: ${line(brief.from)} — ${line(brief.to)}`,
    `Buyer budget: ${brief.budget.trim() ? `${line(brief.currency)} ${line(brief.budget)}` : 'Unknown; not zero'}`,
    `Constraints: ${line(brief.constraints)}`,
    '',
    '## Selected events',
    ...(events.length ? events.flatMap((event, i) => [
      '',
      `### ${i + 1}. ${line(event.title)}`,
      `Dataset ID: ${event.id}`,
      `Date: ${line(event.startDate)}${event.endDate ? ` — ${line(event.endDate)}` : ''} · ${line(event.timezone)}`,
      `Date classification: ${event.temporalStatus}. Listed status: ${line(event.status)}`,
      `Location: ${line(event.city)}, ${line(event.country)}`,
      `Map precision: ${line(event.location.precision)}`,
      `Listing: ${link(event.url)}`,
      `Source: ${link(event.source?.url)}`,
      `Source observed: ${line(event.source?.observedAt)}`,
      `Documented sponsor relationships: ${event.sponsorCount}. Current interest remains unknown.`,
      'Participation cost: not established by this shortlist; consult the dossier and confirm the full quote.',
      `Open questions: ${event.missing.length ? event.missing.map(line).join('; ') : 'Confirm availability, audience fit, participation terms and total cost.'}`,
    ]) : ['No events selected.']),
    '',
    '## Next step',
    'Review each source, confirm the event status and request current participation conditions before committing resources.',
    'This file is a local research brief. It is not a Luma event, a published campaign or a message sent to an organizer.',
    '',
  ].join('\n');
}

export function downloadResearchBrief(brief: ResearchBrief, events: EventSummary[]): void {
  const url = URL.createObjectURL(new Blob([composeResearchBrief(brief, events)], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'event-gtm-research-brief.md';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Conserva el resultado explícito de GrowthX cuando el navegador no permite copiar.
export async function copyText(text: string): Promise<string> {
  try {
    if (!navigator.clipboard?.writeText) return 'Clipboard unavailable. Select and copy the preview text manually.';
    await navigator.clipboard.writeText(text);
    return 'Copied to clipboard';
  } catch {
    return 'Copy failed. Select and copy the preview text manually.';
  }
}
