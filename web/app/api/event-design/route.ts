import { NextResponse } from 'next/server';
import { groundEventDesign } from '@/lib/server/taste/client';
import { getDemoWorkspaceForRequest, readBoundedJson } from '@/lib/server/workspace/session';
import { provisionEventPreview, readCompanyBrand } from '@/lib/server/workspace/repository';
import { TASTE_OPPORTUNITIES } from '@/lib/demo/taste-labs';
import type { EventDraftFields } from '@/lib/contracts/agent-workspace';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const workspace = await getDemoWorkspaceForRequest();
  if (!workspace) return NextResponse.json({ error: 'Start a workspace first.' }, { status: 401 });
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403 });
  try {
    const body = await readBoundedJson(request, 18000) as Record<string, unknown>;
    const opportunity = TASTE_OPPORTUNITIES.find(event => event.id === body.eventId && event.kind === 'host');
    const draft = body.draft as Record<string, unknown>;
    if (!opportunity || !draft || !['title', 'description', 'date', 'time', 'venue', 'audience', 'capacity'].every(key => typeof draft[key] === 'string' && String(draft[key]).length <= 5000)) return NextResponse.json({ error: 'The event draft is invalid.' }, { status: 400 });
    const brand = readCompanyBrand(workspace);
    if (!brand || brand.status !== 'completed') return NextResponse.json({ error: 'The company brand is still being prepared.' }, { status: 409 });
    const prompt = `Art direct an unpublished event page for ${brand.name}. Preserve these proposed facts; do not invent attendance, venues or sponsors. Event: ${draft.title}. Description: ${draft.description}. Audience: ${draft.audience}. Format: ${opportunity.format}. Keep the event page minimal and accessible. Apply the company logo, typographic hierarchy and extracted palette. This is the event creation surface only; preserve the surrounding GrowthX workspace design.`;
    const design = await groundEventDesign(workspace, prompt);
    const fields: EventDraftFields = { title: String(draft.title), description: String(draft.description), audience: String(draft.audience), format: opportunity.format, agenda: opportunity.agenda.map(item => `${item.time} — ${item.activity}`).join('\n'), host: `${brand.name} · proposed`, cta: 'Registration not open', date: `${draft.date} · proposed · ${draft.time}`, timezone: 'America/Los_Angeles', location: `${draft.venue} · unconfirmed`, productionBrief: opportunity.recommendation, sourceRefs: opportunity.sources.map(source => source.url) };
    const preview = provisionEventPreview(workspace, { opportunityId: null, fields, brand, design });
    return NextResponse.json({ design, previewUrl: `/preview/${preview.id}`, brand });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'The event design could not be prepared.' }, { status: 502 }); }
}
