'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Activity, AlertCircle, ArrowDownRight, ArrowRight, Bot, Clock3, LoaderCircle, RefreshCw, Send, Sparkles, Users, WandSparkles } from 'lucide-react';
import type { ResearchBrief } from '@/lib/contracts/event-gtm';
import type { AgentRun, EventDraftRecord, InboundReplyInput, StartAgentRunInput, WorkspaceAgentRole, WorkspaceOpportunity, WorkspaceSnapshot } from '@/lib/contracts/agent-workspace';
import { AgentTimeline, displayAgentRole, displayAgentStatus, formatAgentDate } from './agent-timeline';
import './agent-console.css';

export interface AgentConsoleEndpoints {
  demoSession: string;
  workspace: string;
  briefs: string;
  runs: string;
  inboundReply: string;
}

export interface AgentConsoleProps {
  initialOpportunityId?: string;
  initialBrief?: ResearchBrief;
  onSnapshot?: (snapshot: WorkspaceSnapshot | null) => void;
  endpoints?: Partial<AgentConsoleEndpoints>;
  className?: string;
}

const DEFAULT_ENDPOINTS: AgentConsoleEndpoints = {
  demoSession: '/api/demo/session',
  workspace: '/api/workspace',
  briefs: '/api/briefs',
  runs: '/api/runs',
  inboundReply: '/api/inbound/reply',
};

const DEMO_REPLY: InboundReplyInput = {
  opportunityId: '',
  messageId: 'demo-organizer-sponsor-5000-v1',
  message: 'Thanks for reaching out. Sponsorship is USD 5,000. We can also offer a workshop, but its price has not been confirmed.',
  simulated: true,
};

type LoadState = 'loading' | 'ready' | 'empty' | 'error';
type ActionState = 'idle' | 'working' | 'done' | 'error';
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function readSnapshot(value: unknown): WorkspaceSnapshot | null {
  if (!isRecord(value)) return null;
  const nested = isRecord(value.workspace) ? value.workspace : isRecord(value.snapshot) ? value.snapshot : value;
  if (nested.demoMode !== true || !Array.isArray(nested.opportunities) || !Array.isArray(nested.tasks) || !Array.isArray(nested.events) || !Array.isArray(nested.drafts)) return null;
  return nested as unknown as WorkspaceSnapshot;
}

async function readBody(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw) return null;
  try { return JSON.parse(raw) as unknown; } catch { return raw; }
}

function responseMessage(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.error === 'string') return value.error;
  if (isRecord(value) && typeof value.message === 'string') return value.message;
  return fallback;
}

function formatAction(action: WorkspaceOpportunity['action']): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

function latestByUpdated<T extends { updatedAt: string }>(values: T[]): T | null {
  return values.slice().sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0] ?? null;
}

