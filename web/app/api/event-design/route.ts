import { NextResponse } from 'next/server';
import { groundEventDesign } from '@/lib/server/taste/client';
import { getDemoWorkspaceForRequest, readBoundedJson } from '@/lib/server/workspace/session';
import { appendTimelineEvent, provisionEventPreview, readCompanyBrand, readWorkspaceSnapshot } from '@/lib/server/workspace/repository';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const workspace = await getDemoWorkspaceForRequest();
  if (!workspace) return NextResponse.json({ error: 'Start a workspace first.' }, { status: 401 });
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403 });
  try {
    const body = await readBoundedJson(request, 45000) as Record<string, unknown>;
    const snapshot = readWorkspaceSnapshot(workspace);
    const draft = snapshot.drafts.find(item => item.opportunityId === body.opportunityId);
    if (!draft) return NextResponse.json({ error: 'Save the event draft first.' }, { status: 400 });
    const brand = readCompanyBrand(workspace);
    if (!brand || brand.status !== 'completed') return NextResponse.json({ error: 'The company brand is still being prepared.' }, { status: 409 });
    const design = await groundEventDesign(workspace, `Shape a complete event experience for ${brand.name}: venue character, guest mix, invitation copy, imagery, atmosphere, lighting and food. Apply the company identity. Proposed event: ${draft.fields.title}. Description: ${draft.fields.description}. Audience: ${draft.fields.audience}. Preserve unknown dates, venue availability and prices. Prepare a branded landing with the extracted palette and logo.`);
    const preview = provisionEventPreview(workspace, { opportunityId: draft.opportunityId, fields: draft.fields, brand, design });
    const run = snapshot.runs[0];
    if (run) appendTimelineEvent(workspace, { runId: run.id, opportunityId: draft.opportunityId, role: 'producer', kind: 'preview.provisioned', message: 'A Taste event landing is ready.', metadata: { url: `/preview/${preview.id}`, visibility: 'private' } });
    return NextResponse.json({ design, previewUrl: `/preview/${preview.id}`, brand });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'The event design could not be prepared.' }, { status: 502 }); }
}
