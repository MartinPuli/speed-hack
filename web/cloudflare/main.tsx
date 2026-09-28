import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { TasteWorkspace } from '../components/taste/taste-workspace';
import '@fontsource/geist/latin-400.css';
import '@fontsource/geist/latin-500.css';
import '@fontsource/geist/latin-600.css';
import '../app/globals.css';
import '../components/taste/taste-workspace.css';
import '../app/preview/[id]/preview.css';
import type { EventPagePreview } from '../lib/server/workspace/repository';

document.documentElement.style.setProperty('--font-geist', 'Geist');
function Preview({ id }: { id: string }) {
  const [preview, setPreview] = useState<EventPagePreview>();
  const [error, setError] = useState('');
  useEffect(() => { fetch(`/api/previews/${id}?_refresh=${Date.now()}`, { cache: 'no-store' }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setPreview(data); }).catch(error => setError(error.message)); }, [id]);
  if (!preview) return <main style={{ padding: 40 }}>{error || 'Opening your event…'}</main>;
  const { brand, fields } = preview;
  return <main className="ep-page" style={{ '--ep-dark': brand.palette.find(color => /ink|black/i.test(color.name))?.hex ?? '#202128', '--ep-paper': brand.palette.find(color => /white|paper/i.test(color.name))?.hex ?? '#fafafa', '--ep-display': /mono/i.test(brand.displayFont) ? 'ui-monospace, monospace' : 'Geist, sans-serif' } as React.CSSProperties}><div className="ep-preview-bar"><a href="/">GrowthX</a><span>Private event draft</span></div><header className="ep-header">{brand.logoUrl && <img src={brand.logoUrl} alt={brand.name}/>}<span>{fields.format}</span></header><section className="ep-hero"><div className="ep-hero-copy"><span className="ep-label">Proposed for {brand.name}</span><h1>{fields.title}</h1><p>{fields.audience}</p><div className="ep-hero-details"><span>{fields.date || 'Date to confirm'}</span><span>{fields.location || 'Venue to confirm'}</span></div></div><div className="ep-art" aria-hidden="true">{fields.coverImageUrl && <img className="ep-cover-image" src={fields.coverImageUrl} alt="Company artwork selected with Taste"/>}<div className="ep-art-grid">{Array.from({ length: 16 }, (_, index) => <span key={index}/>)}</div>{brand.logoUrl && <img src={brand.logoUrl} alt=""/>}</div></section><section className="ep-content"><article><h2>About the gathering</h2><p>{fields.description}</p>{fields.experience && <><h2>The experience</h2><p>{fields.experience.atmosphere}</p></>}<h2>The plan</h2><div className="ep-agenda">{fields.agenda.split('\n').map((line, index) => <p key={index}>{line}</p>)}</div></article><aside><h2>In the works.</h2><p>{fields.productionBrief}</p><div className="ep-registration">Registration is not open</div></aside></section></main>;
}
const previewId = location.pathname.match(/^\/preview\/([a-f0-9]+)$/)?.[1];
createRoot(document.getElementById('root')!).render(previewId ? <Preview id={previewId}/> : <TasteWorkspace/>);
