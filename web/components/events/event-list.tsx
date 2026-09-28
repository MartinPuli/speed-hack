'use client';

// Current-page catalog records stay grounded in the catalog; persisted plans are
// joined by catalogEventId and concepts without one remain unlocated cards.
import type { EventSummary } from '@/lib/contracts/event-gtm';
import type { WorkspaceOpportunity } from '@/lib/contracts/agent-workspace';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { displayDate, displayLocation, temporalKind, temporalLabel } from './display';
import { opportunityForEvent, opportunityStateLabel, opportunityVisualState, rankOpportunities } from './opportunity-state';
import './event-list.css';

interface Props {
  events: EventSummary[];
  opportunities?: WorkspaceOpportunity[];
  selectedId: string | null;
  shortlist: EventSummary[];
  onOpen: (id: string) => void;
  onToggle: (event: EventSummary) => void;
}

function actionLabel(action: WorkspaceOpportunity['action']): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export function EventList({ events, opportunities = [], selectedId, shortlist, onOpen, onToggle }: Props) {
  const topOpportunities = rankOpportunities(opportunities, 3);
  return <div className="event-list-column">
    {topOpportunities.length > 0 && <section className="event-opportunity-rank" aria-labelledby="top-opportunities-title">
      <div className="event-opportunity-rank-heading"><span className="eyebrow">LEAD’S PRIORITIES</span><h3 id="top-opportunities-title">Top opportunities</h3><p>Ranked by relative fit. Scores describe fit, not expected success or ROI.</p></div>
      <ol>{topOpportunities.map((opportunity, index) => {
        const event = events.find(item => item.id === opportunity.catalogEventId);
        const visualState = opportunity.catalogEventId === null ? 'proposed' : event ? opportunityVisualState(event, opportunity) : opportunity.state === 'historical' ? 'historical' : opportunity.state === 'active' ? 'active' : 'needs_review';
        return <li className={`event-opportunity-card state-${visualState}`} key={opportunity.id}>
          <span className="event-opportunity-rank-number">{index + 1}</span>
          <div className="event-opportunity-card-content">
            <div className="event-opportunity-card-meta"><span className={`event-opportunity-state state-${visualState}`}><i aria-hidden="true" />{opportunityStateLabel(visualState)}</span><span>{opportunity.fit === null ? 'Fit pending' : `Fit ${opportunity.fit}/100`}</span></div>
            <h4>{opportunity.title}</h4>
            <p>{opportunity.rationale || 'The Lead has not added a reason yet.'}</p>
            <div className="event-opportunity-card-bottom"><span>{actionLabel(opportunity.action)}{opportunity.catalogEventId === null ? ' · team concept' : ''}</span>{opportunity.catalogEventId && <button type="button" onClick={() => onOpen(opportunity.catalogEventId!)}>Review evidence<ArrowRight size={13} aria-hidden="true" /></button>}</div>
            {opportunity.catalogEventId === null && <span className="event-concept-location-note">Proposed by your team · no catalog event or location is attached.</span>}
          </div>
        </li>;
      })}</ol>
    </section>}
    <div className="event-list">{events.map(event => {
      const checked = shortlist.some(item => item.id === event.id);
      const opportunity = opportunityForEvent(event.id, opportunities);
      const visualState = opportunityVisualState(event, opportunity);
      return <article className="event-row" key={event.id} data-selected={selectedId === event.id} data-opportunity-state={visualState}>
        <label className="shortlist-check"><input type="checkbox" checked={checked} disabled={!checked && shortlist.length >= 3} onChange={() => onToggle(event)} aria-label={`Compare ${event.title}`} /><span className="sr-only">Add to comparison</span></label>
        <div className="event-content"><div className="event-eyebrow"><span className={`opportunity-state-label state-${visualState}`}><i aria-hidden="true" />{opportunityStateLabel(visualState)}</span><span className={`status-dot status-${temporalKind(event)}`}>{temporalLabel(event)}</span>{event.category && <span>{event.category.replaceAll('_', ' ')}</span>}</div>
          <h3><button type="button" className="event-title" onClick={() => onOpen(event.id)}>{event.title}</button></h3>
          <div className="event-metadata"><span><CalendarDays size={13} aria-hidden="true" />{displayDate(event.startDate)}</span><span><MapPin size={13} aria-hidden="true" />{displayLocation(event)}</span></div>
          {opportunity && <div className={`event-row-opportunity state-${visualState}`}><div><strong>{actionLabel(opportunity.action)} plan</strong>{opportunity.fit !== null && <span>Fit {opportunity.fit}/100</span>}</div><p>{opportunity.rationale || 'No decision reason has been recorded.'}</p></div>}
          {event.topics.length > 0 && <div className="topic-list" aria-label="Documented topics">{event.topics.slice(0, 4).map(topic => <span key={topic}>{topic}</span>)}{event.topics.length > 4 && <span>+{event.topics.length - 4}</span>}</div>}
          <div className="event-bottom"><span className="muted small">{event.sponsorCount > 0 ? `${event.sponsorCount} documented sponsor relation${event.sponsorCount === 1 ? '' : 's'}` : 'Sponsor history not linked'}</span><button className="text-button" onClick={() => onOpen(event.id)}>View evidence<ArrowRight size={14} aria-hidden="true" /></button></div>
        </div>
      </article>;
    })}</div>
  </div>;
}
