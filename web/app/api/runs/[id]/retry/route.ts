import { NextResponse } from 'next/server';
import { retryFailedRun, WorkspaceVersionConflict, WorkspaceNotFound } from '@/lib/server/workspace/repository';
import { getDemoWorkspaceForRequest } from '@/lib/server/workspace/session';
export const runtime = 'nodejs';
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const workspaceId = await getDemoWorkspaceForRequest();
  if (!workspaceId) return NextResponse.json({ error: 'Open your workspace to continue.' }, { status: 401 });
  try { return NextResponse.json({ run: retryFailedRun(workspaceId, (await context.params).id) }, { status: 202 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not continue the plan.' }, { status: error instanceof WorkspaceNotFound ? 404 : error instanceof WorkspaceVersionConflict ? 409 : 400 }); }
}
