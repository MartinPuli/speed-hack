'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent, createContext, useContext } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowUp, Check, ChevronDown, Copy, ExternalLink, FileText, Globe2, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { budgetRange, CHECKED_AT, compactBudget, dollars, draftMarkdown, eventDraft, RECOMMENDED_IDS, TASTE_OPPORTUNITIES as opportunities, type EventDraft, type TasteOpportunity } from '@/lib/demo/taste-labs';
import { EventCover, TasteMap } from './taste-map';
import './taste-workspace.css';
import { TeamCard, TeamDetails, teamOutput } from './team-results';
import { useEventTeam } from './use-event-team';
import type { CompanyBrand, EventDesignBrief } from '@/lib/contracts/company-brand';
const BrandContext = createContext<CompanyBrand | null>(null);

type Brief = { website: string; goal: string; audience: string; budget: string };
type Filter = 'all' | 'host' | 'sponsor';
const defaultBrief: Brief = { website: 'tastelabs.com', goal: 'Product adoption', audience: 'Developers & design engineers building AI apps', budget: '15000' };
const BRIEF_KEY = 'growthx:taste-brief:v2';
const DRAFTS_KEY = 'growthx:taste-drafts:v1';
const TASTE_LOGO = 'https://cdn.prod.website-files.com/6a1d5baf94efef5f7c435fc3/6a306ae79b1ce1b28e27e16b_5b4c828c6dbacad50282c2cdc22e9af0_taste_Logo.svg';
function CompanyLogo() { const brand = useContext(BrandContext); return <img className="tg-company-logo" src={brand?.logoUrl ?? TASTE_LOGO} alt={brand?.name ?? "Taste Labs"} />; }

function portfolioFor(brief: Brief) {
  const ids = brief.goal === 'Partnerships' ? ['aie-code', 'brand-build-lab', 'builders-table'] : brief.goal === 'Community' ? ['prototype-salon', 'brand-build-lab', 'aie-code'] : RECOMMENDED_IDS;
  let remaining = Number(brief.budget);
  return ids.flatMap(id => { const event = opportunities.find(item => item.id === id)!; const cost = budgetRange(event).high + (event.feeCap ?? 0); if (cost > remaining) return []; remaining -= cost; return [event]; });
}

function Brand({ onClick }: { onClick: () => void }) {
  return <button className="tg-brand" onClick={onClick} aria-label="GrowthX home"><span className="tg-brand-icon"><span /><span /><span /></span>GrowthX</button>;
}
function Kind({ event }: { event: TasteOpportunity }) {
  return <span className={`tg-kind tg-kind-${event.kind}`}><i />{event.kind === 'host' ? 'Event draft' : 'Sponsorship'}</span>;
}
function EventCard({ event, selected, onClick }: { event: TasteOpportunity; selected?: boolean; onClick: () => void }) {
  return <button className="tg-event-card" data-selected={selected} onClick={onClick}>
    <div className="tg-card-top"><Kind event={event} />{event.kind === 'host' ? <CompanyLogo /> : event.priority !== 'recommended' && <span className="tg-card-decision">{event.priority === 'hold' ? 'On hold' : 'Alternative'}</span>}</div>
    <div className="tg-card-main"><EventCover event={event} /><div><span className="tg-card-date">{event.dateLabel}</span><h3>{event.title}</h3><p>{event.kind === 'host' ? event.format : event.venue}</p></div></div>
    <p className="tg-card-reason">{event.reason}</p>
    <div className="tg-card-bottom"><span>{event.region === 'sf' ? 'San Francisco' : event.city}</span><strong>{compactBudget(event)}</strong></div>
  </button>;
}

function Dialog({ title, children, onClose, wide = false }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className={`tg-dialog ${wide ? 'tg-dialog-wide' : ''}`} aria-label={title} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="tg-dialog-inner"><button className="tg-close" aria-label="Close details" onClick={onClose}><X size={18} /></button>{children}</div>
  </dialog>;
}

