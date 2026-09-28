'use client';

// Adapted from GrowthX research-dossier.tsx and location-evidence.tsx. Dataset
// assertions are paraphrases, not reconstructed quotations or human reviews.
import { useEffect, useRef } from 'react';
import { ArrowRight, Check, Sparkles, X } from 'lucide-react';
import type { EventDetail, EventSummary } from '@/lib/contracts/event-gtm';
import { costText, displayDate, displayLocation, displayValue, humanize, temporalKind, temporalLabel } from './display';
import { PublicLink, SourceLinks } from './evidence-links';

export interface DossierState { id: string; status: 'loading' | 'ready' | 'error'; event: EventDetail | null; error: string | null }

export function EventDossier({ state, shortlisted, canShortlist, onClose, onRetry, onOpen, onToggle, onCreateConcept }: { state: DossierState; shortlisted: boolean; canShortlist: boolean; onClose: () => void; onRetry: () => void; onOpen: (id: string) => void; onToggle: (event: EventSummary) => void; onCreateConcept: (event: EventSummary) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => { element?.close(); };
  }, []);
  const event = state.event;
  return <dialog ref={dialog} className="dossier-dialog" aria-labelledby="dossier-heading" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }}>
    <header className="dossier-header"><span className="eyebrow">Event evidence</span><button autoFocus className="icon-button" aria-label="Close event evidence" onClick={onClose}><X size={19} aria-hidden="true" /></button></header>
    <div className="dossier-body">
      <h2 id="dossier-heading">{event?.title || (state.status === 'error' ? 'Evidence unavailable' : 'Loading event evidence…')}</h2>
      {state.status === 'loading' && <p className="muted" role="status">Reading this event and its linked sources.</p>}
      {state.status === 'error' && <div className="notice notice-error" role="alert"><p>{state.error || 'The event could not be loaded.'}</p><button className="button" onClick={onRetry}>Try again</button></div>}
      {state.status === 'ready' && event && <>
        <div className="dossier-byline"><span className={`status-dot status-${temporalKind(event)}`}>{temporalLabel(event)}</span><span>{displayDate(event.startDate)}</span></div>
        <p className="dossier-location">{displayLocation(event)}</p>
        <div className="dossier-actions"><button className="button button-primary" onClick={() => onCreateConcept(event)}><Sparkles size={15} aria-hidden="true" />Create a gathering inspired by this</button><PublicLink className="button" url={event.url}>Open event page</PublicLink><button className={`button${shortlisted ? ' button-selected' : ''}`} disabled={!shortlisted && !canShortlist} onClick={() => onToggle(event)}>{shortlisted && <Check size={15} aria-hidden="true" />}{shortlisted ? 'In comparison · remove' : 'Compare'}</button></div>
        <p className="muted small">This is a retained research record. Confirm the current date, availability and participation terms on the original page.</p>
        <section className="dossier-section"><h3>What is documented</h3><dl className="compact-facts"><dt>Starts</dt><dd>{displayDate(event.startDate)}</dd><dt>Ends</dt><dd>{event.endDate ? displayDate(event.endDate) : 'Not documented'}</dd><dt>Time zone</dt><dd>{event.timezone || 'Not documented'}</dd><dt>Format</dt><dd>{humanize(event.modality)}</dd><dt>Category</dt><dd>{humanize(event.category)}</dd><dt>Published status</dt><dd>{humanize(event.status)}</dd><dt>Topics</dt><dd>{event.topics.join(', ') || 'Not documented'}</dd></dl><SourceLinks sources={[event.source]} /></section>
        <section className="dossier-section"><h3>Location and precision</h3><dl className="compact-facts"><dt>Location</dt><dd>{displayLocation(event)}</dd><dt>Precision</dt><dd>{humanize(event.location.precision)}</dd><dt>Method</dt><dd>{humanize(event.location.method)}</dd><dt>Coordinates</dt><dd>{event.location.latitude !== null && event.location.longitude !== null ? `${event.location.latitude}, ${event.location.longitude}` : 'Not documented'}</dd></dl><p className="muted small">A city centroid is an area reference, not an event venue. Events without usable coordinates remain in the list.</p><PublicLink className="text-link" url={event.location.sourceUrl}>Location source</PublicLink></section>
        <section className="dossier-section"><div className="section-title"><h3>Organizations and roles</h3><span className="count-label">{event.roles.length}</span></div><p className="muted small">A documented role does not establish a paid agreement, available budget or interest in your event.</p>
          {event.roles.length ? event.roles.map(role => <article className="evidence-item" key={role.id}><h4>{role.name}</h4><p>{humanize(role.role)}{role.level ? ` · ${humanize(role.level)}` : ''}</p><span className="muted small">Record status: {humanize(role.status)}</span><SourceLinks compact sources={[role.source]} /></article>) : <p className="empty-note">No organization roles linked to this edition.</p>}
        </section>
        <section className="dossier-section"><h3>Documented costs</h3><p className="muted small">Ticket prices and sponsorship costs are separate. Missing amounts are unknown, never zero.</p>
          {event.costs.length ? event.costs.map(cost => <article className="evidence-item" key={cost.id}><h4>{humanize(cost.category)}</h4><p>{costText(cost)}</p><span className="muted small">Status: {humanize(cost.status)}</span><SourceLinks compact sources={[cost.source]} /></article>) : <p className="empty-note">No cost records linked. Request an edition-specific quote.</p>}
        </section>
        <section className="dossier-section"><div className="section-title"><h3>Evidence by field</h3><span className="count-label">{event.evidenceTotal}</span></div><p className="muted small">Recorded values and research paraphrases, not verbatim quotations. Open each source to inspect the original.</p>
          {event.evidence.map(record => <details className="evidence-disclosure" key={record.id}><summary><span>{humanize(record.field)}</span>{record.conflictStatus && !['none', 'no_conflict', 'not_detected', 'uncontested'].includes(record.conflictStatus) && <span className="tag tag-amber">{humanize(record.conflictStatus)}</span>}</summary><div className="assertion-content"><p className="assertion-value">{displayValue(record.value)}</p>{record.text && <p><span className="eyebrow">Research paraphrase</span><br />{record.text}</p>}<dl className="compact-facts"><dt>Evidence class</dt><dd>{humanize(record.evidenceClass)}</dd><dt>Observed</dt><dd>{record.observedAt ? displayDate(record.observedAt) : 'Not documented'}</dd>{record.locator && <><dt>Locator</dt><dd>{record.locator}</dd></>}</dl><SourceLinks sources={[record.source]} /></div></details>)}
          {!event.evidence.length && <p className="empty-note">Field-level evidence is not linked in this record.</p>}
          {event.evidenceTotal > event.evidence.length && <p className="muted small">Showing {event.evidence.length} of {event.evidenceTotal} assertions retained in the dataset.</p>}
        </section>
        <section className="dossier-section"><h3>Before you decide</h3>{event.missing.length ? <ul className="missing-list">{event.missing.map(field => <li key={field}>{humanize(field)}</li>)}</ul> : <p className="muted">Core fields are present. Audience fit, permission for your activity and commercial terms still need confirmation.</p>}</section>
        {event.relatedEditions.length > 0 && <section className="dossier-section"><h3>Related editions</h3><p className="muted small">Linked in the source dataset. Prior participation does not confirm participation in another edition.</p>{event.relatedEditions.map(related => <button key={related.id} className="related-event" onClick={() => onOpen(related.id)}><span><strong>{related.title}</strong><span className="muted small">{displayDate(related.startDate)} · {displayLocation(related)}</span></span><ArrowRight size={16} aria-hidden="true" /></button>)}</section>}
        <details className="technical-details"><summary>Record reference</summary><p>{event.id}</p></details>
      </>}
    </div>
  </dialog>;
}
