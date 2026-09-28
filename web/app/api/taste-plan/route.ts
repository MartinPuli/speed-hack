import { NextResponse } from 'next/server';
import { getDemoWorkspaceForRequest } from '@/lib/server/workspace/session';
import { createOpportunity, createDraft, readWorkspaceSnapshot } from '@/lib/server/workspace/repository';
import { TASTE_OPPORTUNITIES } from '@/lib/demo/taste-labs';
export const runtime = 'nodejs';
export async function POST() {
  const workspace = await getDemoWorkspaceForRequest();
  if (!workspace) return NextResponse.json({ error: 'Start a workspace first.' }, { status: 401 });
  const before = readWorkspaceSnapshot(workspace);
  if (!before.latestBrief?.website.includes('tastelabs.com')) return NextResponse.json({ error: 'This researched plan is for Taste Labs.' }, { status: 400 });
  const mapping: Record<string, string> = {};
  for (const event of TASTE_OPPORTUNITIES) {
    const ref = `research:taste:${event.id}`;
    const opportunity = before.opportunities.find(item => item.evidenceIds.includes(ref)) ?? createOpportunity(workspace, { title: event.title, action: event.kind, state: event.kind === 'host' ? 'proposal' : 'needs_review', rationale: event.recommendation, evidenceIds: [ref, ...event.sources.map(source => source.url)] });
    mapping[event.id] = opportunity.id;
    if (event.draft && !before.drafts.some(draft => draft.opportunityId === opportunity.id)) {
      createDraft(workspace, opportunity.id, { title: event.draft.title, description: event.draft.description, audience: event.draft.audience, format: event.format, agenda: event.agenda.map(item => `${item.time}: ${item.activity}`).join('\n'), host: 'Taste Labs · proposed', cta: 'Registration not open', date: '', timezone: '', location: '', productionBrief: `${event.recommendation}\nProposed (unconfirmed): ${event.draft.date}, ${event.draft.time}, ${event.draft.venue}.\n${event.unknowns.join('\n')}`, proposedDetails: { date: event.draft.date, time: event.draft.time, venue: event.draft.venue, capacity: event.draft.capacity }, sourceRefs: [ref, ...event.sources.map(source => source.url)] }, 'user');
    }
  }
  return NextResponse.json({ mapping, workspace: readWorkspaceSnapshot(workspace) });
}
