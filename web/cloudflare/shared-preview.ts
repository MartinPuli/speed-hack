import type { EventPagePreview } from '../lib/server/workspace/repository';

type SharePayload = { workspace: string; preview: string; expires: number };
export async function shareToken(payload: SharePayload, secret: string) {
  const value = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${value}.${await signature(value, secret)}`;
}
async function signature(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return Buffer.from(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))).toString('base64url');
}
export async function readShare(token: string, secret: string): Promise<SharePayload | null> {
  if (token.length > 700) return null;
  const [value, proof] = token.split('.');
  if (!value || !proof) return null;
  const expected = await signature(value, secret);
  if (proof.length !== expected.length) return null;
  let difference = 0; for (let i = 0; i < proof.length; i++) difference |= proof.charCodeAt(i) ^ expected.charCodeAt(i);
  if (difference) return null;
  try { const data = JSON.parse(Buffer.from(value, 'base64url').toString()) as SharePayload; return /^[a-f0-9-]{36}(?::prepared)?$/.test(data.workspace) && /^[a-f0-9]{24}$/.test(data.preview) && data.expires > Date.now() ? data : null; } catch { return null; }
}
export function publicPreview(preview: EventPagePreview, token: string): EventPagePreview {
  return { ...preview, brand: { ...preview.brand, analysis: undefined }, fields: { ...preview.fields, productionBrief: '', sourceRefs: [], coverPrompt: undefined, coverImageUrl: preview.fields.coverImageUrl?.startsWith('/api/') ? `/api/shared/${token}/cover` : preview.fields.coverImageUrl, experience: preview.fields.experience ? { ...preview.fields.experience, budgetGuidance: '' } : undefined } };
}
export function escapeHtml(value: string) { return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!); }
