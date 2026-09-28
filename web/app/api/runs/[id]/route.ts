import { NextResponse } from 'next/server';
import { getRun, WorkspaceNotFound } from '@/lib/server/workspace/repository';
import { getDemoWorkspaceForRequest } from '@/lib/server/workspace/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const workspaceId = await getDemoWorkspaceForRequest();
  if (!workspaceId) return NextResponse.json({ error: 'A demo session is required.' }, { status: 401 });
  try {
    const { id } = await context.params;
    return NextResponse.json(getRun(workspaceId, id));
  } catch (error) {
    if (error instanceof WorkspaceNotFound) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ error: 'Run could not be loaded.' }, { status: 503 });
  }
}
