'use client';

import { useState, type FormEvent } from 'react';
import { ArrowDownToLine, ArrowRight, Bookmark, Filter, MapPin, Search, X, CalendarDays, Sparkles, Handshake, Wrench } from 'lucide-react';
import type { EventSummary, SearchFilters, SearchResponse } from '@/lib/contracts/event-gtm';
import { displayDate, displayLocation, temporalKind, temporalLabel } from './events/display';
import { EventMap } from './events/event-map';
import { ComparisonPanel } from './events/comparison-panel';

type Mode = 'create' | 'improve' | 'sponsor';
type Props = {
  form: SearchFilters;
  setForm: (update: SearchFilters | ((previous: SearchFilters) => SearchFilters)) => void;
  search: (event: FormEvent<HTMLFormElement>) => void;
  current: SearchResponse | null;
  loading: boolean;
  error: string | null;
  retrySearch: () => void;
  shortlist: EventSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onToggle: (event: EventSummary) => void;
  onExport: () => void;
};

const MODES: { id: Mode; label: string; title: string; description: string; placeholder: string; icon: typeof Sparkles }[] = [
  { id: 'create', label: 'Create an event', title: 'Signals for new events', description: 'Find the audience, places and moments that could make your next event worth hosting.', placeholder: 'What should your next event make happen?', icon: Sparkles },
  { id: 'improve', label: 'Improve an event', title: 'Improve an event', description: 'Bring an event you already run. We’ll help sharpen its audience, format and partner fit.', placeholder: 'Paste an event link or describe what needs work…', icon: Wrench },
  { id: 'sponsor', label: 'Sponsor an event', title: 'Sponsorship targets', description: 'Find public events and evaluate where your brand could show up with purpose.', placeholder: 'Who do you want to reach, and where?', icon: Handshake },
];

