'use client';

import './legacy-workspaces.css';

// Selective GrowthX extraction: the list/map/dossier relationship and editable
// brief are retained. This new shell reads paginated SQLite-backed API results
// instead of loading every dossier or requiring research runs and PostgreSQL.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronDown, Download, ListFilter, Map, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import type { EventDetail, EventSummary, ResearchBrief, SearchFilters, SearchResponse } from '@/lib/contracts/event-gtm';
import type { WorkspaceSnapshot } from '@/lib/contracts/agent-workspace';
import { downloadResearchBrief } from '@/lib/drafts/export';
import { EMPTY_BRIEF, ResearchBriefPanel } from './research-brief';
import { EventList } from './events/event-list';
import { EventDossier, type DossierState } from './events/event-dossier';
import { ComparisonPanel } from './events/comparison-panel';
import { EventMap } from './events/event-map';
import { displayDate } from './events/display';
import { EventStudio } from './event-studio';
import { AgentConsole } from './agent-console';

const DEFAULT_FILTERS: SearchFilters = { q: '', from: '', to: '', country: '', city: '', scope: 'upcoming', sector: 'tech', page: 1, pageSize: 20 };
const BRIEF_KEY = 'event-gtm:research-brief:v1';
const number = (value: number) => value.toLocaleString('en');

function restoreBrief(raw: string | null): ResearchBrief {
  if (!raw) return { ...EMPTY_BRIEF };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY_BRIEF };
    const result = { ...EMPTY_BRIEF };
    for (const key of Object.keys(EMPTY_BRIEF) as Array<keyof ResearchBrief>) {
      const value = (parsed as Record<string, unknown>)[key];
      if (typeof value === 'string' && value.length <= 10000) Object.assign(result, { [key]: value });
    }
    if (!['adoption', 'feedback', 'awareness', 'partnerships'].includes(result.objective)) result.objective = 'adoption';
    return result;
  } catch { return { ...EMPTY_BRIEF }; }
}

