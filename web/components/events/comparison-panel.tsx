'use client';

// Lightweight adaptation of GrowthX comparison-panel.tsx: supported facts and
// missing costs remain visible. No commercial score or persisted decision is invented.
import { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import type { EventDetail, EventSummary } from '@/lib/contracts/event-gtm';
import { costText, displayDate, displayLocation, temporalLabel } from './display';
import { SourceLinks } from './evidence-links';

type Loaded = { key: string; details: Record<string, EventDetail>; failed: string[] };

export function ComparisonPanel({ events, onOpen, onRemove }: { events: EventSummary[]; onOpen: (id: string) => void; onRemove: (event: EventSummary) => void }) {
  const [loaded, setLoaded] = useState<Loaded>({ key: '', details: {}, failed: [] });
  const [retry, setRetry] = useState(0);
  const ids = events.map(event => event.id).join('\n');
  const key = `${ids}:${retry}`;
  useEffect(() => {
    const controller = new AbortController();
    const selectedIds = ids.split('\n').filter(Boolean);
    void Promise.allSettled(selectedIds.map(async id => {
      const response = await fetch(`/api/events/${encodeURIComponent(id)}`, { signal: controller.signal });
      if (!response.ok) throw new Error('Detail unavailable');
      return await response.json() as EventDetail;
    })).then(results => {
      if (controller.signal.aborted) return;
      const details: Record<string, EventDetail> = {};
      const failed: string[] = [];
      results.forEach((result, index) => { if (result.status === 'fulfilled') details[selectedIds[index]] = result.value; else failed.push(selectedIds[index]); });
      setLoaded({ key, details, failed });
    });
    return () => controller.abort();
  }, [ids, key]);
  const current = loaded.key === key ? loaded : null;
  if (!events.length) return <div className="empty-state"><h3>Your comparison starts with a shortlist</h3><p>Select up to three events in the catalog to inspect their dates, location, costs and sources side by side.</p></div>;
  return <section className="comparison-section" aria-label="Compare selected events">
    <p className="muted small comparison-intro">Compare documented facts. Unknown costs cannot establish a budget match; historical participation cannot establish sponsor interest.</p>
    <div className="comparison-scroll" tabIndex={0} role="region" aria-label="Event comparison table"><table className="comparison-table"><thead><tr><th scope="col">Decision context</th>{events.map(event => <th scope="col" key={event.id}><button className="comparison-remove icon-button" aria-label={`Remove ${event.title} from comparison`} onClick={() => onRemove(event)}><X size={15} /></button><button className="comparison-title" onClick={() => onOpen(event.id)}>{event.title}</button></th>)}</tr></thead><tbody>
      <tr><th scope="row">Date</th>{events.map(event => <td key={event.id}>{displayDate(event.startDate)}<span className="table-note">{temporalLabel(event)}</span></td>)}</tr>
      <tr><th scope="row">Location</th>{events.map(event => <td key={event.id}>{displayLocation(event)}<span className="table-note">{event.modality?.replaceAll('_', ' ') || 'Format not documented'}</span></td>)}</tr>
      <tr><th scope="row">Topics</th>{events.map(event => <td key={event.id}>{event.topics.join(', ') || 'Not documented'}</td>)}</tr>
      <tr><th scope="row">Recorded costs</th>{events.map(event => <td key={event.id}>{!current ? <span role="status">Loading evidence…</span> : !current.details[event.id] ? 'Cost evidence unavailable' : current.details[event.id].costs.length ? current.details[event.id].costs.map(cost => <p className="comparison-cost" key={cost.id}><b>{cost.category?.replaceAll('_', ' ') || 'Unclassified cost'}</b><br />{costText(cost)}<span className="table-note">{cost.status?.replaceAll('_', ' ') || 'Status not documented'}</span></p>) : <span className="unknown-value">Unknown · request a quote</span>}</td>)}</tr>
      <tr><th scope="row">Sponsor history</th>{events.map(event => <td key={event.id}>{event.sponsorCount ? `${event.sponsorCount} linked relation${event.sponsorCount === 1 ? '' : 's'}` : 'No sponsor history linked'}<span className="table-note">Does not establish availability</span></td>)}</tr>
      <tr><th scope="row">What is missing</th>{events.map(event => <td key={event.id}>{event.missing.length ? event.missing.map(field => field.replaceAll('_', ' ')).join(', ') : 'Confirm fit and commercial terms'}</td>)}</tr>
      <tr><th scope="row">Sources</th>{events.map(event => <td key={event.id}><SourceLinks compact sources={[event.source]} />{current?.details[event.id] && <span className="table-note">{current.details[event.id].evidenceTotal} field assertions</span>}<button className="text-button" onClick={() => onOpen(event.id)}>Inspect evidence<ArrowRight size={13} /></button></td>)}</tr>
    </tbody></table></div>
    {current && current.failed.length > 0 && <div className="notice notice-error" role="alert"><span>Some evidence could not be loaded. Missing responses are not treated as missing costs.</span><button className="button" onClick={() => setRetry(value => value + 1)}>Retry evidence</button></div>}
  </section>;
}