function OpportunityDetail({ event, draft, onDraft, onClose, previewUrl, outreach }: { event: TasteOpportunity; draft?: EventDraft; onDraft: (draft: EventDraft) => void; onClose: () => void; previewUrl?: string; outreach?: string }) {
  const [section, setSection] = useState('Plan');
  const [feedback, setFeedback] = useState('');
  const [design, setDesign] = useState<{ design: EventDesignBrief; previewUrl: string; brand: CompanyBrand } | null>(null);
  const [designing, setDesigning] = useState(false);
  async function prepareDesign() {
    if (!draft) return; setDesigning(true); setFeedback('');
    try { const response = await fetch('/api/event-design', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: event.id, draft }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setDesign(data); setFeedback('Your branded event preview is ready.'); } catch (error) { setFeedback(error instanceof Error ? error.message : 'The event design could not be prepared.'); } finally { setDesigning(false); }
  }
  const costs = budgetRange(event);
  const text = draft ? draftMarkdown(event, draft) : outreach ?? event.outreach ?? `Hi ${event.title} team,\n\nWe are exploring a Taste Labs partnership. ${event.recommendation}\n\nCould you share available formats, included passes, production deadlines and an all-inclusive quote? This inquiry is a draft and does not commit Taste Labs to a purchase.`;
  async function copy(value: string) { try { await navigator.clipboard.writeText(value); setFeedback('Copied to clipboard.'); } catch { setFeedback('Clipboard unavailable. Download the draft instead.'); } }
  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `${event.id}-draft.md`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <Dialog title={event.title} onClose={onClose}>
    <EventCover event={event} className="tg-detail-cover" />
    <div className="tg-detail-heading"><Kind event={event} /><h2>{event.title}</h2><p>{event.subtitle}</p><div className="tg-detail-meta"><span>{event.dateLabel}</span><span><MapPin size={13} />{event.city}</span></div></div>
    <div className="tg-detail-tabs">{['Plan', 'Budget', 'Sources', ...(draft ? ['Draft'] : ['Outreach'])].map(name => <button key={name} aria-pressed={section === name} onClick={() => setSection(name)}>{name}</button>)}</div>
    <div className="tg-detail-body">
      {feedback && <p className="tg-inline-status" role="status">{feedback}</p>}
      {section === 'Plan' && <>
        <div className="tg-recommendation"><span>Our recommendation</span><h3>{event.decision}</h3><p>{event.recommendation}</p></div>
        <div className="tg-facts"><div><span>Who it’s for</span><p>{event.audience}</p></div><div><span>Format</span><p>{event.format}</p></div><div><span>Place</span><p>{event.venue}</p></div><div><span>Cash estimate</span><p>{compactBudget(event)}</p></div></div>
        <h3>Why this fits Taste</h3><ul>{event.rationale.map(item => <li key={item}>{item}</li>)}</ul>
        <h3>{event.kind === 'host' ? 'The evening, planned' : 'Activation plan'}</h3><div className="tg-agenda">{event.agenda.map(item => <div key={item.time}><time>{item.time}</time><p>{item.activity}</p></div>)}</div>
        <h3>What to measure</h3><ul>{event.outcomes.map(item => <li key={item}>{item}</li>)}</ul>
        <h3>Potential collaborators</h3><ul>{event.partners.map(item => <li key={item}>{item}</li>)}</ul>
        <h3>Next steps</h3><ol>{event.nextSteps.map(item => <li key={item}>{item}</li>)}</ol>
        <button className="tg-primary tg-full" onClick={() => setSection(draft ? 'Draft' : 'Outreach')}>{draft ? 'Edit event draft' : 'Prepare partnership inquiry'}</button>
      </>}
      {section === 'Budget' && <>
        <span className="tg-overline">Planning cash estimate · USD</span><div className="tg-budget-total">{dollars(costs.low)}–{dollars(costs.high)}</div><p className="tg-muted">Includes a 15% contingency. {event.kind === 'sponsor' ? 'Sponsorship fee is additional and requires a quote.' : 'Allowances for planning; venue and suppliers have not quoted.'}</p>
        <div className="tg-budget-lines">{event.budget.map(line => <div key={line.label}><div><strong>{line.label}</strong><span>{dollars(line.low)}–{dollars(line.high)}</span></div><p>{line.basis}</p></div>)}<div><div><strong>Contingency · 15%</strong><span>{dollars(costs.contingencyLow)}–{dollars(costs.contingencyHigh)}</span></div></div></div>
        {event.feeCap && <div className="tg-recommendation"><span>Proposed negotiation ceiling</span><h3>{dollars(event.feeCap)} sponsor fee</h3><p>A spending limit to discuss, not an organizer quote. Decline if the package does not deliver the proposed activation.</p></div>}
        {event.ticketNote && <p className="tg-note">{event.ticketNote}</p>}
        <h3>Team time</h3><p>{event.laborHours} staff hours. At an assumed $75/hour, that is {dollars(event.laborHours * 75)} in internal time, separate from cash spend.</p>
        <h3>Still to confirm</h3><ul>{event.unknowns.map(item => <li key={item}>{item}</li>)}</ul>
      </>}
      {section === 'Sources' && <><span className="tg-overline">Reviewed {CHECKED_AT}</span><h3>What this recommendation is based on</h3>{event.sources.map(source => <a className="tg-source" key={source.url} href={source.url} target="_blank" rel="noreferrer"><strong>{source.title}<ExternalLink size={14} /></strong><p>{source.supports}</p></a>)}<p className="tg-note">{event.locationNote}</p><p className="tg-note">Cover: {event.imageCredit}.</p><h3>Unconfirmed</h3><ul>{event.unknowns.map(item => <li key={item}>{item}</li>)}</ul></>}
      {section === 'Draft' && draft && <><div className="tg-draft-status"><span><FileText size={14} /> Unpublished draft</span><span>Autosaved on this device</span></div><p className="tg-muted">Make it yours. Dates and venue are proposals until confirmed.</p><div className="tg-draft-form">{(['title', 'description', 'date', 'time', 'venue', 'audience', 'capacity'] as const).map(key => <label key={key}>{({ title: 'Event title', description: 'Description', date: 'Proposed date', time: 'Time', venue: 'Venue', audience: 'Audience', capacity: 'Guest capacity' })[key]}{key === 'description' ? <textarea rows={9} value={draft[key]} onChange={e => onDraft({ ...draft, [key]: e.target.value })} /> : <input type={key === 'date' ? 'date' : key === 'capacity' ? 'number' : 'text'} min={key === 'capacity' ? 1 : undefined} value={draft[key]} onChange={e => onDraft({ ...draft, [key]: e.target.value })} />}</label>)}</div><div className="tg-design-action"><button className="tg-primary tg-full" onClick={prepareDesign} disabled={designing}>{designing ? 'Preparing your event…' : 'Design with Taste'}<CompanyLogo /></button>{(design?.previewUrl || previewUrl) && <a className="tg-secondary tg-full" href={design?.previewUrl ?? previewUrl} target="_blank" rel="noreferrer">Open event preview</a>}</div><div className="tg-draft-actions"><button className="tg-secondary" onClick={() => copy(`${draft.title}\n\n${draft.description}\n\nProposed: ${draft.date}, ${draft.time}\n${draft.venue}\nFor: ${draft.audience}\nCapacity: ${draft.capacity}`)}><Copy size={15} />Copy for Luma</button><button className="tg-secondary" onClick={download}><ArrowDownToLine size={15} />Download brief</button></div><p className="tg-note">Copy into Luma when ready. Nothing has been published or booked.</p></>}
      {section === 'Outreach' && <><h3>Partnership inquiry</h3><p className="tg-muted">A draft for the organizer. Nothing has been sent.</p><pre className="tg-outreach">{text}</pre><div className="tg-draft-actions"><button className="tg-primary" onClick={() => copy(text)}><Copy size={15} />Copy inquiry</button><button className="tg-secondary" onClick={download}><ArrowDownToLine size={15} />Download</button></div></>}
    </div>
  </Dialog>;
}

