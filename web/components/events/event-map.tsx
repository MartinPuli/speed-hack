"use client";

// Adapted from GrowthX components/research-dashboard/sf-event-map.tsx:
// retain MapLibre, versioned workers, portals and cleanup; replace SF/revision
// contracts with published catalog coordinates and a bounded result page.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Expand, MapPinOff, RotateCcw } from 'lucide-react';
import type { Map as StreetMap } from 'maplibre-gl';
import type { EventSummary } from '../../lib/contracts/event-gtm';
import type { WorkspaceOpportunity } from '../../lib/contracts/agent-workspace';
import { evidenceLink } from '../../lib/evidence/source-link';
import { groupEventPoints, type EventPoint } from '../../lib/map/event-points';
import { mapPointForEvent, opportunityForEvent, opportunityStateLabel, opportunityVisualState, type OpportunityVisualState } from './opportunity-state';
import 'maplibre-gl/dist/maplibre-gl.css';
import './event-map.css';

type Engine = { map: StreetMap; api: typeof import('maplibre-gl') };
type PointGroup = ReturnType<typeof groupEventPoints>[number];
type Props = { events: EventSummary[]; opportunities?: WorkspaceOpportunity[]; selectedId: string | null; onSelect: (id: string) => void; onOpen?: (id: string) => void };
const STYLE = 'https://tiles.openfreemap.org/styles/liberty';

function groupVisualState(group: PointGroup, opportunities: WorkspaceOpportunity[]): OpportunityVisualState {
  const states = group.entries.map(point => opportunityVisualState(point.event, opportunityForEvent(point.event.id, opportunities)));
  if (states.includes('active')) return 'active';
  if (states.every(state => state === 'historical')) return 'historical';
  if (states.includes('needs_review') || states.includes('proposed') || states.includes('historical')) return 'needs_review';
  return 'verified';
}

function LocationPin({ engine, group, selectedId, onSelect, visualState }: {
  engine: Engine; group: PointGroup; selectedId: string | null; onSelect: (id: string) => void; visualState: OpportunityVisualState;
}) {
  const [element] = useState(() => document.createElement('div'));
  const [lng, lat] = group.coordinates;
  useEffect(() => {
    const marker = new engine.api.Marker({ element, anchor: 'center' }).setLngLat([lng, lat]).addTo(engine.map);
    return () => { marker.remove(); };
  }, [engine, element, lng, lat]);
  const selected = group.entries.some(point => point.event.id === selectedId);
  const approximate = group.entries.some(point => point.approximate);
  const first = group.entries[0];
  return createPortal(
    <button type="button" className={`event-map-pin state-${visualState}${approximate ? ' approximate' : ''}`} data-opportunity-state={visualState} aria-pressed={selected}
      aria-label={`${group.entries.length > 1 ? `${group.entries.length} events: ` : ''}${first.event.title}. ${opportunityStateLabel(visualState)}. ${first.precisionLabel}`}
      title={`${first.event.title} — ${first.precisionLabel}`}
      data-event-id={first.event.id} data-latitude={lat} data-longitude={lng}
      onClick={() => onSelect(selected ? selectedId! : first.event.id)}>
      {group.entries.length > 1 ? group.entries.length : visualState === 'needs_review' ? '!' : approximate ? '≈' : '•'}
    </button>, element,
  );
}

