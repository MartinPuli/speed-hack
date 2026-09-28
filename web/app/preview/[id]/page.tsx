import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getDemoWorkspaceForRequest } from '@/lib/server/workspace/session';
import { readEventPreview } from '@/lib/server/workspace/repository';
import './preview.css';
export const dynamic = 'force-dynamic';
export default async function EventPreview({ params }: { params: Promise<{ id: string }> }) {
  const workspace = await getDemoWorkspaceForRequest();
  if (!workspace) notFound();
  const { id } = await params;
  const preview = readEventPreview(workspace, id);
  if (!preview) notFound();
  const { fields, brand } = preview;
  const dark = brand.palette.find(color => /ink|black/i.test(color.name))?.hex ?? '#252525';
  const paper = brand.palette.find(color => /white|paper/i.test(color.name))?.hex ?? '#f7f7f5';
  const style = { '--ep-dark': dark, '--ep-paper': paper, '--ep-display': /mono/i.test(brand.displayFont) ? 'ui-monospace, SFMono-Regular, monospace' : 'var(--font-geist), sans-serif' } as CSSProperties;
  return <main className="ep-page" style={style}>
    <div className="ep-preview-bar"><Link href="/">GrowthX</Link><span>Private preview · not published</span></div>
    <header className="ep-header">{brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} /> : <span>{brand.name}</span>}<span>{fields.format}</span></header>
    <section className="ep-hero"><div className="ep-hero-copy"><span className="ep-label">An event by {brand.name} · proposed</span><h1>{fields.title}</h1><p>{fields.audience}</p><div className="ep-hero-details"><span>{fields.date || 'Date to be confirmed'}</span><span>{fields.location || 'Venue to be confirmed'}</span></div></div><div className="ep-art" aria-hidden="true"><div className="ep-art-grid">{Array.from({ length: 16 }, (_, i) => <span key={i} />)}</div>{brand.logoUrl && <img src={brand.logoUrl} alt="" />}<span>A room for<br />good ideas.</span></div></section>
    <section className="ep-content"><article><h2>About the gathering</h2><p>{fields.description}</p>{fields.agenda && <><h2>The plan</h2><div className="ep-agenda">{fields.agenda.split('\n').filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}</div></>}</article><aside><span className="ep-label">Your invitation, soon</span><h2>Be in the room.</h2><p>{fields.audience}</p><div className="ep-registration">Registration is not open</div><small>Date, venue and host participation need confirmation before this event is published.</small></aside></section>
    <footer className="ep-footer"><span>Brand direction from Taste</span><span>Extracted {brand.extractedAt ? new Date(brand.extractedAt).toLocaleDateString('en-US') : 'from the company website'}</span></footer>
  </main>;
}
