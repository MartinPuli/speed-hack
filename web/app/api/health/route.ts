import { NextResponse } from 'next/server';
import { getCatalogStats } from '@/lib/server/dataset-repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try { return NextResponse.json({ status: 'ok', catalog: getCatalogStats(), catalogMode: 'read-only' }); }
  catch { return NextResponse.json({ status: 'unavailable', error: 'The read-only catalog could not be opened.' }, { status: 503 }); }
}