export function AgentConsole({ initialOpportunityId, initialBrief, onSnapshot, endpoints, className }: AgentConsoleProps) {
  const id = useId();
  const titleId = `${id}-agent-console-title`;
  const timelineId = `${id}-agent-timeline-title`;
  const planId = `${id}-agent-plan-title`;
  const draftId = `${id}-agent-draft-title`;
  const replyId = `${id}-agent-reply-title`;
  const api = useMemo(() => ({ ...DEFAULT_ENDPOINTS, ...endpoints }), [endpoints]);
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState('');
  const [teamAction, setTeamAction] = useState<ActionState>('idle');
  const [replyAction, setReplyAction] = useState<ActionState>('idle');
  const [notice, setNotice] = useState<{ tone: 'success' | 'error' | 'info'; message: string } | null>(null);
  const hasSession = useRef(false);
  const workspaceRequest = useRef(0);

  const refreshWorkspace = useCallback(async (quiet = false): Promise<WorkspaceSnapshot | null> => {
    const requestId = ++workspaceRequest.current;
    try {
      const response = await fetch(api.workspace, { cache: 'no-store' });
      const body = await readBody(response);
      if (requestId !== workspaceRequest.current) return null;
      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          hasSession.current = false;
          setSnapshot(null);
          setLoadState('empty');
          onSnapshot?.(null);
          return null;
        }
        throw Object.assign(new Error(responseMessage(body, 'The team workspace could not be loaded.')), { status: response.status });
      }
      const next = readSnapshot(body);
      if (!next) throw new Error('The workspace returned an unsupported response.');
      hasSession.current = true;
      setSnapshot(next);
      setLoadState('ready');
      setLoadError('');
      onSnapshot?.(next);
      return next;
    } catch (error) {
      if (requestId !== workspaceRequest.current) return null;
      const message = error instanceof Error ? error.message : 'The team workspace could not be loaded.';
      if (!quiet) {
        setLoadError(message);
        setLoadState('error');
      }
      return null;
    }
  }, [api.workspace, onSnapshot]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshWorkspace(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshWorkspace]);

  const hasRunningWork = snapshot?.runs.some(run => run.status === 'queued' || run.status === 'running') ?? false;
  useEffect(() => {
    if (!hasRunningWork) return;
    const timer = window.setInterval(() => { void refreshWorkspace(true); }, 2500);
    return () => window.clearInterval(timer);
  }, [hasRunningWork, refreshWorkspace]);

  const activeOpportunity = snapshot?.opportunities.length
    ? initialOpportunityId
      ? snapshot.opportunities.find(item => item.id === initialOpportunityId) ?? null
      : latestByUpdated(snapshot.opportunities)
    : null;
  const matchingDrafts = activeOpportunity ? (snapshot?.drafts ?? []).filter(draft => draft.opportunityId === activeOpportunity.id) : [];
  const activeDraft = snapshot?.drafts.length
    ? latestByUpdated(matchingDrafts.length ? matchingDrafts : snapshot.drafts)
    : null;
  const hasActivity = Boolean(snapshot?.tasks.length || snapshot?.events.length);
  const latestRun: AgentRun | null = snapshot?.runs.slice().sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0] ?? null;

  async function ensureDemoSession(): Promise<boolean> {
    if (hasSession.current) return true;
    const response = await fetch(api.demoSession, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    const body = await readBody(response);
    if (!response.ok) throw new Error(responseMessage(body, 'A demo workspace could not be started.'));
    hasSession.current = true;
    return true;
  }

  async function startTeam() {
    setTeamAction('working');
    setNotice(null);
    try {
      await ensureDemoSession();
      const currentWorkspace = await refreshWorkspace(true);
      if (!currentWorkspace) throw new Error('The workspace could not be refreshed before saving. Try again.');
      const briefChanged = initialBrief && JSON.stringify(initialBrief) !== JSON.stringify(currentWorkspace?.latestBrief ?? null);
      if (initialBrief && briefChanged) {
        const briefResponse = await fetch(api.briefs, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brief: initialBrief, expectedVersion: currentWorkspace?.briefVersion ?? 0 }),
        });
        const briefBody = await readBody(briefResponse);
        if (!briefResponse.ok) throw new Error(responseMessage(briefBody, 'Your brief could not be saved to the workspace.'));
      }
      const selectedOpportunity = currentWorkspace?.opportunities.length
        ? initialOpportunityId
          ? currentWorkspace.opportunities.find(item => item.id === initialOpportunityId) ?? null
          : latestByUpdated(currentWorkspace.opportunities)
        : null;
      const input: StartAgentRunInput = { ...(selectedOpportunity ? { opportunityId: selectedOpportunity.id } : {}) };
      const runResponse = await fetch(api.runs, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      const runBody = await readBody(runResponse);
      if (!runResponse.ok) throw new Error(responseMessage(runBody, 'The agent team could not start.'));
      setTeamAction('done');
      setNotice({ tone: 'success', message: 'The team has started a real run in this demo workspace.' });
      await refreshWorkspace(true);
    } catch (error) {
      setTeamAction('error');
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'The team could not start.' });
      await refreshWorkspace(true);
    }
  }

  async function simulateOrganizerReply() {
    if (!activeOpportunity) return;
    setReplyAction('working');
    setNotice(null);
    try {
      await ensureDemoSession();
      const payload: InboundReplyInput = { ...DEMO_REPLY, opportunityId: activeOpportunity.id };
      const response = await fetch(api.inboundReply, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const body = await readBody(response);
      if (!response.ok) throw new Error(responseMessage(body, 'The simulated reply could not be added.'));
      const duplicate = isRecord(body) && body.duplicate === true;
      setReplyAction('done');
      setNotice({ tone: duplicate ? 'info' : 'success', message: duplicate ? 'This simulated reply was already processed. The stable message ID prevented a duplicate task.' : 'Simulated reply added. The team will review it and may update the plan and draft.' });
      await refreshWorkspace(true);
    } catch (error) {
      setReplyAction('error');
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'The simulated reply could not be added.' });
    }
  }

  const canStart = teamAction !== 'working';
  const canReply = Boolean(activeOpportunity) && replyAction !== 'working';
  const wrapperClass = ['agent-console', className].filter(Boolean).join(' ');

  return <section className={wrapperClass} aria-labelledby={titleId}>
    <header className="agent-console-head">
      <div className="agent-console-heading">
        <div className="agent-console-mark" aria-hidden="true"><span /></div>
        <div><span className="agent-console-kicker"><Sparkles size={12} aria-hidden="true" /> YOUR WORKING TEAM</span><h2 id={titleId}>Four roles, one shared plan.</h2><p>Agents research, decide, and prepare the next useful step in one shared demo workspace. Activity is visible to anyone using this demo session.</p></div>
      </div>
      <div className="agent-console-actions">
        <button className="agent-button agent-button-quiet" onClick={() => void refreshWorkspace()} disabled={loadState === 'loading'}><RefreshCw size={15} className={loadState === 'loading' ? 'agent-spin' : undefined} aria-hidden="true" />Refresh</button>
        <button className="agent-button agent-button-primary" onClick={() => void startTeam()} disabled={!canStart}><WandSparkles size={16} aria-hidden="true" />{teamAction === 'working' ? 'Starting team…' : latestRun && ['queued', 'running'].includes(latestRun.status) ? 'Start another run' : 'Start the team'}<ArrowRight size={15} aria-hidden="true" /></button>
      </div>
    </header>

    <div className="agent-role-strip" aria-label="Agent roles">
      {(['lead', 'scout', 'partnerships', 'producer'] as WorkspaceAgentRole[]).map(role => <div className={`agent-role-chip role-${role}`} key={role}><span className="agent-role-avatar">{role === 'lead' ? 'L' : role === 'scout' ? 'S' : role === 'partnerships' ? 'P' : 'D'}</span><span><strong>{displayAgentRole(role)}</strong><small>{role === 'lead' ? 'Prioritize & assign' : role === 'scout' ? 'Find & verify' : role === 'partnerships' ? 'Prepare & interpret' : 'Shape the draft'}</small></span></div>)}
    </div>

    {notice && <div className={`agent-notice tone-${notice.tone}`} role={notice.tone === 'error' ? 'alert' : 'status'}><span>{notice.message}</span><button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)}>×</button></div>}

    {loadState === 'error' && <div className="agent-load-error" role="alert"><AlertCircle size={17} aria-hidden="true" /><span>{loadError}</span><button className="agent-text-button" onClick={() => void refreshWorkspace()}>Try again</button></div>}

    <div className="agent-console-grid">
      <section className="agent-panel agent-timeline-panel" aria-labelledby={timelineId} aria-busy={loadState === 'loading' || hasRunningWork}>
        <div className="agent-panel-heading"><div><span className="agent-console-kicker">LIVE WORK</span><h3 id={timelineId}>Agent activity</h3></div><span className={`agent-live-state ${hasRunningWork ? 'is-live' : ''}`}><span />{hasRunningWork ? 'In progress' : snapshot ? 'Synced' : 'Not started'}</span></div>
        {loadState === 'loading' && !snapshot ? <div className="agent-loading-line"><LoaderCircle size={16} className="agent-spin" />Loading workspace…</div> : hasActivity ? <AgentTimeline tasks={snapshot?.tasks ?? []} events={snapshot?.events ?? []} /> : <div className="agent-empty"><div className="agent-empty-icon"><Users size={19} aria-hidden="true" /></div><strong>{loadState === 'empty' ? 'Your team is ready when you are.' : 'No agent activity yet.'}</strong><p>Start a run to let the team work from your brief and the research catalog.</p><button className="agent-inline-action" onClick={() => void startTeam()} disabled={!canStart}>Start the team<ArrowRight size={14} aria-hidden="true" /></button></div>}
      </section>

      <div className="agent-side-stack">
        <section className="agent-panel agent-plan-panel" aria-labelledby={planId}>
          <div className="agent-panel-heading"><div><span className="agent-console-kicker">CURRENT DECISION</span><h3 id={planId}>Opportunity plan</h3></div><span className="agent-plan-icon"><Activity size={16} aria-hidden="true" /></span></div>
          {activeOpportunity ? <div className="agent-plan-content"><div className="agent-opportunity-title-row"><div><span className="agent-opportunity-state">{displayAgentStatus(activeOpportunity.state)}</span><h4>{activeOpportunity.title}</h4></div><span className="agent-action-pill">{formatAction(activeOpportunity.action)}</span></div><p className="agent-plan-rationale">{activeOpportunity.rationale || 'The team has not added a decision rationale yet.'}</p><div className="agent-plan-foot"><span>{activeOpportunity.evidenceIds.length} evidence reference{activeOpportunity.evidenceIds.length === 1 ? '' : 's'}</span></div>{snapshot?.latestBrief && <div className="agent-brief-context"><span>BRIEF CONTEXT</span><p>{snapshot.latestBrief.company || 'Your company'} · {snapshot.latestBrief.objective} · {snapshot.latestBrief.budget || 'Budget not set'} {snapshot.latestBrief.currency || ''}</p></div>}</div> : <div className="agent-plan-empty"><ArrowDownRight size={18} aria-hidden="true" /><p>The Lead will add an opportunity and decision after the first run.</p></div>}
        </section>

        <section className="agent-panel agent-draft-panel" aria-labelledby={draftId}>
          <div className="agent-panel-heading"><div><span className="agent-console-kicker">PRIVATE PROPOSAL</span><h3 id={draftId}>Latest event draft</h3></div><span className="agent-draft-version">{activeDraft ? `v${activeDraft.version}` : '—'}</span></div>
          {activeDraft ? <DraftPreview draft={activeDraft} /> : <div className="agent-plan-empty"><Bot size={18} aria-hidden="true" /><p>The Producer will prepare a draft when there is a plan to work from.</p></div>}
          <p className="agent-private-note">Demo workspace · Visible to anyone using this demo session. Nothing is sent to an organizer or published on Luma.</p>
        </section>

        <section className="agent-reply-panel" aria-labelledby={replyId}>
          <div className="agent-reply-label"><span className="agent-demo-stamp">DEMO FIXTURE</span><span>SIMULATED INPUT</span></div>
          <h3 id={replyId}>Practice a new decision.</h3>
          <p className="agent-reply-copy">“Sponsorship is USD 5,000. A workshop is available; its price is still unknown.”</p>
          <button className="agent-button agent-button-light" onClick={() => void simulateOrganizerReply()} disabled={!canReply}><Send size={14} aria-hidden="true" />{replyAction === 'working' ? 'Adding simulated reply…' : 'Add simulated organizer reply'}</button>
          <p className="agent-reply-footnote">This is a local demo fixture. No one was contacted. Reusing it is deduplicated.</p>
        </section>
      </div>
    </div>
    <footer className="agent-console-foot"><span><Clock3 size={13} aria-hidden="true" />{snapshot ? `Shared demo workspace · ${snapshot.briefVersion ? `brief v${snapshot.briefVersion}` : 'brief not saved'}` : 'A shared demo workspace will be created when you start the team.'}</span><span>Model {snapshot?.modelConfigured ? 'configured' : 'configuration pending'}</span></footer>
  </section>;
}

