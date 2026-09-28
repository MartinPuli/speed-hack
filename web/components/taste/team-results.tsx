'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import type { EventDraftFields, EventDraftRecord, WorkspaceOpportunity, WorkspaceSnapshot } from '@/lib/contracts/agent-workspace';

export function teamOutput(workspace: WorkspaceSnapshot | null, opportunityId?: string) {
  if (!workspace || !opportunityId) return { previewUrl: undefined, outreach: undefined };
  const preview = workspace.events.findLast(item => item.opportunityId === opportunityId && item.kind === 'preview.provisioned');
  const url = preview?.metadata.url;
  let outreach: string | undefined;
  for (const task of workspace.tasks) {
    if (task.opportunityId !== opportunityId || task.status !== 'succeeded') continue;
    const result = task.result as { toolCalls?: { outreachDrafts?: { subject?: string; body?: string }[] } } | null;
    const draft = result?.toolCalls?.outreachDrafts?.[0];
    if (typeof draft?.body === 'string') { outreach = `${draft.subject ?? ''}\n\n${draft.body}`.trim(); break; }
  }
  return { previewUrl: typeof url === 'string' && /^\/preview\/[a-f0-9]+$/.test(url) ? url : undefined, outreach };
}

const actionLabel = (action: WorkspaceOpportunity['action']) => action === 'host' ? 'Event draft' : action === 'sponsor' ? 'Sponsorship' : 'Opportunity';

export function TeamCard({ opportunity, onClick }: { opportunity: WorkspaceOpportunity; onClick: () => void }) {
  return <button className="tg-event-card" onClick={onClick}>
    <div className="tg-card-top"><span className={`tg-kind tg-kind-${opportunity.action === 'host' ? 'host' : 'sponsor'}`}><i />{actionLabel(opportunity.action)}</span><span className="tg-card-decision">From your team</span></div>
    <div className="tg-card-main"><div className="tg-team-cover"><FileText size={24} /></div><div><h3>{opportunity.title}</h3></div></div>
    <p className="tg-card-reason">{opportunity.rationale}</p>
    <div className="tg-card-bottom"><span>{opportunity.state.replaceAll('_', ' ')}</span><span>Review plan</span></div>
  </button>;
}

export function TeamDetails({ opportunity, draft, previewUrl, outreach, onSave, onAsk }: {
  opportunity: WorkspaceOpportunity; draft?: EventDraftRecord; previewUrl?: string; outreach?: string;
  onSave: (record: EventDraftRecord, fields: EventDraftFields) => Promise<void>;
  onAsk: (objective: string, opportunityId: string) => Promise<void>;
}) {
  const [fields, setFields] = useState(draft?.fields);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function save() {
    if (!draft || !fields) return;
    setBusy(true);
    try { await onSave(draft, fields); setStatus('Draft saved.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'The draft could not be saved.'); }
    finally { setBusy(false); }
  }
  async function develop() {
    setBusy(true);
    try { await onAsk('Develop this opportunity into an actionable event plan. Review the evidence, prepare the event or partnership draft and its private branded preview when appropriate.', opportunity.id); setStatus('Your team is preparing the plan.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'The team could not start.'); }
    finally { setBusy(false); }
  }
  const sources = [...new Set([...(fields?.sourceRefs ?? []), ...opportunity.evidenceIds])].filter(value => { try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; } });
  return <>
    <div className="tg-detail-heading"><span className="tg-overline">{actionLabel(opportunity.action)}</span><h2>{fields?.title ?? opportunity.title}</h2><p>{opportunity.rationale}</p></div>
    <div className="tg-detail-body">
      {status && <p className="tg-inline-status" role="status">{status}</p>}
      {fields ? <><div className="tg-draft-form">{(['title', 'description', 'audience', 'format', 'agenda', 'productionBrief'] as const).map(key => <label key={key}>{({ title: 'Title', description: 'Description', audience: 'Audience', format: 'Format', agenda: 'Agenda', productionBrief: 'Plan & open questions' })[key]}<textarea rows={key === 'description' || key === 'productionBrief' ? 5 : 2} value={fields[key]} onChange={event => setFields({ ...fields, [key]: event.target.value })} /></label>)}</div><button className="tg-primary tg-full" onClick={save} disabled={busy}>Save draft</button></> : <button className="tg-primary tg-full" onClick={develop} disabled={busy}>Develop this opportunity</button>}
      {previewUrl && <a className="tg-secondary tg-full tg-result-preview" href={previewUrl} target="_blank" rel="noreferrer">Open event preview</a>}
      {outreach && <><h3>Partnership inquiry · unsent</h3><pre className="tg-outreach">{outreach}</pre></>}
      {sources.length > 0 && <><h3>Sources</h3>{sources.map(url => <a className="tg-source" key={url} href={url} target="_blank" rel="noreferrer">{new URL(url).hostname}</a>)}</>}
    </div>
  </>;
}
