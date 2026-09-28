'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Map as MapInstance, Marker } from 'maplibre-gl';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import type { TasteOpportunity } from '@/lib/demo/taste-labs';
import 'maplibre-gl/dist/maplibre-gl.css';

type Engine = { map: MapInstance; api: typeof import('maplibre-gl') };
type Props = { events: TasteOpportunity[]; selectedId?: string; onSelect: (id: string) => void; world?: boolean; preview?: boolean };

export function EventCover({ event, className = '' }: { event: TasteOpportunity; className?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className={`tg-cover ${className}`} style={{ backgroundColor: event.color }}>
    {failed ? <span className="tg-cover-fallback">{event.shortTitle}</span> : <img src={event.image} alt="" style={{ objectPosition: event.imagePosition }} onError={() => setFailed(true)} />}
  </div>;
}

function PhotoPin({ engine, event, selected, onSelect, offset = [0, 0], clusterCount }: { engine: Engine; event: TasteOpportunity; selected: boolean; onSelect: Props['onSelect']; offset?: [number, number]; clusterCount?: number }) {
  const [element] = useState(() => document.createElement('div'));
  const markerRef = useRef<Marker | null>(null);
  useEffect(() => {
    const marker = new engine.api.Marker({ element, anchor: 'bottom' }).setLngLat(event.coordinates).addTo(engine.map);
    markerRef.current = marker;
    return () => { marker.remove(); };
  }, [engine, element, event]);
  useEffect(() => { markerRef.current?.setOffset(offset); }, [offset]);
  useEffect(() => {
    const markerElement = markerRef.current?.getElement();
    if (markerElement) markerElement.style.zIndex = selected ? '10' : '2';
  }, [selected]);
  return createPortal(<button className="tg-photo-pin" data-kind={event.kind} aria-pressed={selected} onClick={() => onSelect(event.id)} aria-label={clusterCount ? `Explore ${clusterCount} opportunities in San Francisco` : `Open ${event.title}. ${event.locationNote}`}>
    <EventCover event={event} />
    <span className="tg-pin-name">{clusterCount ? 'San Francisco' : event.shortTitle}</span>
    <span className="tg-pin-corner">{clusterCount ?? ''}</span>
  </button>, element);
}

export function TasteMap({ events, selectedId, onSelect, world = false, preview = false }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [error, setError] = useState(false);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number; offset: [number, number] }>>({});
  const sfEvents = events.filter(event => event.region === 'sf');
  const pins = world ? events.filter(event => event.region === 'world' || event.id === sfEvents[0]?.id) : events;
  useEffect(() => {
    let cancelled = false;
    let map: MapInstance | undefined;
    let resize: ResizeObserver | undefined;
    void import('maplibre-gl').then(api => {
      if (cancelled || !container.current) return;
      api.setWorkerUrl(`/maplibre/${api.getVersion()}/maplibre-gl-worker.mjs`);
      map = new api.Map({ container: container.current, style: 'https://tiles.openfreemap.org/styles/positron', center: [-122.425, 37.795], zoom: 12.55, minZoom: 1, maxZoom: 17, attributionControl: { compact: true }, renderWorldCopies: false });
      map.on('load', () => {
        if (cancelled || !map) return;
        const layers = map.getStyle().layers;
        for (const layer of layers) {
          if (layer.type === 'fill' && layer.id === 'water') map.setPaintProperty(layer.id, 'fill-color', '#c2dce9');
          if (layer.type === 'fill' && /park|landcover_wood|landuse_park/.test(layer.id)) map.setPaintProperty(layer.id, 'fill-color', '#e4e9e7');
        }
        setEngine({ map, api });
      });
      map.on('error', event => { if (!cancelled && /style|WebGL/i.test(event.error.message)) setError(true); });
      resize = new ResizeObserver(() => map?.resize());
      resize.observe(container.current);
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; resize?.disconnect(); map?.remove(); };
  }, []);
  useEffect(() => {
    if (!engine) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (world) engine.map.fitBounds([[-123, 35], [26, 61]], { padding: { top: 110, bottom: 140, left: 90, right: 90 }, duration: reduce ? 0 : 850 });
    else engine.map.easeTo({ center: [-122.425, preview ? 37.791 : 37.7855], zoom: preview ? 12.65 : 12.6, duration: reduce ? 0 : 600 });
  }, [engine, world, preview]);
  useEffect(() => {
    if (!engine) return;
    function arrange() {
      if (!engine) return;
      const rects: { x: number; y: number }[] = [];
      const next: Record<string, { x: number; y: number; offset: [number, number] }> = {};
      const candidates: [number, number][] = [[0, 0], [75, 0], [-75, 0], [0, -90], [0, 90], [75, -90], [-75, -90], [75, 90], [-75, 90]];
      for (const event of pins) {
        const point = engine.map.project(event.coordinates);
        const offset = candidates.find(([dx, dy]) => !rects.some(rect => Math.abs(rect.x - point.x - dx) < 76 && Math.abs(rect.y - point.y - dy) < 89)) ?? [0, 0];
        rects.push({ x: point.x + offset[0], y: point.y + offset[1] });
        next[event.id] = { x: point.x, y: point.y, offset };
      }
      setPositions(next);
    }
    arrange();
    engine.map.on('move', arrange);
    engine.map.on('resize', arrange);
    return () => { engine.map.off('move', arrange); engine.map.off('resize', arrange); };
  // Event identity and geography drive marker placement; screen positions update with the camera.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, events, world]);
  function reset() {
    if (!engine) return;
    if (world) engine.map.fitBounds([[-123, 35], [26, 61]], { padding: 100, duration: 0 });
    else engine.map.easeTo({ center: [-122.425, 37.7855], zoom: 12.6, duration: 0 });
  }
  return <div className={`tg-map ${preview ? 'tg-map-preview' : ''}`}>
    <div className="tg-map-canvas" ref={container} aria-label="Map of event opportunities" />
    <svg className="tg-map-connectors" aria-hidden="true">{Object.entries(positions).filter(([, p]) => p.offset.some(Boolean)).map(([id, p]) => <g key={id}><line x1={p.x} y1={p.y} x2={p.x + p.offset[0]} y2={p.y + p.offset[1] - 4} /><circle cx={p.x} cy={p.y} r="2.5" /></g>)}</svg>
    {engine && pins.map(event => <PhotoPin key={event.id} engine={engine} event={event} selected={event.id === selectedId} onSelect={onSelect} offset={positions[event.id]?.offset} clusterCount={world && event.region === 'sf' ? sfEvents.length : undefined} />)}
    {error && <div className="tg-map-error">The map couldn’t load. All opportunities are available in the list.</div>}
    {!preview && <div className="tg-map-controls"><button aria-label="Zoom in" onClick={() => engine?.map.zoomIn()}><Plus size={17} /></button><button aria-label="Zoom out" onClick={() => engine?.map.zoomOut()}><Minus size={17} /></button><button aria-label="Reset map" onClick={reset}><LocateFixed size={17} /></button></div>}
  </div>;
}
