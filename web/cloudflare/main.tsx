import { EventPage } from '../components/taste/event-page';
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { workspaceHeaders } from '../lib/client/workspace-request';
import { TasteWorkspace } from '../components/taste/taste-workspace';
import '@fontsource/geist/latin-400.css';
import '@fontsource/geist/latin-500.css';
import '@fontsource/geist/latin-600.css';
import '../app/globals.css';
import '../components/taste/taste-workspace.css';
import '../app/preview/[id]/preview.css';
import type { EventPagePreview } from '../lib/server/workspace/repository';

document.documentElement.style.setProperty('--font-geist', 'Geist');
function Preview({ id, shared = false }: { id: string; shared?: boolean }) {
  const [preview, setPreview] = useState<EventPagePreview>();
  const [error, setError] = useState('');
  useEffect(() => { fetch(`${shared ? '/api/shared/' : '/api/previews/'}${id}?_refresh=${Date.now()}`, { cache: 'no-store', headers: workspaceHeaders() }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setPreview(data); }).catch(error => setError(error.message)); }, [id, shared]);
  if (!preview) return <main style={{ padding: 40 }}>{error || 'Opening your event…'}</main>;
  return <EventPage preview={preview} shared={shared} backHref={location.pathname.startsWith('/demo/') ? '/demo' : '/'}/>;
}
const sharedId = location.pathname.match(/^\/share\/([A-Za-z0-9_.-]+)$/)?.[1];
const previewId = location.pathname.match(/^\/(?:demo\/)?preview\/([a-f0-9]+)$/)?.[1];
createRoot(document.getElementById('root')!).render(sharedId ? <Preview id={sharedId} shared/> : previewId ? <Preview id={previewId}/> : <TasteWorkspace preparedDemo={location.pathname === '/demo'}/>);
