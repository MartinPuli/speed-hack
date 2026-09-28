import { createHash } from 'node:crypto';
import { workspaceCacheScope } from '@growthx/storage';
import type { CompanyBrand, EventDesignBrief } from '@/lib/contracts/company-brand';
import { readCompanyBrand, readEventDesignBrief, saveCompanyBrand, saveEventDesignBrief } from '../workspace/repository';

const BASE = 'https://api.tastelabs.com';
const activeScopes = new WeakMap<object, Map<string, Promise<CompanyBrand>>>();
const enhancingScopes = new WeakMap<object, Map<string, Promise<EventDesignBrief>>>();
function scoped<T>(scopes: WeakMap<object, Map<string, Promise<T>>>) {
  const scope = workspaceCacheScope();
  let cache = scopes.get(scope);
  if (!cache) { cache = new Map(); scopes.set(scope, cache); }
  return cache;
}
export function tasteConfigured() { return Boolean(process.env.TASTE_API_KEY?.trim()); }
export function companyUrl(value: string): string {
  const url = new URL(value.includes('://') ? value : `https://${value}`);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !url.hostname.includes('.') || /(^|\.)(localhost|local|internal)$/.test(url.hostname) || /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname) || url.hostname.includes(':')) throw new TypeError('Use a public HTTPS company website.');
  url.hash = ''; url.search = ''; url.pathname = '/';
  return url.href;
}
async function request(path: string, body?: unknown): Promise<Record<string, unknown>> {
  const key = process.env.TASTE_API_KEY?.trim();
  if (!key) throw new Error('Taste is not configured on the server.');
  const response = await fetch(`${BASE}${path}`, { method: body ? 'POST' : 'GET', headers: { 'X-API-Key': key, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store', signal: AbortSignal.timeout(45_000) });
  if (response.status === 409) return { status: 'pending' };
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Taste rejected the server credential.' : response.status === 402 ? 'Taste needs additional credits.' : `Taste could not finish this request (HTTP ${response.status}).`);
  const raw = await response.text();
  if (raw.length > 2_000_000) throw new Error('Taste returned a result larger than the supported limit.');
  return JSON.parse(raw) as Record<string, unknown>;
}
function record(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function text(value: unknown, limit = 2000): string { return typeof value === 'string' ? value.slice(0, limit) : ''; }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string').slice(0, 10).map(v => v.slice(0, 500)) : []; }
function array(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.map(record) : []; }
function assetUrl(value: unknown): string | null { try { const url = new URL(String(value)); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; } }
export function normalizeBrand(payload: Record<string, unknown>, submissionId: string, sourceUrl: string): CompanyBrand {
  const ds = record(record(payload.result).design_system);
  const profile = record(ds.profile), colors = record(ds.colors), typography = record(ds.typography), assets = record(ds.assets);
  const logos = array(assets.logos);
  const logo = logos.find(item => /monochrome/i.test(text(item.role))) ?? logos.find(item => /primary/i.test(text(item.role)));
  const font = (key: string) => text(array(record(typography[key]).variants)[0]?.name, 80);
  const palette = [...array(colors.baseline), ...array(colors.secondary)].filter(item => /^#[0-9a-f]{6}$/i.test(text(item.hex))).map(item => ({ name: text(item.name, 80), hex: text(item.hex, 7) })).slice(0, 8);
  return { submissionId, sourceUrl, status: payload.status === 'completed' ? 'completed' : payload.status === 'failed' ? 'failed' : 'pending', name: text(profile.brand_name, 100), logoUrl: assetUrl(logo?.origin_url ?? logo?.url), imagery: array(assets.media).filter(item => item.type === 'image' && !/icon|arrow|logo|bracket/i.test(text(item.name)) && assetUrl(item.origin_url ?? item.url)).slice(0, 8).map(item => ({ url: assetUrl(item.origin_url ?? item.url)!, description: `${text(item.name, 120)}. ${text(item.usage_context, 300)}` })), palette, displayFont: font('titles'), bodyFont: font('paragraphs'), tone: strings(profile.copy_tone), signature: text(profile.brand_signature), audience: strings(record(profile.strategy).target_audience), extractedAt: text(payload.completed_at, 80) || null, error: payload.status === 'failed' ? 'Taste could not extract this website. You can continue with the current design.' : null };
}
export async function refreshCompanyBrand(workspaceId: string, sourceUrl?: string): Promise<CompanyBrand | null> {
  const brand = readCompanyBrand(workspaceId, sourceUrl);
  if (!brand || (brand.status !== 'pending' && brand.imagery !== undefined)) return brand;
  const payload = await request(`/design/submissions/${encodeURIComponent(brand.submissionId)}/result?sections=profile,colors,typography,assets`);
  return saveCompanyBrand(workspaceId, normalizeBrand(payload, brand.submissionId, brand.sourceUrl));
}
export async function extractCompanyBrand(workspaceId: string, website: string): Promise<CompanyBrand> {
  const url = companyUrl(website);
  const saved = readCompanyBrand(workspaceId, url);
  if (saved) return (await refreshCompanyBrand(workspaceId, url))!;
  const key = `${workspaceId}:${url}`;
  const active = scoped(activeScopes);
  const inFlight = active.get(key); if (inFlight) return inFlight;
  const operation = (async () => {
    const payload = await request('/design/submissions', { url, force: false, enable_deep_analysis: false });
    const submissionId = text(payload.submission_id, 150);
    if (!submissionId) throw new Error('Taste did not return an extraction identifier.');
    saveCompanyBrand(workspaceId, normalizeBrand({ status: 'pending' }, submissionId, url));
    return (await refreshCompanyBrand(workspaceId, url))!;
  })();
  active.set(key, operation);
  try { return await operation; } finally { active.delete(key); }
}
export async function groundEventDesign(workspaceId: string, prompt: string): Promise<EventDesignBrief> {
  const brand = readCompanyBrand(workspaceId);
  if (!brand || brand.status !== 'completed') throw new Error('The company brand is still being prepared. Try again when it is ready.');
  const bounded = prompt.trim();
  if (bounded.length < 10 || bounded.length > 9000) throw new TypeError('The event design brief must be between 10 and 9,000 characters.');
  const hash = createHash('sha256').update(brand.submissionId + bounded).digest('hex');
  const cached = readEventDesignBrief(workspaceId, hash); if (cached) return cached;
  const key = `${workspaceId}:${hash}`;
  const enhancing = scoped(enhancingScopes);
  const inFlight = enhancing.get(key); if (inFlight) return inFlight;
  const operation = (async () => {
    const payload = await request('/design/prompts/enhance', { submission_id: brand.submissionId, prompt: bounded });
    const enhancedPrompt = text(payload.enhanced_prompt, 24000);
    if (!enhancedPrompt) throw new Error('Taste returned no design brief.');
    return saveEventDesignBrief(workspaceId, hash, { submissionId: brand.submissionId, enhancedPrompt, brandName: text(payload.brand_name, 100) || brand.name, sourceUrl: brand.sourceUrl, createdAt: new Date().toISOString() });
  })();
  enhancing.set(key, operation);
  try { return await operation; } finally { enhancing.delete(key); }
}
