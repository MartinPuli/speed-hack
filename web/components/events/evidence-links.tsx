// Adapted from GrowthX components/atlas/evidence-links.tsx: source date,
// provenance and unresolved references are preserved; legacy DTOs are removed.
import type { SourceRecord } from '@/lib/contracts/event-gtm';
import { evidenceLink } from '@/lib/evidence/source-link';
import { ArrowUpRight } from 'lucide-react';
import { displayDate, humanize } from './display';

export function PublicLink({ url, children, className }: { url: string | null; children: React.ReactNode; className?: string }) {
  const link = evidenceLink(url);
  return link.href ? <a href={link.href} target="_blank" rel="noreferrer" className={className}>{children}<ArrowUpRight size={13} aria-hidden="true" /></a> : null;
}

export function SourceLinks({ sources, compact = false }: { sources: Array<SourceRecord | null>; compact?: boolean }) {
  const unique = sources.filter((source): source is SourceRecord => source !== null).filter((source, index, all) => all.findIndex(item => item.id === source.id) === index);
  if (!unique.length) return <p className="muted small">Supporting source not linked in this record.</p>;
  return <div className="source-records">{unique.map(source => {
    const link = evidenceLink(source.url);
    return <div className={`source-record${compact ? ' source-compact' : ''}`} key={source.id}>
      {link.href ? <a href={link.href} target="_blank" rel="noreferrer">{source.title || source.publisher || 'View original source'}<ArrowUpRight size={13} aria-hidden="true" /></a> : <span>{source.title || source.publisher || 'Source'} · link unavailable</span>}
      {!compact && <><span className="muted small">{source.publisher ? `${source.publisher} · ` : ''}Obtained {source.observedAt ? displayDate(source.observedAt) : 'on an undocumented date'}</span>
        <details className="source-metadata"><summary>Source metadata</summary><dl className="compact-facts"><dt>Reference</dt><dd>{source.id}</dd><dt>Reuse status</dt><dd>{humanize(source.reuseStatus)}</dd>{source.url && <><dt>URL</dt><dd>{source.url}</dd></>}</dl></details></>}
    </div>;
  })}</div>;
}
