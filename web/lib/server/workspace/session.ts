import { cookies } from 'next/headers';
import { resolveDemoWorkspaceId } from './repository';

export const DEMO_SESSION_COOKIE = 'event_gtm_demo_session';

export function demoModeEnabled(): boolean {
  if (process.env.NODE_ENV !== 'production') return process.env.EVENT_GTM_DEMO_ENABLED !== 'false';
  return process.env.EVENT_GTM_DEMO_ENABLED === 'true';
}

export async function getDemoWorkspaceForRequest(): Promise<string | null> {
  if (!demoModeEnabled()) return null;
  const jar = await cookies();
  const token = jar.get(DEMO_SESSION_COOKIE)?.value;
  return token ? resolveDemoWorkspaceId(token) : null;
}

export async function readBoundedJson(request: Request, maxBytes: number): Promise<unknown> {
  const rawLength = Number(request.headers.get('content-length') ?? 0);
  if (rawLength > maxBytes) throw new TypeError('Request body is too large.');
  if (!request.body) throw new TypeError('A JSON request body is required.');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new TypeError('Request body is too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)) as unknown; }
  catch { throw new TypeError('Request body must be valid JSON.'); }
}
