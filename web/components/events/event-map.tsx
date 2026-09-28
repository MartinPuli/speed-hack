"use client";

// Adapted from GrowthX components/research-dashboard/sf-event-map.tsx:
// retain MapLibre, versioned workers, portals and cleanup; replace SF/revision
// contracts with published catalog coordinates and a bounded result page.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Expand, MapPinOff, RotateCcw } from 'lucide-react';
import type { Map as StreetMap } from 'maplibre-gl';
import type { EventSummary } from '../../lib/contracts/event-gtm';
import { evidenceLink } from '../../lib/evidence/source-link';
import { eventPoint, groupEventPoints, type EventPoint } from '../../lib/map/event-points';
import 'maplibre-gl/dist/maplibre-gl.css';
import './event-map.css';

type Engine = { map: StreetMap; api: typeof import('maplibre-gl') };
type PointGroup = ReturnType<typeof groupEventPoints>[number];
type Props = { events: EventSummary[]; selectedId: string | null; onSelect: (id: string) => void; onOpen?: (id: string) => void };
const STYLE = 'https://tiles.openfreemap.org/styles/liberty';

function LocationPin({ engine, group, selectedId, onSelect }: {
  engine: Engine; group: PointGroup; selectedId: string | null; onSelect: (id: string) => void;
}) {
  const [element] = useState(() => document.createElement('div'));
  const [lng, lat] = group.coordinates;
  useEffect(() => {
    const marker = new engine.api.Marker({ element, anchor: 'center' }).setLngLat([lng, lat]).addTo(engine.map);
    return () => { marker.remove(); };
  }, [engine, element, lng, lat]);
  const selected = group.entries.some(point => point.event.id === selectedId);
  const approximate = group.entries.every(point => point.approximate);
  const first = group.entries[0];
  return createPortal(
    <button type="button" className={`event-map-pin${approximate ? ' approximate' : ''}`} aria-pressed={selected}
      aria-label={`${group.entries.length > 1 ? `${group.entries.length} events: ` : ''}${first.event.title}. ${first.precisionLabel}`}
      title={`${first.event.title} — ${first.precisionLabel}`}
      data-event-id={first.event.id} data-latitude={lat} data-longitude={lng}
      onClick={() => onSelect(selected ? selectedId! : first.event.id)}>
      {group.entries.length > 1 ? group.entries.length : approximate ? '≈' : '•'}
    </button>, element,
  );
}

function EventPopup({ engine, point, group, onSelect, onClose, onOpen }: {
  engine: Engine; point: EventPoint; group: PointGroup; onSelect: (id: string) => void; onClose: () => void; onOpen?: (id: string) => void;
}) {
  const [element] = useState(() => document.createElement('div'));
  const [lng, lat] = point.coordinates;
  useEffect(() => {
    const popup = new engine.api.Popup({ closeButton: false, closeOnClick: false, focusAfterOpen: false, maxWidth: '310px', offset: 23 })
      .setLngLat([lng, lat]).setDOMContent(element).addTo(engine.map);
    return () => { popup.remove(); };
  }, [engine, element, lng, lat]);
  const link = evidenceLink(point.event.url);
  return createPortal(
    <section className="event-map-popup" aria-label={`Map event: ${point.event.title}`}>
      <button className="event-map-close" type="button" aria-label="Close map popup" onClick={onClose}>×</button>
      <h4>{point.event.title}</h4>
      <p>{[point.event.startDate, point.event.city, point.event.country].filter(Boolean).join(' · ')}</p>
      <p className="event-map-precision">{point.precisionLabel}</p>
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

function MapCanvas({ points, selectedId, onSelect, onOpen }: { points: EventPoint[]; selectedId: string | null; onSelect: Props['onSelect']; onOpen?: Props['onOpen'] }) {
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
  const select = useCallback((id: string) => { setDismissed(null); callback.current(id); }, []);
  function retry() { setEngine(null); setError(null); setStatus('loading'); setAttempt(value => value + 1); }

  return <div className="event-map-view" data-map-state={status}>
    <div className="event-map-toolbar">
      <span><span aria-hidden="true">●</span> Published point <span aria-hidden="true">≈</span> City area</span>
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
    {engine && status !== 'error' && groups.map(group => <LocationPin key={group.id} engine={engine} group={group} selectedId={selectedId} onSelect={select} />)}
    {engine && status !== 'error' && selected && selectedGroup && dismissed !== selectedId && <EventPopup
      key={selectedId} engine={engine} point={selected} group={selectedGroup} onSelect={select} onOpen={onOpen} onClose={() => setDismissed(selectedId)} />}
  </div>;
}

export function EventMap({ events, selectedId, onSelect, onOpen }: Props) {
  const page = useMemo(() => events.slice(0, 50), [events]);
  const points = useMemo(() => page.map(eventPoint).filter((point): point is EventPoint => point !== null), [page]);
  const selectedHasPoint = points.some(point => point.event.id === selectedId);
  return <section className="event-map" aria-label="Published event locations" data-map-point-count={points.length}>
    {points.length > 0 ? <MapCanvas points={points} selectedId={selectedId} onSelect={onSelect} onOpen={onOpen} /> : <div className="event-map-empty" role="status">
      <MapPinOff size={30} strokeWidth={1.4} aria-hidden="true" />
      <h3>No published coordinates in this view</h3>
      <p>{page.length ? 'These events have no usable published point. Explore their location details and evidence in the list.' : 'Choose a search with mapped events to explore their locations.'}</p>
    </div>}
    <p className="event-map-count">{points.length} of {page.length} events mapped · {page.length - points.length} without a published point</p>
    {selectedId && !selectedHasPoint && page.some(event => event.id === selectedId) && <p className="event-map-note">The selected event has no published point. Its details remain available in the list.</p>}
    <p className="event-map-note">City markers show approximate areas. A point does not confirm a venue, availability or attendance.</p>
  </section>;
}