export function MapFirstWorkspace({ form, setForm, search, current, loading, error, retrySearch, shortlist, selectedId, onSelect, onOpen, onToggle, onExport }: Props) {
  const [mode, setMode] = useState<Mode>('create');
  const [view, setView] = useState<'map' | 'shortlist'>('map');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const active = MODES.find(item => item.id === mode)!;
  // Public catalog entries are useful discovery signals and sponsorship targets.
  // They are not presented as the customer's own events to improve.
  const events = mode === 'improve' ? [] : current?.events.slice(0, 12) ?? [];

  return <div className="fieldwork-shell">
    <header className="fieldwork-topbar">
      <a className="workspace-wordmark" href="/" aria-label="GrowthX home">GrowthX</a>
      <div className="fieldwork-topbar-actions">{view === 'shortlist' && <button className="shortlist-nav" onClick={() => setView('map')}><MapPin size={15} /> Back to map</button>}</div>
    </header>

    <main className="fieldwork-main">
      {view === 'map' ? <>
        <div className="map-toolbar"><div className="map-title"><span className="map-kicker">YOUR EVENT TEAM</span><h1>{mode === 'create' ? 'A new event worth hosting.' : mode === 'improve' ? 'Make your event stronger.' : 'Find the right rooms to sponsor.'}</h1><p>{active.description}</p></div></div>
        <div className="map-results-layout">
          <section className={`map-stage mode-${mode}`} aria-label="Opportunity map">
            {error ? <div className="map-state"><h3>Map unavailable</h3><p>{error}</p><button onClick={retrySearch}>Try again</button></div> : loading && !current ? <div className="map-state"><span className="loader-orbit" /><h3>Gathering your map</h3></div> : current ? <EventMap events={current.events} selectedId={selectedId} onSelect={onSelect} onOpen={onOpen} /> : null}
            {current && <div className="map-disclaimer">Public event listings · Locations follow their published sources</div>}
            <form className="map-search map-prompt" onSubmit={search}><Search size={18} /><input aria-label={active.placeholder} placeholder={active.placeholder} value={form.q} onChange={event => setForm(previous => ({ ...previous, q: event.target.value }))} /><button type="submit" aria-label="Explore opportunities"><ArrowRight size={18} /></button></form>
          </section>
          <aside className={`results-panel mode-${mode}`}>
            <div className="results-panel-heading"><div><span className="results-overline">{mode === 'create' ? 'PUBLIC SIGNALS' : mode === 'improve' ? 'YOUR EVENT' : 'PARTNER OPPORTUNITIES'}</span><h2>{active.title}<small>{mode === 'improve' ? 0 : current?.total ?? 0}</small></h2></div>{mode !== 'improve' && <button className={`filter-trigger${filtersOpen ? ' active' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><Filter size={14} /> Filter</button>}
              {filtersOpen && <div className="quick-filters"><div className="quick-filters-heading"><strong>Filter events</strong><button aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X size={15} /></button></div><label>When<select value={form.scope} onChange={event => setForm(previous => ({ ...previous, scope: event.target.value as SearchFilters['scope'] }))}><option value="upcoming">Coming up</option><option value="history">Past events</option><option value="all">Any time</option></select></label><label>Country<select value={form.country} onChange={event => setForm(previous => ({ ...previous, country: event.target.value }))}><option value="">Everywhere</option>{(current?.countries ?? []).map(country => <option key={country}>{country}</option>)}</select></label><label>Focus<select value={form.sector} onChange={event => setForm(previous => ({ ...previous, sector: event.target.value as SearchFilters['sector'] }))}><option value="tech">Technology</option><option value="all">All sectors</option></select></label></div>}
            </div>
            <div className="opportunity-modes" role="tablist" aria-label="Opportunity type">
              {MODES.map(item => { const Icon = item.icon; return <button key={item.id} type="button" role="tab" aria-selected={mode === item.id} className={`opportunity-mode${mode === item.id ? ' active' : ''} mode-${item.id}`} onClick={() => setMode(item.id)}><Icon size={14} /><span>{item.id === 'create' ? 'Create' : item.id === 'improve' ? 'Improve' : 'Sponsor'}</span></button>; })}
            </div>
            {mode !== 'sponsor' && <div className="mode-context"><span className="mode-context-icon">{mode === 'create' ? <CalendarDays size={16} /> : <Wrench size={16} />}</span><span>{mode === 'create' ? 'Public events are signals for the events you could host.' : 'Share the event name or link below to find it and shape a better version.'}</span></div>}
            {mode === 'improve' ? <div className="improve-empty"><div className="improve-empty-icon"><Wrench size={18} /></div><strong>Start with an event you already run.</strong><p>Enter its name or public link in the prompt below. We’ll keep the review focused on that event.</p><span>YOUR EVENT <ArrowRight size={13} /> A stronger event</span></div> : error ? <div className="rail-empty">Couldn’t load opportunities. <button onClick={retrySearch}>Retry</button></div> : loading && !current ? <div className="rail-loading"><i /><i /><i /></div> : events.length ? <div className="opportunity-list">{events.map((event, index) => <article className={`opportunity-card${selectedId === event.id ? ' selected' : ''}`} key={event.id}>
              <button className="opportunity-open" onClick={() => onOpen(event.id)} aria-label={`Open ${event.title}`}>
                <span className="opportunity-card-top"><span className="opportunity-number">{String(index + 1).padStart(2, '0')}</span><span className="opportunity-meta"><span className={`status-dot status-${temporalKind(event)}`}>{temporalLabel(event)}</span>{event.category && <span>{event.category.replaceAll('_', ' ')}</span>}</span></span>
                <strong className="opportunity-title">{event.title}</strong>
                <span className="opportunity-location"><span>{displayDate(event.startDate)}</span><i>·</i><MapPin size={12} /><span>{displayLocation(event)}</span></span>
                {event.topics.length > 0 && <span className="opportunity-tags">{event.topics.slice(0, 3).map(topic => <span key={topic}>{topic}</span>)}</span>}
                {mode === 'sponsor' && <span className="event-sponsor-signal">{event.sponsorCount > 0 ? `${event.sponsorCount} listed sponsor${event.sponsorCount === 1 ? '' : 's'}` : 'Sponsorship data not listed'}</span>}
              </button>
              <button className={`save-opportunity${shortlist.some(item => item.id === event.id) ? ' saved' : ''}`} onClick={() => onToggle(event)} aria-label={`${shortlist.some(item => item.id === event.id) ? 'Remove' : 'Save'} ${event.title}`} aria-pressed={shortlist.some(item => item.id === event.id)}><Bookmark size={17} fill={shortlist.some(item => item.id === event.id) ? 'currentColor' : 'none'} /></button>
            </article>)}</div> : <div className="rail-empty">No events match yet. Try another search.</div>}
            {shortlist.length > 0 && <button className="shortlist-cta" onClick={() => setView('shortlist')}>View saved events <span>{shortlist.length}</span><ArrowRight size={15} /></button>}
            <div className="panel-footnote">Public event data · Open an event to review its sources</div>
          </aside>
        </div>
      </> : <section className="shortlist-view"><div className="shortlist-view-heading"><div><span className="eyebrow">YOUR NEXT MOVES</span><h1>Saved events <small>{shortlist.length}</small></h1></div><div className="shortlist-actions"><button className="export-brief" onClick={onExport}><ArrowDownToLine size={15} /> Export</button><button onClick={() => setView('map')}><MapPin size={15} /> Back to map</button></div></div><ComparisonPanel events={shortlist} onOpen={onOpen} onRemove={onToggle} /></section>}
    </main>
  </div>;
}
