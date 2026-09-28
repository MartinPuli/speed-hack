import { NextResponse } from 'next/server';
import { readWorkspaceSnapshot } from '@/lib/server/workspace/repository';
import { getDemoWorkspaceForRequest } from '@/lib/server/workspace/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const workspaceId = await getDemoWorkspaceForRequest();
  if (!workspaceId) return NextResponse.json({ error: 'A demo session is required.' }, { status: 401 });
  try { return NextResponse.json(readWorkspaceSnapshot(workspaceId)); }
  catch { return NextResponse.json({ error: 'Workspace could not be loaded.' }, { status: 503 }); }
}
