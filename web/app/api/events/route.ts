import { NextResponse } from 'next/server';
import { DatasetUnavailableError, parseFilters, searchEvents } from '@/lib/server/dataset-repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    return NextResponse.json(searchEvents(parseFilters(new URL(request.url).searchParams)), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof DatasetUnavailableError ? error.message : 'The catalog search could not be completed. Please retry with a shorter query.' }, { status: error instanceof DatasetUnavailableError ? 503 : 500 });
  }
}
