import type { EventDraftFields } from '@/lib/contracts/agent-workspace';
import { NextResponse } from 'next/server';
import { WorkspaceNotFound, WorkspaceVersionConflict, updateDraft } from '@/lib/server/workspace/repository';
import { getDemoWorkspaceForRequest, readBoundedJson } from '@/lib/server/workspace/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function validFields(value: unknown): value is EventDraftFields {
  if (!value || typeof value !== 'object') return false;
  const fields = value as Record<string, unknown>;
  const stringFields = ['title', 'description', 'audience', 'format', 'agenda', 'host', 'cta', 'date', 'timezone', 'location', 'productionBrief'];
  if (fields.proposedDetails !== undefined) {
    if (!fields.proposedDetails || typeof fields.proposedDetails !== 'object') return false;
    const proposed = fields.proposedDetails as Record<string, unknown>;
    if (!['date', 'time', 'venue', 'capacity'].every(key => typeof proposed[key] === 'string' && proposed[key].length <= 500)) return false;
  }
  return stringFields.every((field) => typeof fields[field] === 'string' && (fields[field] as string).length <= 5000)
    && Array.isArray(fields.sourceRefs) && fields.sourceRefs.length <= 40
    && fields.sourceRefs.every((ref) => typeof ref === 'string' && ref.length <= 500);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const workspaceId = await getDemoWorkspaceForRequest();
  if (!workspaceId) return NextResponse.json({ error: 'A demo session is required.' }, { status: 401 });
  try {
    const body = await readBoundedJson(request, 40_000) as Record<string, unknown>;
    const fields = body?.fields ?? body;
    const expectedVersion = body?.expectedVersion;
    if (!Number.isSafeInteger(expectedVersion) || Number(expectedVersion) < 0 || !validFields(fields)) {
      return NextResponse.json({ error: 'expectedVersion or draft fields are invalid.' }, { status: 400 });
    }
    const { id } = await context.params;
    return NextResponse.json(updateDraft(workspaceId, id, Number(expectedVersion), fields, 'user'));
  } catch (error) {
    if (error instanceof WorkspaceVersionConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof WorkspaceNotFound) return NextResponse.json({ error: error.message }, { status: 404 });
    const message = error instanceof Error ? error.message : 'Draft could not be saved.';
    return NextResponse.json({ error: message }, { status: message.includes('too large') ? 413 : 400 });
  }
}
