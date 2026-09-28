import { NextResponse } from 'next/server';
import { DatasetUnavailableError, getEventDetail } from '@/lib/server/dataset-repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const event = getEventDetail(id);
    return event ? NextResponse.json(event, { headers: { 'Cache-Control': 'no-store' } }) : NextResponse.json({ error: 'This event was not found in the canonical research catalog.' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof DatasetUnavailableError ? error.message : 'The event evidence could not be loaded. Please try again.' }, { status: error instanceof DatasetUnavailableError ? 503 : 500 });
  }
}
