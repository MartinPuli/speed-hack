import { NextResponse } from 'next/server';
import { extractCompanyBrand, refreshCompanyBrand, tasteConfigured } from '@/lib/server/taste/client';
import { getDemoWorkspaceForRequest, readBoundedJson } from '@/lib/server/workspace/session';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const workspace = await getDemoWorkspaceForRequest();
  if (!workspace) return NextResponse.json({ error: 'Start a workspace first.' }, { status: 401 });
  try { return NextResponse.json({ configured: tasteConfigured(), brand: await refreshCompanyBrand(workspace) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Brand could not be loaded.' }, { status: 502 }); }
}
export async function POST(request: Request) {
  const workspace = await getDemoWorkspaceForRequest();
  if (!workspace) return NextResponse.json({ error: 'Start a workspace first.' }, { status: 401 });
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403 });
  try {
    const body = await readBoundedJson(request, 4000) as Record<string, unknown>;
    if (typeof body.website !== 'string' || body.website.length > 500) return NextResponse.json({ error: 'Enter a company website.' }, { status: 400 });
    return NextResponse.json({ brand: await extractCompanyBrand(workspace, body.website) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Brand extraction failed.' }, { status: error instanceof TypeError ? 400 : 502 }); }
}