function EventPopup({ engine, point, group, onSelect, onClose, onOpen, opportunities, visualState }: {
  engine: Engine; point: EventPoint; group: PointGroup; onSelect: (id: string) => void; onClose: () => void; onOpen?: (id: string) => void; opportunities: WorkspaceOpportunity[]; visualState: OpportunityVisualState;
}) {
  const [element] = useState(() => document.createElement('div'));
  const [lng, lat] = point.coordinates;
  useEffect(() => {
    const popup = new engine.api.Popup({ closeButton: false, closeOnClick: false, focusAfterOpen: false, maxWidth: '310px', offset: 23 })
      .setLngLat([lng, lat]).setDOMContent(element).addTo(engine.map);
    return () => { popup.remove(); };
  }, [engine, element, lng, lat]);
  const link = evidenceLink(point.event.url);
  const opportunity = opportunityForEvent(point.event.id, opportunities);
  return createPortal(
    <section className="event-map-popup" aria-label={`Map event: ${point.event.title}`}>
      <button className="event-map-close" type="button" aria-label="Close map popup" onClick={onClose}>×</button>
      <h4>{point.event.title}</h4>
      <p className={`event-map-state-pill state-${visualState}`}><i aria-hidden="true" />{opportunityStateLabel(visualState)}</p>
      <p>{[point.event.startDate, point.event.city, point.event.country].filter(Boolean).join(' · ')}</p>
      <p className="event-map-precision">{point.precisionLabel}</p>
      {opportunity && <p className="event-map-plan-reason"><strong>{opportunity.action} plan · {opportunity.fit === null ? 'Fit pending' : `Fit ${opportunity.fit}/100`}</strong><br />{opportunity.rationale || 'No decision reason has been recorded.'}</p>}
      {group.entries.length > 1 && <div className="event-map-shared">
        <p>{group.entries.length} events share this published location.</p>
        {group.entries.map(other => <button type="button" key={other.event.id} aria-pressed={other.event.id === point.event.id}
          onClick={() => onSelect(other.event.id)}>{other.event.title}</button>)}
      </div>}
      {link.href && <a href={link.href} target="_blank" rel="noreferrer noopener">View event source ↗</a>}
      {onOpen && <button className="event-map-evidence" type="button" onClick={() => onOpen(point.event.id)}>Inspect evidence</button>}
    </section>, element,
  );
}

function MapCanvas({ points, opportunities, selectedId, onSelect, onOpen }: { points: EventPoint[]; opportunities: WorkspaceOpportunity[]; selectedId: string | null; onSelect: Props['onSelect']; onOpen?: Props['onOpen'] }) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onSelect);
  const pointsRef = useRef(points);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [dismissed, setDismissed] = useState<string | null>(null);
  useEffect(() => { callback.current = onSelect; }, [onSelect]);
  useEffect(() => { pointsRef.current = points; }, [points]);

  useEffect(() => {
    let cancelled = false;
    let instance: StreetMap | null = null;
    let resize: ResizeObserver | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const fail = (message: string) => {
      if (!cancelled) { clearTimeout(timer); setStatus('error'); setError(message); }
    };
    void import('maplibre-gl').then(api => {
      if (cancelled || !container.current) return;
      api.setWorkerUrl(`/maplibre/${api.getVersion()}/maplibre-gl-worker.mjs`);
      try {
        const map = new api.Map({
          container: container.current, style: STYLE, center: pointsRef.current[0].coordinates,
          zoom: 4, minZoom: 1, maxZoom: 19, renderWorldCopies: false, attributionControl: false,
        });
        instance = map;
        map.addControl(new api.NavigationControl(), 'top-right');
        map.addControl(new api.ScaleControl({ unit: 'metric' }), 'bottom-left');
        map.addControl(new api.AttributionControl({ compact: false }), 'bottom-right');
        map.getCanvas().setAttribute('aria-label', 'Event map; arrow keys to pan, plus and minus to zoom');
        map.on('load', () => {
          if (!cancelled) { clearTimeout(timer); setStatus(current => current === 'error' ? current : 'ready'); }
        });
        map.on('error', () => fail('Map tiles could not load. All events and sources remain available in the list.'));
        map.on('webglcontextlost', () => fail('The browser lost its map connection. Continue with the list or retry.'));
        resize = new ResizeObserver(() => { if (!cancelled) map.resize(); });
        resize.observe(container.current);
        timer = setTimeout(() => fail('The map did not finish loading. All events remain available in the list.'), 15000);
        setEngine({ map, api });
      } catch {
        fail('This browser could not start WebGL. The event list and sources remain available.');
      }
    }).catch(() => fail('The map viewer is unavailable. The event list and sources remain available.'));
    return () => { cancelled = true; clearTimeout(timer); resize?.disconnect(); instance?.remove(); };
  }, [attempt]);

  const fit = useCallback(() => {
    if (!engine || !points.length) return;
    const bounds = new engine.api.LngLatBounds();
    points.forEach(point => bounds.extend(point.coordinates));
    engine.map.fitBounds(bounds, { padding: 65, maxZoom: points.every(point => point.approximate) ? 7 : 12, duration: 350 });
  }, [engine, points]);
  // A new result page receives its own bounds; no hardcoded city or geocoding.
  useEffect(() => { fit(); }, [fit]);
  useEffect(() => {
    const point = pointsRef.current.find(entry => entry.event.id === selectedId);
    if (engine && point) engine.map.easeTo({
      center: point.coordinates, zoom: point.approximate ? 7 : 12, offset: [0, 80], duration: 350,
    });
  }, [engine, selectedId]);
  const groups = useMemo(() => groupEventPoints(points), [points]);
  const selected = points.find(point => point.event.id === selectedId);
  const selectedGroup = groups.find(group => group.entries.some(point => point.event.id === selectedId));
  const selectedOpportunity = selected ? opportunityForEvent(selected.event.id, opportunities) : null;
  const selectedVisualState = selected ? opportunityVisualState(selected.event, selectedOpportunity) : 'needs_review';
  const select = useCallback((id: string) => { setDismissed(null); callback.current(id); }, []);
  function retry() { setEngine(null); setError(null); setStatus('loading'); setAttempt(value => value + 1); }

  return <div className="event-map-view" data-map-state={status}>
    <div className="event-map-toolbar">
      <span><span aria-hidden="true">●</span> Published point <span aria-hidden="true">≈</span> Approximate city area · not a venue</span>
      <button type="button" disabled={!engine || status === 'error'} onClick={fit}><Expand size={13} aria-hidden="true" /> Fit results</button>
    </div>
    <div className="event-map-frame">
      <div ref={container} className="event-map-canvas" aria-hidden={status === 'error'} />
      {status === 'loading' && <div className="event-map-loading" role="status">Loading map…</div>}
      {error && <div className="event-map-fallback" role="status">
        <MapPinOff size={28} aria-hidden="true" /><strong>Map unavailable</strong><p>{error}</p>
        <button type="button" onClick={retry}><RotateCcw size={14} aria-hidden="true" /> Retry map</button>
      </div>}
    </div>
    {engine && status !== 'error' && groups.map(group => <LocationPin key={group.id} engine={engine} group={group} selectedId={selectedId} onSelect={select} visualState={groupVisualState(group, opportunities)} />)}
    {engine && status !== 'error' && selected && selectedGroup && dismissed !== selectedId && <EventPopup
      key={selectedId} engine={engine} point={selected} group={selectedGroup} onSelect={select} onOpen={onOpen} onClose={() => setDismissed(selectedId)} opportunities={opportunities} visualState={selectedVisualState} />}
  </div>;
}

