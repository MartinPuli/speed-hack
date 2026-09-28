'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CompanyBrand } from '@/lib/contracts/company-brand';
import type { EventDraftFields, EventDraftRecord, WorkspaceSnapshot } from '@/lib/contracts/agent-workspace';
import type { EventDraft, TasteOpportunity } from '@/lib/demo/taste-labs';
export type TeamBrief = { website: string; goal: string; audience: string; budget: string };
async function api<T>(url: string, body?: unknown, method?: string): Promise<T> {
  const verb = method ?? (body ? 'POST' : 'GET');
  const liveUrl = verb === 'GET' ? `${url}${url.includes('?') ? '&' : '?'}_refresh=${Date.now()}` : url;
  const response = await fetch(liveUrl, { method: verb, cache: 'no-store', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The event team could not complete that request.');
  return data as T;
}
export function useEventTeam() {
  const [workspace, setWorkspace] = useState<WorkspaceSnapshot | null>(null);
  const [brand, setBrand] = useState<CompanyBrand | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [answer, setAnswer] = useState('');
  const [editing, setEditing] = useState<string[]>([]);
  const saveVersions = useRef<Record<string, number>>({});
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const ready = useRef<Promise<void> | null>(null);
  const activeRun = useRef<string | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const refresh = useCallback(async () => { const snapshot = await api<WorkspaceSnapshot>('/api/workspace'); setWorkspace(snapshot); return snapshot; }, []);
  const ensure = useCallback(() => {
    if (!ready.current) ready.current = api('/api/demo/session', {}).then(() => {}).catch(error => { ready.current = null; throw error; });
    return ready.current;
  }, []);
  useEffect(() => {
    let cancelled = false;
    void ensure().then(async () => {
      const [snapshot, branding] = await Promise.all([api<WorkspaceSnapshot>('/api/workspace'), api<{ brand: CompanyBrand | null }>('/api/brand')]);
      if (!cancelled) { setWorkspace(snapshot); setBrand(branding.brand); const current = snapshot.runs.find(run => ['queued', 'running'].includes(run.status)); if (current) { activeRun.current = current.id; setRunning(true); } setMapping(Object.fromEntries(snapshot.opportunities.flatMap(item => { const ref = item.evidenceIds.find(value => value.startsWith('research:taste:')); return ref ? [[ref.replace('research:taste:', ''), item.id]] : []; }))); }
    }).catch(error => { if (!cancelled) setError(error.message); });
    return () => { cancelled = true; };
  }, [ensure]);
  useEffect(() => {
    if (brand?.status !== 'pending') return;
    const timer = setInterval(() => { void api<{ brand: CompanyBrand | null }>('/api/brand').then(result => setBrand(result.brand)).catch(error => setError(error.message)); }, 6000);
    return () => clearInterval(timer);
  }, [brand?.status]);
  const extractBrand = useCallback(async (website: string) => { await ensure(); const result = await api<{ brand: CompanyBrand }>('/api/brand', { website }); setBrand(result.brand); return result.brand; }, [ensure]);
  const saveBrief = useCallback(async (brief: TeamBrief) => {
    await ensure();
    const snapshot = await refresh();
    const host = new URL(brief.website.includes('://') ? brief.website : `https://${brief.website}`).hostname.replace(/^www\./, '');
    const matchingBrand = brand?.sourceUrl && new URL(brand.sourceUrl).hostname.replace(/^www\./, '') === host ? brand : null;
    await api('/api/briefs', { expectedVersion: snapshot.briefVersion, brief: { company: matchingBrand?.name || host, website: brief.website, objective: brief.goal === 'Partnerships' ? 'partnerships' : brief.goal === 'Community' ? 'feedback' : 'adoption', audience: brief.audience, topics: matchingBrand?.audience.join(', ') || brief.audience, geography: 'San Francisco first; worldwide alternatives when relevant', from: '2026-10-01', to: '2026-11-30', budget: brief.budget, currency: 'USD', constraints: 'Produce original event concepts, actionable sponsorship recommendations and editable event drafts. All owned dates, venues and costs are proposals. No sending, spending or public publishing.' } });
    return refresh();
  }, [ensure, refresh, brand]);
  const askTeam = useCallback(async (objective: string, eventId?: string) => {
    await ensure();
    const snapshot = await refresh();
    if (!snapshot.latestBrief) throw new Error('Finish your brief to start the event team.');
    if (!snapshot.modelConfigured) throw new Error('Brainbase is not configured on this deployment yet.');
    const result = await api<{ run: { id: string } }>('/api/runs', { objective, opportunityId: eventId ? mapping[eventId] ?? eventId : undefined, idempotencyKey: crypto.randomUUID() });
    activeRun.current = result.run.id; setRunning(true); setError(''); setAnswer('');
  }, [ensure, refresh, mapping]);
  async function retryRun() {
    const run = workspace?.runs.find(item => item.status === 'failed');
    if (!run) return;
    const result = await api<{ run: { id: string } }>(`/api/runs/${run.id}/retry`, {});
    activeRun.current = result.run.id; setRunning(true); setError(''); setAnswer('');
    await refresh();
  }
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    let fetching = false;
    let disconnected = false;
    const timer = setInterval(async () => {
      if (fetching) return;
      fetching = true;
      try {
        const snapshot = await api<WorkspaceSnapshot>('/api/workspace');
        if (cancelled) return;
        if (disconnected) { setError(''); disconnected = false; }
        setWorkspace(snapshot);
        const run = snapshot.runs.find(item => item.id === activeRun.current);
        if (run && ['succeeded', 'failed', 'waiting_input'].includes(run.status)) {
          setRunning(false);
          if (run.status === 'failed') { setError(run.error || 'The event team could not finish. You can retry.'); return; }
          const completed = snapshot.tasks.filter(task => task.runId === run.id && task.status === 'succeeded');
          const final = completed[0];
          const result = final?.result as { summary?: string; outcome?: { summary?: string } } | null;
          setAnswer(result?.summary ?? result?.outcome?.summary ?? 'Your event plan has been updated.');
        }
      } catch { if (!cancelled) { disconnected = true; setError('Reconnecting to your team… Your work continues in the background.'); } }
      finally { fetching = false; }
    }, 2500);
    return () => { cancelled = true; clearInterval(timer); };
  }, [running]);
  function saveDraft(event: TasteOpportunity, draft: EventDraft) {
    setEditing(current => current.includes(event.id) ? current : [...current, event.id]);
    const sequence = (saveVersions.current[event.id] ?? 0) + 1;
    saveVersions.current[event.id] = sequence;
    clearTimeout(timers.current[event.id]);
    timers.current[event.id] = setTimeout(() => {
      void (async () => {
        await ensure(); const snapshot = await refresh();
        const record = snapshot.drafts.find(item => item.opportunityId === mapping[event.id]);
        if (!record) throw new Error('Open your event plan to save this draft to the workspace.');
        await api<EventDraftRecord>(`/api/drafts/${record.id}`, { expectedVersion: record.version, fields: { ...record.fields, title: draft.title, description: draft.description, audience: draft.audience, proposedDetails: { date: draft.date, time: draft.time, venue: draft.venue, capacity: draft.capacity }, productionBrief: `${event.recommendation}\nProposed only: ${draft.date}, ${draft.time}, ${draft.venue}. Capacity: ${draft.capacity}.` } }, 'PATCH');
        await refresh();
        if (saveVersions.current[event.id] === sequence) setEditing(current => current.filter(id => id !== event.id));
      })().catch(error => setError(error.message));
    }, 600);
  }
  async function saveRecord(record: EventDraftRecord, fields: EventDraftFields) {
    await api(`/api/drafts/${record.id}`, { expectedVersion: record.version, fields }, 'PATCH');
    await refresh();
  }
  return { workspace, brand, error, running, answer, mapping, editing, extractBrand, saveBrief, saveDraft, saveRecord, askTeam, retryRun, refresh, clearAnswer: () => setAnswer(''), clearError: () => setError('') };
}