function Analysis({ onClose, brief }: { onClose: () => void; brief: Brief }) {
  const portfolio = portfolioFor(brief);
  const budget = Number(brief.budget);
  const total = portfolio.reduce((sum, event) => sum + budgetRange(event).high + (event.feeCap ?? 0), 0);
  const hours = portfolio.reduce((sum, event) => sum + event.laborHours, 0);
  const includesSponsor = portfolio.some(event => event.kind === 'sponsor');
  return <Dialog title="Taste Labs strategy" onClose={onClose} wide>
    <div className="tg-analysis"><span className="tg-overline">Taste Labs · October–November 2026</span><h2>Start with the builders.<br />Keep the first plan in SF.</h2><p className="tg-analysis-lede">{brief.goal === 'Partnerships' ? 'Prioritize access to agent builders and a focused room for deeper product conversations.' : 'Small, hands-on events to learn what people need. Add a focused partnership when the budget supports it.'}</p>
      <div className="tg-analysis-grid"><div><h3>What Taste does</h3><p>A research and infrastructure company working on subjective domains, starting with design. Its Brand API brings brand context, style search and verification into AI workflows.</p><a href="https://tastelabs.com/api" target="_blank" rel="noreferrer">Brand API </a></div><div><h3>Who belongs in the room</h3><p>{brief.audience}</p><p className="tg-note">Your brief. The original audience suggestion is based on Taste’s public product and research pages.</p></div></div>
      <h3>The recommended sequence</h3><div className="tg-portfolio">{portfolio.map((event, i) => { return <div key={event.id}><span className="tg-sequence">{i + 1}</span><div><strong>{event.title}</strong><p>{event.dateLabel} · {event.kind === 'host' ? 'Own the experience' : 'Reach agent builders'}</p></div><b>{dollars(budgetRange(event).high + (event.feeCap ?? 0))}</b></div>; })}</div>
      <div className="tg-portfolio-total"><div><span>Cash ceiling for this scenario</span><strong>{dollars(total)}</strong></div><p>High estimates with 15% operating contingency.{includesSponsor ? ' Includes a proposed $6,000 Code fee ceiling; the organizer’s quote is still needed.' : ' No sponsorship fee included.'} Against your {dollars(budget)} budget: {dollars(budget - total)} remains.</p></div>
      <p className="tg-note">{hours} staff hours are separate: {dollars(hours * 75)} at an assumed $75/hour.{includesSponsor ? ' Code admission and passes must fit the package ceiling or the plan needs revision.' : ' Keep sponsorships as inquiries until quoted.'} These are planning estimates.</p>
      <h3>Why not sponsor everything?</h3><div className="tg-analysis-grid"><div><h4>Vercel Ship is an alternative</h4><p>Strong product fit, but a shorter production window. Ask for terms and compare with Code. Ship and Disrupt overlap on October 15.</p></div><div><h4>Europe needs a separate objective</h4><p>Web Summit directly overlaps Code. Slush is more useful for founder relationships than developer activation. Add travel, staff time and six prearranged relevant meetings before considering either.</p></div></div>
      <h3>The go / no-go decisions</h3><ul><li>Book an owned event only after venue, staffing and qualified RSVPs are confirmed.</li><li>Buy a sponsor package only with a practical activation, clear pass terms and consent-based follow-up.</li><li>For a smaller budget, host the workshop first. Keep sponsorship as an inquiry until quoted.</li><li>No existing Taste event calendar was verified. The three owned events are new proposals; no current event has been invented.</li></ul>
      <a className="tg-secondary" href="/taste/taste-labs-event-plan.md" download><ArrowDownToLine size={15} />Download full research & costs</a><p className="tg-note">Sources reviewed {CHECKED_AT}. Recommendations are a researched demo, not a live scan of every event.</p>
    </div>
  </Dialog>;
}

