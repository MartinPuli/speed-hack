import { DurableObject } from 'cloudflare:workers';
import { initialize, inWorkspace } from './storage';
import * as repository from '../lib/server/workspace/repository';
import { BrainbaseModelClient } from '../lib/server/agents/brainbase-client';
import { AgentTaskYield } from '../lib/server/agents/model-client';
import { dispatchClaimedTask } from '../lib/server/agents/dispatcher';
import { extractCompanyBrand, groundEventDesign, refreshCompanyBrand } from '../lib/server/taste/client';
import { TASTE_OPPORTUNITIES } from '../lib/demo/taste-labs';
import type { ResearchBrief } from '../lib/contracts/event-gtm';
import type { EventDraftFields } from '../lib/contracts/agent-workspace';
import { getEventDetail } from './catalog';

interface Env {
  ASSETS: Fetcher;
  WORKSPACES: DurableObjectNamespace<EventWorkspace>;
  BRAINBASE_API_KEY?: string;
  TASTE_API_KEY: string;
  SESSION_SECRET: string;
}
const COOKIE = 'growthx_workspace';
async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
async function session(request: Request, secret: string): Promise<string | null> {
  const raw = request.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  const [id, expiration, signature] = raw?.split('.') ?? [];
  if (!id || !/^[a-f0-9-]{36}$/.test(id) || !expiration || Number(expiration) < Date.now() || !signature) return null;
  const expected = await sign(`${id}.${expiration}`, secret);
  if (expected.length !== signature.length) return null;
  let different = 0;
  for (let i = 0; i < expected.length; i++) different |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return different ? null : id;
}
async function json(request: Request, max = 45_000): Promise<Record<string, unknown>> {
  if (Number(request.headers.get('content-length')) > max) throw new TypeError('This request is too large.');
  const reader = request.body?.getReader();
  if (!reader) return {};
  const chunks: Uint8Array[] = []; let size = 0;
  for (;;) { const result = await reader.read(); if (result.done) break; size += result.value.length; if (size > max) { await reader.cancel(); throw new TypeError('This request is too large.'); } chunks.push(result.value); }
  const raw = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { raw.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(raw));
}

