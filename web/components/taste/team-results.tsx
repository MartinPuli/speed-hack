'use client';

import { useState } from 'react';
import { workspaceHeaders } from '@/lib/client/workspace-request';
import { Copy, Download, MapPin, Users, Image as ImageIcon, Lamp, Utensils, Wallet } from 'lucide-react';
import type { CompanyBrand } from '@/lib/contracts/company-brand';
import type { EventDraftFields, EventDraftRecord, WorkspaceOpportunity, WorkspaceSnapshot } from '@/lib/contracts/agent-workspace';
import { TASTE_OPPORTUNITIES } from '@/lib/demo/taste-labs';
import { EventCover } from './taste-map';

export function teamOutput(workspace: WorkspaceSnapshot | null, opportunityId?: string) {
  if (!workspace || !opportunityId) return { previewUrl: undefined, outreach: undefined };
  const preview = workspace.events.findLast(item => item.opportunityId === opportunityId && item.kind === 'preview.provisioned');
  const url = preview?.metadata.url;
  let outreach: string | undefined;
  for (const task of workspace.tasks) {
    if (task.opportunityId !== opportunityId || task.status !== 'succeeded') continue;
    const result = task.result as { toolCalls?: { outreachDrafts?: { subject?: string; body?: string; questions?: string[] }[] } } | null;
    const draft = result?.toolCalls?.outreachDrafts?.[0];
    if (typeof draft?.body === 'string') { outreach = `${draft.subject ?? ''}\n\n${draft.body}${draft.questions?.length ? `\n\n${draft.questions.map((question, index) => `${index + 1}. ${question}`).join('\n')}` : ''}`.trim(); break; }
  }
  return { previewUrl: typeof url === 'string' && /^\/(?:demo\/)?preview\/[a-f0-9]+$/.test(url) ? (typeof window !== 'undefined' && window.location.pathname === '/demo' && url.startsWith('/preview/') ? `/demo${url}` : url) : undefined, outreach };
}
const actionLabel = (action: WorkspaceOpportunity['action']) => action === 'host' ? 'Create' : action === 'sponsor' ? 'Partner' : 'Explore';
export function TeamCard({ opportunity, draft, brand, onClick }: { opportunity: WorkspaceOpportunity; draft?: EventDraftRecord; brand: CompanyBrand | null; onClick: () => void }) {
  const visual = TASTE_OPPORTUNITIES[opportunity.action === 'host' ? 0 : 1];
  const coverUrl = draft?.fields.coverImageUrl || (opportunity.action === 'host' ? brand?.imagery?.[0]?.url : undefined);
  const cover = coverUrl ? { ...visual, image: coverUrl } : visual;
  return <button className="tg-event-card" onClick={onClick}>
    <div className="tg-card-main"><EventCover event={cover}/><div><span className="tg-card-date">{opportunity.event?.startDate ? new Date(`${opportunity.event.startDate.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Event draft'}</span><h3>{draft?.fields.title ?? opportunity.title}</h3></div></div>
    <p className="tg-card-reason">{opportunity.rationale}</p>
    <div className="tg-card-bottom"><span>{opportunity.event?.city ?? 'Venue to choose'}</span><span>{opportunity.action === 'sponsor' ? 'Sponsorship' : 'Draft'}</span></div>
  </button>;
}
function OpportunitySummary({ text }: { text: string }) {
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
  const lead = sentences.slice(0, 2).join(' ');
  return <div className="tg-opportunity-summary"><p>{lead}</p>{sentences.length > 2 && <details><summary>Research notes</summary><div>{sentences.slice(2).map((sentence, index) => <p key={index}>{sentence}</p>)}</div></details>}</div>;
}
const experienceSections = [
  { key: 'venue', name: 'The setting', icon: MapPin }, { key: 'guests', name: 'The people', icon: Users },
  { key: 'atmosphere', name: 'The feeling', icon: Lamp }, { key: 'artDirection', name: 'The image', icon: ImageIcon },
  { key: 'foodAndDrink', name: 'The table', icon: Utensils }, { key: 'budgetGuidance', name: 'The budget', icon: Wallet },
] as const;
function exportText(fields: EventDraftFields, short = false) {
  return `${fields.title}\n\n${fields.description}\n\nFor: ${fields.audience}\n${fields.date || 'Date to confirm'}\n${fields.location || 'Venue to confirm'}${short ? '' : `\n\n${fields.agenda}`}\n\nProposed event. Details need confirmation before publishing.`;
}
export function TeamDetails({ opportunity, draft, brand, previewUrl, outreach, onSave, onAsk }: {
  opportunity: WorkspaceOpportunity; draft?: EventDraftRecord; brand: CompanyBrand | null; previewUrl?: string; outreach?: string;
  onSave: (record: EventDraftRecord, fields: EventDraftFields) => Promise<void>;
  onAsk: (objective: string, opportunityId: string) => Promise<void>;
}) {
  const [fields, setFields] = useState(draft?.fields);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState('Concept');
  const [editing, setEditing] = useState(false);
  const [pageUrl, setPageUrl] = useState(previewUrl);
  const [shareUrl, setShareUrl] = useState('');
  async function save() {
    if (!draft || !fields) return;
    setBusy(true);
    try { await onSave(draft, fields); setStatus('Saved.'); setEditing(false); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Could not save the draft.'); }
    finally { setBusy(false); }
  }
  async function develop() {
    setBusy(true);
    try { await onAsk(opportunity.action !== 'host' ? 'Refine this sponsorship opportunity and prepare a concise private organizer inquiry. Keep costs and availability unconfirmed. Do not propose a new owned event or send the inquiry.' : 'Develop this event experience: a short distinctive name, venue selection, guest mix, invitation copy, cover art direction, lighting, sound, food and budget. Use Taste to shape the whole experience. Save the editable draft and a branded landing page preview.', opportunity.id); setStatus('Ari is developing the experience. You can return to the map.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'The team could not start.'); }
    finally { setBusy(false); }
  }
  async function design() {
    if (!fields) return;
    setBusy(true);
    try {
      const response = await fetch('/api/event-design', { method: 'POST', headers: { ...workspaceHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ opportunityId: opportunity.id, draft: fields }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error); setPageUrl(data.previewUrl); setStatus('Your Taste landing is ready.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not prepare the page.'); }
    finally { setBusy(false); }
  }
  async function generateCover() {
    setBusy(true); setStatus('Generating your event artwork…');
    try { const response = await fetch('/api/event-cover', { method: 'POST', headers: { ...workspaceHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ opportunityId: opportunity.id }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Cover generation is available on the Cloudflare app.'); setFields(data.draft.fields); setPageUrl(data.previewUrl); setStatus('Cover ready. Your landing has been updated.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'The image could not be generated.'); } finally { setBusy(false); }
  }
  async function share() {
    if (!pageUrl) return; setBusy(true);
    try { const id = pageUrl.split('/').at(-1); const response = await fetch(`/api/previews/${id}/share`, { method: 'POST', headers: workspaceHeaders() }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Share links are available on the Cloudflare app.'); setShareUrl(data.url); await navigator.clipboard.writeText(data.url).catch(() => {}); setStatus('Share link ready. It opens for anyone with the link for 7 days.'); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Could not prepare the share link.'); } finally { setBusy(false); }
  }
  async function copy(destination: string) {
    if (!fields) return;
    try { await navigator.clipboard.writeText(exportText(fields, destination === 'Partiful')); setStatus(`Copied. Paste into your ${destination} event.`); }
    catch { setStatus('Use Download brief to keep your event copy.'); }
  }
  function download() {
    if (!fields) return;
    const url = URL.createObjectURL(new Blob([exportText(fields) + `\n\n## Experience\n${Object.entries(fields.experience ?? {}).map(([key, value]) => `\n### ${key}\n${value}`).join('\n')}\n\n## Production\n${fields.productionBrief}`], { type: 'text/markdown' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${fields.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brief.md`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const sources = [...new Set([...(fields?.sourceRefs ?? []), ...opportunity.evidenceIds, opportunity.event?.url ?? ''])].filter(value => { try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; } });
  const cover = fields?.coverImageUrl || (opportunity.action === 'host' ? brand?.imagery?.[0]?.url : undefined);
  return <>
    {cover && <div className="tg-live-cover"><img src={cover} alt="Company artwork selected with Taste"/>{brand?.logoUrl && <span><img src={brand.logoUrl} alt={brand.name}/></span>}</div>}
    <div className="tg-detail-heading"><span className="tg-overline">{fields ? 'Event draft' : 'Sponsorship opportunity'}</span><h2>{fields?.title ?? opportunity.title}</h2>{fields?.format && <p>{fields.format}</p>}</div>
    <div className="tg-detail-tabs">{(fields ? ['Concept', 'Experience', 'Share'] : ['Concept', 'Share']).map(tab => <button key={tab} aria-pressed={section === tab} onClick={() => setSection(tab)}>{tab}</button>)}</div>
    <div className="tg-detail-body">
      {status && <p className="tg-inline-status" role="status">{status}</p>}
      {section === 'Concept' && <>{fields ? editing ? <><div className="tg-draft-form">{(['title', 'description', 'audience', 'format', 'agenda', 'date', 'location'] as const).map(key => <label key={key}>{key}<textarea rows={key === 'description' ? 5 : 2} value={fields[key]} onChange={event => setFields({ ...fields, [key]: event.target.value })}/></label>)}<h3>Experience</h3>{experienceSections.map(item => <label key={item.key}>{item.name}<textarea rows={4} value={fields.experience?.[item.key] ?? ''} onChange={event => setFields({ ...fields, experience: { venue: '', guests: '', atmosphere: '', artDirection: '', foodAndDrink: '', budgetGuidance: '', ...fields.experience, [item.key]: event.target.value } })}/></label>)}</div><button className="tg-primary tg-full" disabled={busy} onClick={save}>Save changes</button></> : <><p className="tg-concept-copy">{fields.description}</p><div className="tg-concept-facts"><div><span>Who’s in the room</span><p>{fields.audience}</p></div><div><span>When & where</span><p>{fields.date || 'Date to confirm'} · {fields.location || 'Venue to choose'}</p></div></div><h3>The evening</h3><p className="tg-concept-copy">{fields.agenda}</p><button className="tg-secondary" onClick={() => setEditing(true)}>Edit draft</button></> : <><OpportunitySummary text={opportunity.rationale}/><button className="tg-primary tg-full" onClick={develop} disabled={busy}>{opportunity.action === 'host' ? 'Develop this event' : 'Refine the approach'}</button></>}{outreach && <><h3>Partnership inquiry</h3><pre className="tg-outreach">{outreach}</pre></>}{sources.length > 0 && <details className="tg-evidence"><summary>Sources</summary>{sources.map(url => <a key={url} className="tg-source" href={url} target="_blank" rel="noreferrer">{new URL(url).hostname}</a>)}</details>}</>}
      {section === 'Experience' && <><div className="tg-cover-tools"><button disabled={busy} onClick={generateCover}>{busy ? 'Preparing…' : 'Generate event cover'}</button></div>{fields?.experience ? <div className="tg-experience-grid">{experienceSections.map(item => <section key={item.key}><h3><item.icon size={16}/>{item.name}</h3><p>{fields.experience?.[item.key]}</p></section>)}</div> : <p className="tg-muted">Let Ari shape the venue, guests, imagery and atmosphere around your brand.</p>}<button className="tg-primary tg-full" onClick={develop} disabled={busy}>{fields?.experience ? 'Refine with Taste' : 'Design the experience'}</button></>}
      {section === 'Share' && <>{fields ? <><div className="tg-landing-option"><div><span className="tg-overline">Your own page</span><h3>A landing with Taste.</h3><p>Your identity, your invitation.</p></div>{pageUrl ? <a className="tg-primary" href={pageUrl} target="_blank" rel="noreferrer">Open landing</a> : <button className="tg-primary" disabled={busy} onClick={design}>{busy ? 'Preparing…' : 'Create landing'}</button>}</div>{pageUrl && <><button className="tg-secondary tg-full" disabled={busy} onClick={share}>Create share link</button><p className="tg-note">A read-only invitation. Production notes and budgets stay private.</p>{shareUrl && <div className="tg-share-link"><input readOnly value={shareUrl} aria-label="Shareable event link" onFocus={e => e.target.select()}/><a className="tg-secondary" href={shareUrl} target="_blank" rel="noreferrer">Open</a></div>}</>}{pageUrl && <button className="tg-text-button" disabled={busy} onClick={design}>{busy ? 'Updating…' : 'Update landing from draft'}</button>}<h3>Take it to your event platform</h3><div className="tg-publish-options">{['Luma', 'Eventbrite', 'Partiful'].map(destination => <button key={destination} onClick={() => copy(destination)}><span>{destination}</span><small>Copy event details</small><Copy size={15}/></button>)}</div><p className="tg-note">Ready to paste into your account. Review the details before publishing.</p><button className="tg-secondary" onClick={download}><Download size={14}/>Download full brief</button></> : <>{outreach ? <><h3>Organizer inquiry</h3><p className="tg-muted">A private draft, ready for your review.</p><pre className="tg-outreach">{outreach}</pre><button className="tg-secondary" onClick={() => void navigator.clipboard.writeText(outreach).then(() => setStatus('Inquiry copied.')).catch(() => setStatus('Select the text to copy it.'))}><Copy size={14}/>Copy inquiry</button></> : <p className="tg-muted">Ask your team to prepare a partnership approach.</p>}</>}</>}
    </div>
  </>;
}
