import { NextResponse } from 'next/server';
import { loadPreparedDemo } from '@/lib/server/prepared-demo';
import { getDemoWorkspaceForRequest } from '@/lib/server/workspace/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const workspaceId = await getDemoWorkspaceForRequest();
  if (!workspaceId) return NextResponse.json({ error: 'A demo session is required.' }, { status: 401 });
  try { return NextResponse.json(loadPreparedDemo(workspaceId)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'The prepared demo could not be opened.' }, { status: 400 }); }
}