export class EventWorkspace extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    initialize(ctx.storage);
    // Secrets belong to this deployment, never to browser bundles or model prompts.
    process.env.TASTE_API_KEY = env.TASTE_API_KEY ?? '';
  }
  async handle(request: Request): Promise<Response> {
    return inWorkspace(this.ctx.storage, async () => {
      try {
        const id = repository.getDemoWorkspaceId();
        const path = new URL(request.url).pathname;
        const method = request.method;
        const body = method === 'GET' ? {} : await json(request);
        if (path === '/api/workspace') {
          const snapshot = repository.readWorkspaceSnapshot(id);
          if (snapshot.tasks.some(task => ['queued', 'running'].includes(task.status))) await this.ctx.storage.setAlarm(Date.now() + 1000);
          return Response.json({ ...snapshot, modelConfigured: Boolean(this.env.BRAINBASE_API_KEY), provider: 'brainbase', opportunities: snapshot.opportunities.map(item => ({ ...item, event: item.catalogEventId ? getEventDetail(item.catalogEventId) : null })) });
        }
        if (path === '/api/briefs' && method === 'POST') {
          const brief = body.brief as ResearchBrief;
          if (!brief || !['company', 'website', 'objective', 'audience', 'topics', 'geography', 'from', 'to', 'budget', 'currency', 'constraints'].every(key => typeof (brief as unknown as Record<string, unknown>)[key] === 'string') || JSON.stringify(brief).length > 24_000) throw new TypeError('Complete the company brief.');
          return Response.json(repository.saveBrief(id, brief, Number(body.expectedVersion)), { status: 201 });
        }
        if (path === '/api/brand') {
          if (method === 'GET') return Response.json({ configured: Boolean(this.env.TASTE_API_KEY), brand: await refreshCompanyBrand(id) });
          if (typeof body.website !== 'string' || body.website.length > 500) throw new TypeError('Enter your company website.');
          return Response.json({ brand: await extractCompanyBrand(id, body.website) });
        }
        if (path === '/api/taste-plan' && method === 'POST') {
          const before = repository.readWorkspaceSnapshot(id);
          const mapping: Record<string, string> = {};
          for (const event of TASTE_OPPORTUNITIES) {
            const ref = `research:taste:${event.id}`;
            const opportunity = before.opportunities.find(item => item.evidenceIds.includes(ref)) ?? repository.createOpportunity(id, { title: event.title, action: event.kind, state: event.kind === 'host' ? 'proposal' : 'needs_review', rationale: event.recommendation, evidenceIds: [ref, ...event.sources.map(source => source.url)] });
            mapping[event.id] = opportunity.id;
            if (event.draft && !before.drafts.some(draft => draft.opportunityId === opportunity.id)) repository.createDraft(id, opportunity.id, { ...event.draft, format: event.format, agenda: event.agenda.map(item => `${item.time}: ${item.activity}`).join('\n'), host: 'Taste Labs · proposed', cta: 'Registration not open', date: '', timezone: '', location: '', productionBrief: event.recommendation, proposedDetails: { date: event.draft.date, time: event.draft.time, venue: event.draft.venue, capacity: event.draft.capacity }, sourceRefs: [ref, ...event.sources.map(source => source.url)] }, 'user');
          }
          return Response.json({ mapping, workspace: { ...repository.readWorkspaceSnapshot(id), modelConfigured: Boolean(this.env.BRAINBASE_API_KEY) } });
        }
        if (path === '/api/runs' && method === 'POST') {
          if (!this.env.BRAINBASE_API_KEY) return Response.json({ error: 'Connect Brainbase to start your event team.' }, { status: 503 });
          if (typeof body.objective !== 'string' || !body.objective.trim() || body.objective.length > 1200) throw new TypeError('Describe what you want your team to do.');
          const snapshot = repository.readWorkspaceSnapshot(id);
          if (snapshot.runs.some(run => ['running', 'queued'].includes(run.status))) return Response.json({ error: 'Your team is already working. Wait for this recommendation to finish.' }, { status: 409 });
          if (snapshot.runs.filter(run => Date.parse(run.createdAt) > Date.now() - 3_600_000).length >= 8) return Response.json({ error: 'This workspace has reached its hourly run limit.' }, { status: 429 });
          const result = repository.createRun(id, { objective: body.objective, opportunityId: typeof body.opportunityId === 'string' ? body.opportunityId : undefined, idempotencyKey: typeof body.idempotencyKey === 'string' ? body.idempotencyKey : crypto.randomUUID() });
          await this.ctx.storage.setAlarm(Date.now() + 100);
          return Response.json(result, { status: 202 });
        }
        if (/^\/api\/runs\/[^/]+\/retry$/.test(path) && method === 'POST') {
          if (!this.env.BRAINBASE_API_KEY) return Response.json({ error: 'Connect Brainbase to continue.' }, { status: 503 });
          const run = repository.retryFailedRun(id, path.split('/')[3]);
          await this.ctx.storage.setAlarm(Date.now() + 100);
          return Response.json({ run }, { status: 202 });
        }
        if (path.startsWith('/api/drafts/') && method === 'PATCH') return Response.json(repository.updateDraft(id, path.split('/').at(-1)!, Number(body.expectedVersion), body.fields as EventDraftFields, 'user'));
        if (path === '/api/inbound/reply' && method === 'POST') {
          if (!this.env.BRAINBASE_API_KEY) return Response.json({ error: 'Connect Brainbase to process this reply.' }, { status: 503 });
          if (body.simulated !== true || typeof body.message !== 'string' || typeof body.opportunityId !== 'string' || typeof body.messageId !== 'string') throw new TypeError('The simulated reply is invalid.');
          const result = repository.recordInboundReply(id, { opportunityId: body.opportunityId, messageId: body.messageId, message: body.message, simulated: true });
          await this.ctx.storage.setAlarm(Date.now() + 100);
          return Response.json(result, { status: 202 });
        }
        if (path.startsWith('/api/previews/') && method === 'GET') {
          const preview = repository.readEventPreview(id, path.split('/').at(-1)!);
          return preview ? Response.json(preview) : Response.json({ error: 'This draft belongs to another workspace or is unavailable.' }, { status: 404 });
        }
        if (path === '/api/event-design' && method === 'POST') {
          const brand = repository.readCompanyBrand(id);
          if (!brand || brand.status !== 'completed') return Response.json({ error: 'Your company identity is still being prepared by Taste.' }, { status: 409 });
          const draft = body.draft as Record<string, string>;
          if (!draft || !['title', 'description', 'audience'].every(key => typeof draft[key] === 'string' && draft[key].length <= 5000)) throw new TypeError('The event draft is incomplete.');
          const design = await groundEventDesign(id, `Shape the venue character, guest experience, invitation copy, cover imagery, lighting, sound, food and visual direction for an unpublished event page for ${brand.name}. Title: ${draft.title}. Description: ${draft.description}. Audience: ${draft.audience}. Use the extracted brand identity. Keep dates and venues as proposals. Preserve GrowthX's surrounding map and interface.`);
          const opportunityId = typeof body.opportunityId === 'string' ? body.opportunityId : null;
          const stored = opportunityId ? repository.readWorkspaceSnapshot(id).drafts.find(item => item.opportunityId === opportunityId) : null;
          if (opportunityId && !stored) throw new TypeError('Save the event draft first.');
          const fields: EventDraftFields = stored?.fields ?? { title: draft.title, description: draft.description, audience: draft.audience, format: 'Proposed event', agenda: '', host: brand.name, cta: 'Registration not open', date: draft.date ? `${draft.date} · proposed` : '', timezone: '', location: draft.venue ? `${draft.venue} · unconfirmed` : '', productionBrief: design.enhancedPrompt, sourceRefs: [brand.sourceUrl] };
          const preview = repository.provisionEventPreview(id, { opportunityId, fields, brand, design });
          if (opportunityId) { const run = repository.readWorkspaceSnapshot(id).runs[0]; if (run) repository.appendTimelineEvent(id, { runId: run.id, opportunityId, role: 'producer', kind: 'preview.provisioned', message: 'A Taste event landing is ready.', metadata: { url: `/preview/${preview.id}`, visibility: 'private' } }); }
          return Response.json({ design, brand, previewUrl: `/preview/${preview.id}` });
        }
        return Response.json({ error: 'This action is unavailable.' }, { status: 404 });
      } catch (error) {
        const status = error instanceof repository.WorkspaceVersionConflict ? 409 : error instanceof repository.WorkspaceNotFound ? 404 : 400;
        return Response.json({ error: error instanceof Error ? error.message : 'The request could not be completed.' }, { status });
      }
    });
  }
  async alarm() {
    await inWorkspace(this.ctx.storage, async () => {
      if (!this.env.BRAINBASE_API_KEY) return;
      const claim = repository.claimNextTask(`cloudflare-${this.ctx.id.toString().slice(0, 12)}`, 15 * 60_000, true);
      if (!claim) {
        const pending = repository.readWorkspaceSnapshot(repository.getDemoWorkspaceId()).tasks.some(task => task.status === 'running');
        if (pending) await this.ctx.storage.setAlarm(Date.now() + 60_000);
        return;
      }
      // An alarm survives restarts and revisits a leased task if the instance exits.
      await this.ctx.storage.setAlarm(Date.now() + 15 * 60_000);
      const previousThread = claim.runEvents.findLast(event => event.kind === 'brainbase.started' && event.metadata.taskId === claim.id)?.metadata.threadId;
      const client = new BrainbaseModelClient({ apiKey: this.env.BRAINBASE_API_KEY, taskId: claim.id, requestBudget: 20, resumeThreadId: typeof previousThread === 'string' ? previousThread : undefined, onThread: threadId => {
        repository.appendTimelineEvent(claim.workspaceId, { runId: claim.runId, opportunityId: claim.opportunityId, role: claim.assignedRole, kind: 'brainbase.started', message: `${claim.assignedRole} started work in Brainbase.`, metadata: { threadId, taskId: claim.id, provider: 'brainbase', infrastructure: 'cloudflare' } });
      } });
      try { await dispatchClaimedTask(claim, { client, repository: { completeAgentTask: repository.completeAgentTask, failTask: repository.failTask } }); }
      catch (error) {
        if (error instanceof AgentTaskYield) { await this.ctx.storage.setAlarm(Date.now() + 1000); return; }
        // The dispatcher persists actual task failures.
      }
      const snapshot = repository.readWorkspaceSnapshot(claim.workspaceId);
      if (snapshot.tasks.some(task => task.status === 'queued')) await this.ctx.storage.setAlarm(Date.now() + 1000);
      else if (snapshot.tasks.some(task => task.status === 'running')) await this.ctx.storage.setAlarm(Date.now() + 60_000);
      else await this.ctx.storage.deleteAlarm();
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (request.method !== 'GET' && request.headers.get('origin') && request.headers.get('origin') !== url.origin) return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
    if (url.pathname === '/api/health') return Response.json({ status: 'ok', hosting: 'cloudflare-workers', agents: env.BRAINBASE_API_KEY ? 'brainbase' : 'configuration-required', taste: Boolean(env.TASTE_API_KEY), storage: 'durable-object-sqlite' });
    if (!env.SESSION_SECRET) return Response.json({ error: 'The workspace is being configured.' }, { status: 503 });
    const existing = await session(request, env.SESSION_SECRET);
    if (url.pathname === '/api/demo/session' && request.method === 'POST') {
      const id = existing ?? crypto.randomUUID();
      const expiration = Date.now() + 30 * 86_400_000;
      const value = `${id}.${expiration}`;
      return Response.json({ demoMode: true, expiresAt: new Date(expiration).toISOString() }, { headers: { 'Set-Cookie': `${COOKIE}=${value}.${await sign(value, env.SESSION_SECRET)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`, 'Cache-Control': 'no-store' } });
    }
    if (!existing) return Response.json({ error: 'Open your workspace to continue.' }, { status: 401 });
    const response = await env.WORKSPACES.getByName(existing).handle(request);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  },
} satisfies ExportedHandler<Env>;
