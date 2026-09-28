import type { InboundReplyInput } from '@/lib/contracts/agent-workspace';
import { NextResponse } from 'next/server';
import { WorkspaceNotFound, WorkspaceVersionConflict, recordInboundReply } from '@/lib/server/workspace/repository';
import { getDemoWorkspaceForRequest, readBoundedJson } from '@/lib/server/workspace/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const workspaceId = await getDemoWorkspaceForRequest();
  if (!workspaceId) return NextResponse.json({ error: 'A demo session is required.' }, { status: 401 });
  try {
    const body = await readBoundedJson(request, 8_000) as Partial<InboundReplyInput>;
    if (typeof body.opportunityId !== 'string' || typeof body.messageId !== 'string'
      || typeof body.message !== 'string' || body.simulated !== true) {
      return NextResponse.json({ error: 'A simulated reply with opportunityId, messageId, and message is required.' }, { status: 400 });
    }
    const result = recordInboundReply(workspaceId, body as InboundReplyInput);
    return NextResponse.json(result, { status: result.duplicate ? 200 : 202 });
  } catch (error) {
    if (error instanceof WorkspaceVersionConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof WorkspaceNotFound) return NextResponse.json({ error: error.message }, { status: 404 });
    const message = error instanceof Error ? error.message : 'Reply could not be recorded.';
    return NextResponse.json({ error: message }, { status: message.includes('too large') ? 413 : 400 });
  }
}