export function TasteWorkspace() {
  const team = useEventTeam();
  const [view, setView] = useState<'welcome' | 'setup' | 'plan'>('welcome');
  const [brief, setBrief] = useState<Brief>(defaultBrief);
  const [hasBrief, setHasBrief] = useState(false);
  const [edits, setEdits] = useState<Record<string, EventDraft>>({});
  const [filter, setFilter] = useState<Filter>('all');
  const [world, setWorld] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [analysis, setAnalysis] = useState(false);
  const [message, setMessage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [budgetOnly, setBudgetOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [siteError, setSiteError] = useState('');
  const responseText = answer || team.error || team.answer;
  useEffect(() => {
    // Hydrate the browser-only draft cache after the server-rendered welcome screen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { const saved = JSON.parse(localStorage.getItem(BRIEF_KEY) ?? 'null'); if (saved && typeof saved.website === 'string' && typeof saved.budget === 'string') { setBrief({ ...defaultBrief, ...saved }); setHasBrief(true); } const savedDrafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) ?? '{}'); if (savedDrafts && typeof savedDrafts === 'object' && !Array.isArray(savedDrafts)) setEdits(savedDrafts); } catch { /* Use the editable default brief when local storage is unavailable. */ }
  }, []);
  useEffect(() => { if (!message) return; const timer = setTimeout(() => setMessage(''), 3200); return () => clearTimeout(timer); }, [message]);
  const portfolio = useMemo(() => portfolioFor(brief), [brief]);
  const portfolioIds = useMemo(() => portfolio.map(event => event.id), [portfolio]);
  const visible = useMemo(() => opportunities.filter(event => (world || event.region === 'sf') && (filter === 'all' || event.kind === filter) && (!budgetOnly || (event.kind === 'host' && budgetRange(event).high <= 5000)) && (showAll || world || filter !== 'all' || budgetOnly || portfolioIds.includes(event.id))).sort((a, b) => filter === 'all' && !showAll && !world ? portfolioIds.indexOf(a.id) - portfolioIds.indexOf(b.id) : 0), [world, filter, budgetOnly, showAll, portfolioIds]);
  const selected = opportunities.find(event => event.id === selectedId);
  const selectedOutput = teamOutput(team.workspace, team.mapping[selectedId ?? '']);
  const selectedRemote = team.workspace?.opportunities.find(item => item.id === selectedId);
  const remoteDraft = team.workspace?.drafts.find(draft => draft.opportunityId === selectedRemote?.id);
  const remoteOutput = teamOutput(team.workspace, selectedRemote?.id);
  const teamOpportunities = team.workspace?.opportunities.filter(item => !item.evidenceIds.some(ref => ref.startsWith('research:taste:')) && !Object.values(team.mapping).includes(item.id) && (filter === 'all' || item.action === filter)) ?? [];
  function currentDraft(event: TasteOpportunity): EventDraft | undefined {
    const base = eventDraft(event, edits);
    if (!base || team.editing.includes(event.id)) return base;
    const record = team.workspace?.drafts.find(draft => draft.opportunityId === team.mapping[event.id]);
    if (!record) return base;
    return { ...base, ...record.fields.proposedDetails, title: record.fields.title, description: record.fields.description, audience: record.fields.audience };
  }
  function currentEvent(event: TasteOpportunity): TasteOpportunity {
    const item = team.workspace?.opportunities.find(value => value.id === team.mapping[event.id]);
    const draft = team.workspace?.drafts.find(value => value.opportunityId === item?.id);
    return { ...event, ...(item && item.updatedAt !== item.createdAt ? { reason: item.rationale, recommendation: item.rationale } : {}), ...(draft && draft.version > 1 ? { title: draft.fields.title, audience: draft.fields.audience, format: draft.fields.format } : {}) };
  }
  const previewEvents = opportunities.filter(event => RECOMMENDED_IDS.includes(event.id));
  function updateDraft(draft: EventDraft) { if (!selected) return; const next = { ...edits, [selected.id]: draft }; setEdits(next); team.saveDraft(selected, draft); try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(next)); } catch { setMessage('Draft stays open, but could not be saved on this device. Download a copy.'); } }
  function continueOnboarding(event?: FormEvent) { event?.preventDefault(); try { const host = new URL(brief.website.includes('://') ? brief.website : `https://${brief.website}`).hostname.replace(/^www\./, ''); if (host !== 'tastelabs.com') { setSiteError('This demo is prepared for Taste Labs. Use tastelabs.com to explore the researched plan.'); return; } setSiteError(''); setView('setup'); void team.extractBrand(brief.website).catch(error => setMessage(error.message)); } catch { setSiteError('Enter a website, for example tastelabs.com.'); } }
  async function openPlan(nextBrief = brief) { try { localStorage.setItem(BRIEF_KEY, JSON.stringify(nextBrief)); } catch { /* The server also persists the brief. */ } setHasBrief(true); setView('plan'); try { await team.saveBrief(nextBrief); } catch (error) { setMessage(error instanceof Error ? error.message : 'Your brief could not be saved.'); } }
  function ask(value: string) {
    if (!value.trim()) return;
    setPrompt(''); setBudgetOnly(false); team.clearAnswer(); team.clearError();
    if (/5[,.]?000|5k|cheap|barat|presupuesto|budget|cost/i.test(value)) { setFilter('host'); setBudgetOnly(true); setAnswer('Start with Brand to build ($1,587–2,668) and the Prototype salon ($1,219–2,128). Together: $2,806–4,796 in planning cash, including 15% contingency. Internal staff time is separate. Sponsorship needs an organizer quote.'); }
    else if (/world|global|europe|europa|mundo|lisbon|slush/i.test(value)) { setWorld(true); setFilter('sponsor'); setAnswer('Keep SF first. Web Summit overlaps Code and adds $6,670–10,695 in travel, admission and operating allowances before a sponsor fee. Slush adds $4,140–6,440 plus admission and sponsorship. Reconsider for a specific Europe objective with six relevant meetings arranged.'); }
    else if (/sponsor|patrocin/i.test(value)) { setFilter('sponsor'); setAnswer('AI Engineer Code is the first inquiry: the closest fit for agent builders, with no SF travel costs. Ask for a practical session, included passes and a full quote. Proposed fee ceiling: $6,000. Vercel Ship is the alternative; compare terms before choosing.'); }
    else if (/improve|mejora|current|actual/i.test(value)) { setAnswer('To improve an existing event, we need its page, current registrations, target audience and goal. No current Taste event calendar was verified in this demo. You can edit any proposed event’s title, description, audience and capacity from its Draft tab.'); }
    else if (/why|por qu|sf|san francisco/i.test(value)) { setWorld(false); setFilter('all'); setAnswer('Taste is based in SF, close to agent builders and design engineers. Local workshops make hands-on API activation possible without flights or hotels. Code offers the strongest audience fit; the Lisbon alternative overlaps it. Open Strategy for the full comparison and assumptions.'); }
    else if (/host|create|organ|draft|event|evento|propon/i.test(value)) { setFilter('host'); setWorld(false); setAnswer('Host Brand to build first: a 24-person API workshop with an editable event draft. Follow with the Prototype research salon. Keep the builders’ dinner conditional on eight qualified RSVPs. Each card includes the proposed agenda, venue options and cost assumptions.'); }
    else { setAnswer('This researched Taste Labs demo can explain the proposed events, sponsorships, costs and SF versus Europe tradeoffs. Try “What should we host?” or “Why SF first?”. Open a card to edit an event draft.'); }
  }
  return <BrandContext.Provider value={team.brand}><div className="tg-app">
    <a className="tg-skip" href="#tg-main">Skip to content</a>
    {view !== 'plan' ? <main id="tg-main" className="tg-onboarding">
      <section className="tg-onboarding-left"><header><Brand onClick={() => setView('welcome')} />{hasBrief && <button className="tg-text-button" onClick={() => setView('plan')}>Open your plan</button>}</header>
        <div className="tg-onboarding-content">
          {view === 'welcome' ? <><h1>The right people.<br />In your next room.</h1><p className="tg-welcome-copy">Find events to host and partnerships to pursue.</p><form onSubmit={continueOnboarding}><label htmlFor="company-site">Your company website</label><div className="tg-website-field"><Globe2 size={18} /><input id="company-site" autoComplete="url" value={brief.website} onChange={e => { setBrief({ ...brief, website: e.target.value }); setSiteError(''); }} placeholder="yourcompany.com" required /></div>{siteError && <p className="tg-form-error" role="alert">{siteError}</p>}<button className="tg-primary tg-full" type="submit">Build my event plan</button></form><button className="tg-demo-link" onClick={() => { setBrief(defaultBrief); void openPlan(defaultBrief); }}>Explore the Taste Labs demo</button></> : <><button className="tg-back" onClick={() => setView('welcome')}><ArrowLeft size={15} />Back</button><span className="tg-step-label">Step 2 of 2 · Your brief</span><h1>Make it yours.</h1><p className="tg-welcome-copy">A few details to shape your event plan.</p><form className="tg-setup-form" onSubmit={e => { e.preventDefault(); openPlan(); }}><fieldset className="tg-goal-fieldset"><legend>What’s the goal?</legend><div className="tg-goals">{['Product adoption', 'Partnerships', 'Community'].map(goal => <button key={goal} type="button" aria-pressed={brief.goal === goal} onClick={() => setBrief({ ...brief, goal })}>{goal}</button>)}</div></fieldset><label>Who do you want in the room?<input value={brief.audience} onChange={e => setBrief({ ...brief, audience: e.target.value })} required /></label><fieldset className="tg-budget-fieldset"><legend>Budget</legend><div className="tg-budget-options">{[5000, 15000, 30000].map(value => <label key={value}><input type="radio" name="budget" value={value} checked={brief.budget === String(value)} onChange={() => setBrief({ ...brief, budget: String(value) })} /><span>{dollars(value)}{brief.budget === String(value) && <Check size={13} />}</span></label>)}</div></fieldset><div className="tg-setup-city"><MapPin size={13} />San Francisco<span>+ worldwide options</span></div><button className="tg-primary tg-full" type="submit">See my event plan</button></form></>}
        </div>
      </section>
      <section className="tg-onboarding-preview" aria-label="Example event plan for Taste Labs"><TasteMap events={previewEvents} preview onSelect={() => { void openPlan(); }} /><div className="tg-preview-top"><span className="tg-preview-company"><CompanyLogo /><span className="tg-preview-dot">/</span>San Francisco</span><span className="tg-demo-badge">Example plan</span></div><div className="tg-preview-card"><div className="tg-preview-card-image"><EventCover event={opportunities[0]} /><span>Proposed for Taste Labs</span></div><div className="tg-preview-card-content"><Kind event={opportunities[0]} /><h3>From brand to build</h3><p>A hands-on evening for people building AI.</p><div><span>Oct 22 · San Francisco</span><span>24 guests</span></div></div></div><div className="tg-preview-legend"><span className="tg-host-dot" />Events to host<span className="tg-sponsor-dot" />Sponsorships</div></section>
    </main> : <>
      <header className="tg-header"><Brand onClick={() => setView('welcome')} /><span className="tg-header-divider" /><button className="tg-company-switch" onClick={() => setView('setup')}><CompanyLogo /><ChevronDown size={13} /></button><div className="tg-header-actions"><button className="tg-text-button" onClick={() => setAnalysis(true)}><FileText size={15} />Strategy</button><button className="tg-text-button" onClick={() => setView('setup')}><SlidersHorizontal size={15} />Edit brief</button></div></header>
      <main id="tg-main" className="tg-workspace"><aside className="tg-plan-panel"><div className="tg-plan-heading"><div><h1>Your event plan.</h1><p>{brief.goal} · Oct–Nov 2026</p></div></div><div className="tg-list-tabs">{(['all', 'host', 'sponsor'] as Filter[]).map(value => <button key={value} aria-pressed={filter === value} onClick={() => { setFilter(value); setBudgetOnly(false); }}>{value === 'all' ? 'For you' : value === 'host' ? 'Host' : 'Sponsor'}<span>{opportunities.filter(e => (world || e.region === 'sf') && (value === 'all' ? (world || showAll || portfolioIds.includes(e.id)) : e.kind === value)).length}</span></button>)}</div>
        <div className="tg-event-list">{budgetOnly && <button className="tg-filter-chip" onClick={() => setBudgetOnly(false)}>Under $5k per event<X size={12} /></button>}{teamOpportunities.map(item => <TeamCard key={item.id} opportunity={item} onClick={() => setSelectedId(item.id)} />)}{visible.map(event => <EventCard key={event.id} event={currentEvent(event)} selected={event.id === selectedId} onClick={() => setSelectedId(event.id)} />)}{!showAll && !world && filter === 'all' && !budgetOnly && <button className="tg-more" onClick={() => setShowAll(true)}>Explore {opportunities.filter(event => event.region === 'sf').length - portfolio.length} alternatives</button>}<p className="tg-list-footnote">Estimates include 15% contingency. Sponsor fees require a quote.</p></div><button className="tg-plan-summary" onClick={() => setAnalysis(true)}><span><FileText size={15} />Your recommended plan</span><span>{portfolio.length} moves</span></button>
      </aside><section className="tg-map-area" aria-label="Your event map"><TasteMap events={visible} selectedId={selectedId} onSelect={id => { if (world && opportunities.find(event => event.id === id)?.region === 'sf') setWorld(false); else setSelectedId(id); }} world={world} /><div className="tg-map-topbar"><div className="tg-region-switch"><button aria-pressed={!world} onClick={() => setWorld(false)}><MapPin size={14} />San Francisco</button><button aria-pressed={world} onClick={() => setWorld(true)}><Globe2 size={14} />Worldwide</button></div><span className="tg-map-period">Oct — Nov, 2026</span></div><div className="tg-map-key"><span><i className="tg-host-dot" />Host</span><span><i className="tg-sponsor-dot" />Sponsor</span><span>Proposed places are approximate</span></div><div className="tg-prompt-dock">{team.running && <div className="tg-team-status" role="status">Your team is preparing a recommendation…</div>}{responseText && <div className="tg-answer" role="status"><div><span className="tg-answer-mark">G</span><strong>Your event team</strong><button aria-label="Close response" onClick={() => { setAnswer(''); team.clearAnswer(); team.clearError(); }}><X size={14} /></button></div><p>{responseText}</p><button className="tg-text-button" onClick={() => setAnalysis(true)}>See the full reasoning</button></div>}<div className="tg-prompt-suggestions">{['What should we host?', 'Keep it under $5k', 'Why SF first?'].map(suggestion => <button key={suggestion} onClick={() => ask(suggestion)}>{suggestion}</button>)}</div><form className="tg-prompt" onSubmit={e => { e.preventDefault(); const question = prompt.trim(); if (!question) return; setPrompt(''); setAnswer(''); team.clearAnswer(); team.clearError(); void team.askTeam(question, selectedId).catch(error => setAnswer(error.message)); }}><input aria-label="Ask about your event plan" placeholder="Ask your event team…" value={prompt} onChange={e => setPrompt(e.target.value)} /><button type="submit" aria-label="Send prompt" disabled={!prompt.trim() || team.running}><ArrowUp size={19} /></button></form></div></section></main>
    </>}
    {selected && <OpportunityDetail key={selected.id} event={currentEvent(selected)} draft={currentDraft(selected)} previewUrl={selectedOutput.previewUrl} outreach={selectedOutput.outreach} onDraft={updateDraft} onClose={() => setSelectedId(undefined)} />}
    {selectedRemote && !selected && <Dialog title={selectedRemote.title} onClose={() => setSelectedId(undefined)}><TeamDetails key={selectedRemote.id} opportunity={selectedRemote} draft={remoteDraft} previewUrl={remoteOutput.previewUrl} outreach={remoteOutput.outreach} onSave={team.saveRecord} onAsk={team.askTeam} /></Dialog>}
    {analysis && <Analysis onClose={() => setAnalysis(false)} brief={brief} />}
    {message && <div className="tg-toast" role="status"><Check size={15} />{message}</div>}
  </div></BrandContext.Provider>;
}
