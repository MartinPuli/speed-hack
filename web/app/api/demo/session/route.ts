import { NextResponse } from 'next/server';
import { createDemoSession } from '@/lib/server/workspace/repository';
import { DEMO_SESSION_COOKIE, demoModeEnabled } from '@/lib/server/workspace/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  if (!demoModeEnabled()) return NextResponse.json({ error: 'Demo sessions are disabled.' }, { status: 404 });
  const session = createDemoSession();
  const response = NextResponse.json({ expiresAt: session.expiresAt, demoMode: true });
  response.cookies.set(DEMO_SESSION_COOKIE, session.token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/',
    maxAge: Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1000),
  });
  return response;
}
