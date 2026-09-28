'use client';

// Adapted from GrowthX research-events.tsx: selection, explicit uncertainty and
// event/source actions. Receives one server-filtered page, never all dossiers.
import type { EventSummary } from '@/lib/contracts/event-gtm';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { displayDate, displayLocation, temporalKind, temporalLabel } from './display';

export function EventList({ events, selectedId, shortlist, onOpen, onToggle }: { events: EventSummary[]; selectedId: string | null; shortlist: EventSummary[]; onOpen: (id: string) => void; onToggle: (event: EventSummary) => void }) {
  return <div className="event-list">{events.map(event => {
    const checked = shortlist.some(item => item.id === event.id);
    return <article className="event-row" key={event.id} data-selected={selectedId === event.id}>
      <label className="shortlist-check"><input type="checkbox" checked={checked} disabled={!checked && shortlist.length >= 3} onChange={() => onToggle(event)} aria-label={`Compare ${event.title}`} /><span className="sr-only">Add to comparison</span></label>
      <div className="event-content"><div className="event-eyebrow"><span className={`status-dot status-${temporalKind(event)}`}>{temporalLabel(event)}</span>{event.category && <span>{event.category.replaceAll('_', ' ')}</span>}</div>
        <h3><button type="button" className="event-title" onClick={() => onOpen(event.id)}>{event.title}</button></h3>
        <div className="event-metadata"><span><CalendarDays size={13} aria-hidden="true" />{displayDate(event.startDate)}</span><span><MapPin size={13} aria-hidden="true" />{displayLocation(event)}</span></div>
        {event.topics.length > 0 && <div className="topic-list" aria-label="Documented topics">{event.topics.slice(0, 4).map(topic => <span key={topic}>{topic}</span>)}{event.topics.length > 4 && <span>+{event.topics.length - 4}</span>}</div>}
        <div className="event-bottom"><span className="muted small">{event.sponsorCount > 0 ? `${event.sponsorCount} documented sponsor relation${event.sponsorCount === 1 ? '' : 's'}` : 'Sponsor history not linked'}</span><button className="text-button" onClick={() => onOpen(event.id)}>View evidence<ArrowRight size={14} aria-hidden="true" /></button></div>
      </div>
    </article>;
  })}</div>;
}
