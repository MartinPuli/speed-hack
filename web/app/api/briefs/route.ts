import type { ResearchBrief } from '@/lib/contracts/event-gtm';
import { NextResponse } from 'next/server';
import { WorkspaceVersionConflict, saveBrief } from '@/lib/server/workspace/repository';
import { getDemoWorkspaceForRequest, readBoundedJson } from '@/lib/server/workspace/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const fields = ['company', 'website', 'objective', 'audience', 'topics', 'geography', 'from', 'to', 'budget', 'currency', 'constraints'] as const;
function isBrief(value: unknown): value is ResearchBrief {
  if (!value || typeof value !== 'object') return false;
  const brief = value as Record<string, unknown>;
  if (!fields.every((field) => typeof brief[field] === 'string' && (brief[field] as string).length <= 2000)) return false;
  return ['adoption', 'feedback', 'awareness', 'partnerships'].includes(String(brief.objective));
}

export async function POST(request: Request) {
  const workspaceId = await getDemoWorkspaceForRequest();
  if (!workspaceId) return NextResponse.json({ error: 'A demo session is required.' }, { status: 401 });
  try {
    const body = await readBoundedJson(request, 32_000) as Record<string, unknown>;
    const brief = body?.brief ?? body;
    if (!isBrief(brief)) return NextResponse.json({ error: 'Brief fields are invalid.' }, { status: 400 });
    const expectedVersion = body?.expectedVersion;
    if (expectedVersion !== undefined && (!Number.isSafeInteger(expectedVersion) || Number(expectedVersion) < 0)) {
      return NextResponse.json({ error: 'expectedVersion must be a non-negative integer.' }, { status: 400 });
    }
    return NextResponse.json(saveBrief(workspaceId, brief, expectedVersion as number | undefined), { status: 201 });
  } catch (error) {
    if (error instanceof WorkspaceVersionConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    const message = error instanceof Error ? error.message : 'Brief could not be saved.';
    return NextResponse.json({ error: message }, { status: message.includes('too large') ? 413 : 400 });
  }
}