export function EventMap({ events, opportunities = [], selectedId, onSelect, onOpen }: Props) {
  const page = useMemo(() => events.slice(0, 50), [events]);
  const points = useMemo(() => page.map(mapPointForEvent).filter((point): point is EventPoint => point !== null), [page]);
  const selectedHasPoint = points.some(point => point.event.id === selectedId);
  return <section className="event-map" aria-label="Published event locations" data-map-point-count={points.length}>
    <div className="event-map-state-legend" aria-label="Opportunity state colors">
      <strong>Opportunity status</strong>
      <span className="state-verified"><i aria-hidden="true" />Verified upcoming</span>
      <span className="state-needs_review"><i aria-hidden="true" />Needs review</span>
      <span className="state-proposed"><i aria-hidden="true" />Team concept · list only</span>
      <span className="state-active"><i aria-hidden="true" />Active plan</span>
      <span className="state-historical"><i aria-hidden="true" />Historical</span>
    </div>
    {points.length > 0 ? <MapCanvas points={points} opportunities={opportunities} selectedId={selectedId} onSelect={onSelect} onOpen={onOpen} /> : <div className="event-map-empty" role="status">
      <MapPinOff size={30} strokeWidth={1.4} aria-hidden="true" />
      <h3>No published coordinates in this view</h3>
      <p>{page.length ? 'These events have no usable published point. Explore their location details and evidence in the list.' : 'Choose a search with mapped events to explore their locations.'}</p>
    </div>}
    <p className="event-map-count">{points.length} of {page.length} events mapped · {page.length - points.length} remain in the list, including online and unlocated events</p>
    {selectedId && !selectedHasPoint && page.some(event => event.id === selectedId) && <p className="event-map-note">The selected event has no published point. Its details remain available in the list.</p>}
    <p className="event-map-note">City centroids are approximate areas, never event venues. Online events stay in the list. Proposed concepts have no catalog coordinates, so they do not receive map markers.</p>
  </section>;
}