export function ResearchWorkspace() {
  const [brief, setBrief] = useState<ResearchBrief>({ ...EMPTY_BRIEF });
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [form, setForm] = useState<SearchFilters>({ ...DEFAULT_FILTERS });
  const [filters, setFilters] = useState<SearchFilters>({ ...DEFAULT_FILTERS });
  const [loaded, setLoaded] = useState<{ key: string; data: SearchResponse } | null>(null);
  const [error, setError] = useState<{ key: string; message: string } | null>(null);
  const [retry, setRetry] = useState(0);
  const [shortlist, setShortlist] = useState<EventSummary[]>([]);
  const [workspaceSnapshot, setWorkspaceSnapshot] = useState<WorkspaceSnapshot | null>(null);
  const [view, setView] = useState<'catalog' | 'comparison'>('catalog');
  const [mapOpen, setMapOpen] = useState(true);
  const [mapSelectedId, setMapSelectedId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<DossierState | null>(null);
  const [detailRetry, setDetailRetry] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [studioSource, setStudioSource] = useState<EventSummary | null | undefined>(undefined);
  const main = useRef<HTMLElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const query = new URLSearchParams(Object.entries(filters).map(([key, value]) => [key, String(value)])).toString();
  const requestKey = `${query}:${retry}`;
  const current = loaded?.key === requestKey ? loaded.data : null;
  const currentError = error?.key === requestKey ? error.message : null;
  const loading = !current && !currentError;
  const countries = loaded?.data.countries ?? [];
  const stats = loaded?.data.stats;
  const selectedId = dossier?.id ?? null;
  const workspaceOpportunities = workspaceSnapshot?.opportunities ?? [];
  const selectedOpportunityId = mapSelectedId ? workspaceOpportunities.find(opportunity => opportunity.catalogEventId === mapSelectedId)?.id : undefined;

  useEffect(() => {
    // Deferred hydration prevents a server/client mismatch and never overwrites
    // a saved brief with the server's empty initial value.
    queueMicrotask(() => {
      try { setBrief(restoreBrief(localStorage.getItem(BRIEF_KEY))); }
      catch { setStorageAvailable(false); }
    });
  }, []);

  function changeBrief(next: ResearchBrief) {
    setBrief(next);
    try { localStorage.setItem(BRIEF_KEY, JSON.stringify(next)); setStorageAvailable(true); }
    catch { setStorageAvailable(false); }
  }

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/events?${query}`, { signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 400 ? 'These search filters could not be applied. Check the date range and try again.' : 'The catalog is unavailable. Retry in a moment.');
        const data = await response.json() as SearchResponse;
        if (!Array.isArray(data.events)) throw new Error('The catalog returned an unreadable response.');
        if (!controller.signal.aborted) setLoaded({ key: requestKey, data });
      } catch (cause) {
        if (!controller.signal.aborted) setError({ key: requestKey, message: cause instanceof Error ? cause.message : 'The catalog could not be loaded.' });
      }
    })();
    return () => controller.abort();
  }, [query, requestKey]);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/events/${encodeURIComponent(selectedId)}`, { signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 404 ? 'This event is not available in the catalog.' : 'The event evidence could not be loaded.');
        const event = await response.json() as EventDetail;
        if (!controller.signal.aborted) setDossier({ id: selectedId, status: 'ready', event, error: null });
      } catch (cause) {
        if (!controller.signal.aborted) setDossier({ id: selectedId, status: 'error', event: null, error: cause instanceof Error ? cause.message : 'Evidence unavailable.' });
      }
    })();
    return () => controller.abort();
  }, [selectedId, detailRetry]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({ ...form, q: form.q.trim(), page: 1 });
    setView('catalog');
    setNotice(null);
  }
  function resetFilters() { setForm({ ...DEFAULT_FILTERS }); setFilters({ ...DEFAULT_FILTERS }); setNotice(null); }
  function applyBrief() {
    const geography = brief.geography.trim();
    const country = countries.find(item => item.toLocaleLowerCase() === geography.toLocaleLowerCase()) || '';
    const city = country ? '' : geography;
    const next: SearchFilters = { ...filters, q: brief.topics.trim(), country, city, from: brief.from, to: brief.to, page: 1 };
    setForm(next); setFilters(next); setView('catalog');
    setNotice(geography && !country ? `Topics, city and dates applied for “${geography}”. Audience, objective and budget remain context for your review.` : 'Topics, country and dates applied. Audience, objective and budget remain context for your review.');
  }
  function toggleShortlist(event: EventSummary) {
    setShortlist(previous => previous.some(item => item.id === event.id) ? previous.filter(item => item.id !== event.id) : previous.length < 3 ? [...previous, event] : previous);
  }
  function openEvent(id: string) { setMapSelectedId(id); setDossier({ id, status: 'loading', event: null, error: null }); if (id === selectedId) setDetailRetry(value => value + 1); }
  function paginate(page: number) {
    setFilters(previous => ({ ...previous, page }));
    resultHeading.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    resultHeading.current?.focus({ preventScroll: true });
  }
  function download() {
    try { downloadResearchBrief(brief, shortlist); setNotice('Research brief downloaded with your selected records and source references.'); }
    catch { setNotice('The brief could not be downloaded in this browser. Please try again.'); }
  }
  function createConcept(source: EventSummary | null = null) { setDossier(null); setStudioSource(source); }

  return <div className="research-workspace">
    <a className="skip-link" href="#main-content">Skip to research</a>
    <aside className="workspace-sidebar">
      <Link className="brand" href="/" aria-label="Event GTM home"><span className="brand-mark" aria-hidden="true"><span /></span><span>Event GTM<span className="brand-subtitle">YOUR GROWTH TEAM</span></span></Link>
      <div className="sidebar-section-label">Workspace</div>
      <nav aria-label="Workspace navigation"><button className="nav-item" aria-current={view === 'catalog' ? 'page' : undefined} onClick={() => setView('catalog')}><Map size={17} aria-hidden="true" />Opportunities</button><button className="nav-item" onClick={() => createConcept()}><Sparkles size={17} aria-hidden="true" />Event studio</button><button className="nav-item" aria-current={view === 'comparison' ? 'page' : undefined} onClick={() => setView('comparison')}><ListFilter size={17} aria-hidden="true" />Compare<span className="nav-count">{shortlist.length}</span></button></nav>
      <div className="sidebar-note"><span className="sidebar-team-label">YOUR EVENT TEAM</span><div><span className="team-avatar">L</span><span><strong>Lead</strong><small>Prioritize and assign</small></span></div><div><span className="team-avatar">S</span><span><strong>Scout</strong><small>Find and verify</small></span></div><div><span className="team-avatar">P</span><span><strong>Partnerships</strong><small>Interpret replies</small></span></div><div><span className="team-avatar">D</span><span><strong>Producer</strong><small>Shape the draft</small></span></div><p>One shared workspace for research, decisions, and private event drafts.</p></div>
      <div className="sidebar-bottom"><span className="connection-dot" />Research catalog<span className="sidebar-date">{stats ? `Sources checked · ${displayDate(stats.cutoff)}` : 'Reading catalog…'}</span></div>
    </aside>
    <main className="workspace-main" id="main-content" ref={main}>
      <header className="workspace-header"><div><div className="breadcrumb">YOUR WORKSPACE<span>/</span>{view === 'catalog' ? 'OPPORTUNITIES' : 'COMPARISON'}</div><h1>{view === 'catalog' ? <>The right rooms<br /><em>make things happen.</em></> : 'Compare the evidence.'}</h1><p className="page-description">{view === 'catalog' ? 'Explore where your company could show up next — or create a room of its own.' : 'A clear view of your shortlist, including the questions that remain open.'}</p></div><button className="button download-button" onClick={download}><Download size={16} aria-hidden="true" />Export research</button></header>
      {view === 'catalog' && <div className="opportunity-callout"><div className="callout-orb" aria-hidden="true"><span /></div><div><span className="eyebrow">CREATE THE ROOM</span><h2>Don’t see the gathering you need?</h2><p>Start with your audience and your ambition. Shape a beautiful event page, then take the copy to Luma.</p></div><button className="button button-primary" onClick={() => createConcept()}>Open Event Studio<ArrowRight size={16} /></button></div>}
      <ResearchBriefPanel brief={brief} onChange={changeBrief} onApply={applyBrief} storageAvailable={storageAvailable} />
      <AgentConsole initialBrief={brief} initialOpportunityId={selectedOpportunityId} onSnapshot={setWorkspaceSnapshot} />
      {stats && <div className="catalog-context"><span><b>{number(stats.upcoming)}</b> dated future records</span><span>Research snapshot · {displayDate(stats.cutoff)}</span><details><summary>About this catalog<ChevronDown size={12} aria-hidden="true" /></summary><div className="coverage-popover"><p>{number(stats.total)} retained records. These are source-backed research entries, not personalized recommendations or confirmed commercial opportunities.</p><p>Locations, availability and prices may be missing. A historical sponsor listing does not confirm interest or payment.</p></div></details></div>}
      {notice && <div className="notice" role="status"><span>{notice}</span><button className="icon-button" onClick={() => setNotice(null)} aria-label="Dismiss notice"><X size={15} aria-hidden="true" /></button></div>}
      {view === 'catalog' ? <>
        <form className="search-form" onSubmit={search} aria-label="Filter events"><div className="search-primary"><label className="search-field"><Search size={17} aria-hidden="true" /><span className="sr-only">Search events, topics or a place</span><input value={form.q} maxLength={500} onChange={event => setForm(previous => ({ ...previous, q: event.target.value }))} placeholder="Search events, topics or a place…" type="search" /></label><button className="button button-primary" type="submit">Search<ArrowRight size={16} aria-hidden="true" /></button></div>
          <div className="filter-fields"><label>Time horizon<select value={form.scope} onChange={event => setForm(previous => ({ ...previous, scope: event.target.value as SearchFilters['scope'] }))}><option value="upcoming">Upcoming events</option><option value="history">Historical editions</option><option value="all">All dates</option></select></label><label>City or market<input type="search" maxLength={100} value={form.city} onChange={event => setForm(previous => ({ ...previous, city: event.target.value, country: '' }))} placeholder="San Francisco" /></label><label>Country<select value={form.country} onChange={event => setForm(previous => ({ ...previous, country: event.target.value, city: '' }))}><option value="">Any country</option>{countries.map(country => <option key={country} value={country}>{country}</option>)}</select></label><label>Catalog focus<select value={form.sector} onChange={event => setForm(previous => ({ ...previous, sector: event.target.value as 'tech' | 'all' }))}><option value="tech">Technology</option><option value="all">All sectors</option></select></label><label>From<input type="date" value={form.from} max={form.to || undefined} onChange={event => setForm(previous => ({ ...previous, from: event.target.value }))} /></label><label>Through<input type="date" value={form.to} min={form.from || undefined} onChange={event => setForm(previous => ({ ...previous, to: event.target.value }))} /></label><button className="text-button reset-filters" type="button" onClick={resetFilters}>Reset filters</button></div>
        </form>
        <section className="results-section" aria-labelledby="results-heading" aria-busy={loading}>
          <div className="results-heading"><div><span className="eyebrow">EXPLORE THE LANDSCAPE</span><h2 id="results-heading" tabIndex={-1} ref={resultHeading}>Events on the horizon{current && <span className="result-count">{number(current.total)}</span>}</h2><p className="muted small" role="status">{loading ? 'Searching the research catalog…' : currentError ? 'Search unavailable' : current ? `${current.total === 0 ? 'No matches' : `Showing ${number((current.page - 1) * current.pageSize + 1)}–${number((current.page - 1) * current.pageSize + current.events.length)} of ${number(current.total)}`} · ${filters.q ? 'Text relevance, then date' : 'Ordered by date'} · team fit appears for saved opportunities` : ''}</p></div><button className="button map-toggle" aria-pressed={mapOpen} onClick={() => setMapOpen(value => !value)}><Map size={16} aria-hidden="true" />{mapOpen ? 'Hide map' : 'Show map'}</button></div>
          <div className="selection-toolbar"><span className="muted small"><SlidersHorizontal size={13} aria-hidden="true" />Select up to three events to compare.</span>{shortlist.length > 0 && <button className="text-button" onClick={() => setView('comparison')}>Compare selected ({shortlist.length}/3)<ArrowRight size={14} aria-hidden="true" /></button>}</div>
          {currentError ? <div className="empty-state error-state" role="alert"><h3>The catalog could not be loaded</h3><p>{currentError}</p><button className="button" onClick={() => setRetry(value => value + 1)}>Retry search</button></div> : loading ? <div className="loading-state" aria-hidden="true">{[0, 1, 2].map(value => <div className="skeleton-row" key={value}><div /><div /><div /></div>)}</div> : current && (current.events.length > 0 || workspaceOpportunities.length > 0) ? <div className={`results-layout${mapOpen ? ' with-map' : ''}`}>{mapOpen && <aside className="map-column" aria-label="Map of current results"><EventMap events={current.events} opportunities={workspaceOpportunities} selectedId={mapSelectedId} onSelect={setMapSelectedId} onOpen={openEvent} /><p className="map-scope-note">Only this page of results is shown. City centroids remain approximate areas, not venues; online and unlocated events stay in the list.</p></aside>}<div className="opportunity-list-column"><div className="list-intro"><span className="eyebrow">THE SHORTLIST</span><p>Open an event to see what is documented, then create a gathering around the opportunity.</p></div><EventList events={current.events} opportunities={workspaceOpportunities} selectedId={mapSelectedId} shortlist={shortlist} onOpen={openEvent} onToggle={toggleShortlist} />{current.totalPages > 1 && <nav className="pagination" aria-label="Event result pages"><button className="button" disabled={current.page <= 1} onClick={() => paginate(current.page - 1)}><ArrowLeft size={14} aria-hidden="true" />Previous</button><span className="muted small">Page {number(current.page)} of {number(current.totalPages)}</span><button className="button" disabled={current.page >= current.totalPages} onClick={() => paginate(current.page + 1)}>Next<ArrowRight size={14} aria-hidden="true" /></button></nav>}</div></div> : <div className="empty-state"><Search size={28} aria-hidden="true" /><h3>No events match these filters</h3><p>Try a broader topic, another date range or all sectors. Historical editions can provide useful background.</p><button className="button" onClick={resetFilters}>Reset filters</button></div>}
        </section>
      </> : <><div className="comparison-heading"><h2>Your shortlist<span className="result-count">{shortlist.length}/3</span></h2><button className="button" onClick={() => setView('catalog')}><ArrowLeft size={15} aria-hidden="true" />Back to catalog</button></div><ComparisonPanel events={shortlist} onOpen={openEvent} onRemove={toggleShortlist} /></>}
      <footer className="workspace-footer"><span>Event GTM · Opportunity workspace</span><span>Research-backed records · agent work stays private in this demo workspace.</span></footer>
    </main>
    {dossier && <EventDossier state={dossier} shortlisted={shortlist.some(event => event.id === dossier.id)} canShortlist={shortlist.length < 3} onClose={() => setDossier(null)} onRetry={() => { setDossier(previous => previous ? { ...previous, status: 'loading', error: null } : previous); setDetailRetry(value => value + 1); }} onOpen={openEvent} onToggle={toggleShortlist} onCreateConcept={createConcept} />}
    {studioSource !== undefined && <EventStudio brief={brief} source={studioSource} onClose={() => setStudioSource(undefined)} />}
  </div>;
}