function DraftPreview({ draft }: { draft: EventDraftRecord }) {
  const fields = draft.fields;
  return <div className="agent-draft-preview"><span className="agent-draft-updated">Updated by {displayAgentRole(draft.updatedBy)} · {formatAgentDate(draft.updatedAt)}</span><h4>{fields.title || 'Untitled event'}</h4><p className="agent-draft-description">{fields.description || 'No invitation copy yet.'}</p><div className="agent-draft-facts"><div><span>Audience</span><p>{fields.audience || 'Not set'}</p></div><div><span>Format</span><p>{fields.format || 'Not set'}</p></div><div><span>Date & time</span><p>{fields.date || 'To be confirmed'}{fields.timezone ? ` · ${fields.timezone}` : ''}</p></div><div><span>Place</span><p>{fields.location || 'To be confirmed'}</p></div><div><span>Host</span><p>{fields.host || 'Not set'}</p></div><div><span>Call to action</span><p>{fields.cta || 'Not set'}</p></div></div>{fields.agenda && <details className="agent-draft-details"><summary>Proposed agenda</summary><p>{fields.agenda}</p></details>}{fields.productionBrief && <details className="agent-draft-details"><summary>Private production brief</summary><p>{fields.productionBrief}</p></details>}{fields.sourceRefs.length > 0 && <div className="agent-draft-source-count">{fields.sourceRefs.length} source reference{fields.sourceRefs.length === 1 ? '' : 's'} attached</div>}</div>;
}
