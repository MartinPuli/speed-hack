import { NextResponse } from 'next/server';
import { WorkspaceNotFound, WorkspaceVersionConflict, createRun } from '@/lib/server/workspace/repository';
import { getDemoWorkspaceForRequest, readBoundedJson } from '@/lib/server/workspace/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const workspaceId = await getDemoWorkspaceForRequest();
  if (!workspaceId) return NextResponse.json({ error: 'A demo session is required.' }, { status: 401 });
  try {
    const body = await readBoundedJson(request, 8_000) as Record<string, unknown>;
    if (body.opportunityId !== undefined && (typeof body.opportunityId !== 'string' || body.opportunityId.length > 120)) {
      return NextResponse.json({ error: 'opportunityId is invalid.' }, { status: 400 });
    }
    if (body.idempotencyKey !== undefined && (typeof body.idempotencyKey !== 'string' || body.idempotencyKey.length > 200)) {
      return NextResponse.json({ error: 'idempotencyKey is invalid.' }, { status: 400 });
    }
    if (body.objective !== undefined && (typeof body.objective !== 'string' || body.objective.length > 1200)) return NextResponse.json({ error: 'The request is too long.' }, { status: 400 });
    const result = createRun(workspaceId, {
      opportunityId: body.opportunityId as string | undefined,
      objective: body.objective as string | undefined,
      idempotencyKey: body.idempotencyKey as string | undefined,
    });
    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    if (error instanceof WorkspaceVersionConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof WorkspaceNotFound) return NextResponse.json({ error: error.message }, { status: 404 });
    const message = error instanceof Error ? error.message : 'Run could not be created.';
    return NextResponse.json({ error: message }, { status: message.includes('too large') ? 413 : 400 });
  }
}
