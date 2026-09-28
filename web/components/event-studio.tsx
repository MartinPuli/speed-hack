'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Copy, Sparkles, X } from 'lucide-react';
import type { EventSummary, ResearchBrief } from '@/lib/contracts/event-gtm';
import { displayDate, displayLocation } from './events/display';

type Draft = { title: string; description: string; agenda: string; audience: string; cta: string; date: string; location: string };
const KEY = 'event-gtm:event-studio:v1';

function initialDraft(brief: ResearchBrief, source: EventSummary | null): Draft {
  const topic = brief.topics.split(',')[0]?.trim() || 'the next big ideas in your space';
  const audience = brief.audience.trim() || 'people building in this space';
  const city = source?.city || brief.geography.trim() || 'Location to be decided';
  const company = brief.company.trim() || 'Our team';
  return {
    title: `${topic.replace(/^./, letter => letter.toUpperCase())} After Hours`,
    description: `Join ${company} for a focused gathering of ${audience} in ${city}. We’ll share what we’re learning, meet people working on similar problems, and make room for conversations that continue after the event. This is a proposed event; details will be confirmed by the host.`,
    agenda: '6:00 PM · Doors and introductions\n6:30 PM · Short opening conversation\n7:00 PM · Small-group discussion\n8:00 PM · Open networking',
    audience,
    cta: 'Request a spot',
    date: '',
    location: city,
  };
}

export function EventStudio({ brief, source, onClose }: { brief: ResearchBrief; source: EventSummary | null; onClose: () => void }) {
  const identity = `${brief.website || brief.company}:${source?.id || 'own'}`;
  const [draft, setDraft] = useState<Draft>(() => initialDraft(brief, source));
  const [copied, setCopied] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      let next = initialDraft(brief, source);
      try {
        const saved = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, Partial<Draft>>;
        if (saved[identity]) next = { ...next, ...saved[identity] };
      } catch { setStorageAvailable(false); }
      setDraft(next);
    });
    return () => { cancelled = true; };
  }, [identity, brief, source]);

  function change(field: keyof Draft, value: string) {
    const next = { ...draft, [field]: value };
    setDraft(next); setCopied(false);
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, Draft>;
      localStorage.setItem(KEY, JSON.stringify({ ...saved, [identity]: next }));
      setStorageAvailable(true);
    } catch { setStorageAvailable(false); }
  }

  async function copy() {
    const lines = [draft.title, '', draft.description, '', `Audience: ${draft.audience}`, `Date: ${draft.date || 'To be confirmed'}`, `Location: ${draft.location || 'To be confirmed'}`, '', 'Proposed agenda:', draft.agenda, '', `CTA: ${draft.cta}`];
    try { await navigator.clipboard.writeText(lines.join('\n')); setCopied(true); }
    catch { setCopied(false); }
  }

  return <div className="studio-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="studio-shell" role="dialog" aria-modal="true" aria-labelledby="studio-title">
      <header className="studio-topbar"><button className="studio-back" onClick={onClose}><ArrowLeft size={16} />Back to opportunities</button><span>EVENT STUDIO <span className="studio-topbar-dot">·</span> LOCAL DRAFT</span><button className="icon-button" onClick={onClose} aria-label="Close event studio"><X size={18} /></button></header>
      <div className="studio-intro"><div><span className="eyebrow">A room worth creating</span><h2 id="studio-title">Make the gathering your company needs.</h2><p>Start with a considered first draft. Confirm the details before publishing anywhere.</p></div><button className="button button-primary" onClick={copy}><Copy size={15} />{copied ? 'Copied for Luma' : 'Copy for Luma'}</button></div>
      <div className="studio-grid">
        <div className="studio-preview" aria-label="Event page preview">
          <div className="studio-art"><span className="studio-art-orbit studio-art-orbit-one" /><span className="studio-art-orbit studio-art-orbit-two" /><div><span>{brief.company || 'YOUR COMPANY'}</span><strong>Good things<br />happen in<br />the room.</strong></div></div>
          <div className="studio-event"><span className="eyebrow">PROPOSED EVENT · NOT YET PUBLISHED</span><h3>{draft.title || 'Untitled gathering'}</h3><div className="studio-event-meta"><span>{draft.date ? displayDate(draft.date) : 'Date to be confirmed'}</span><span>{draft.location || 'Location to be confirmed'}</span></div><p>{draft.description}</p><h4>Who it’s for</h4><p>{draft.audience}</p><h4>The evening</h4><p className="studio-agenda">{draft.agenda}</p><span className="studio-preview-cta">{draft.cta || 'Request a spot'}</span><p className="studio-preview-footnote">Preview only. No event has been created or published on Luma.</p></div>
        </div>
        <div className="studio-editor"><div className="studio-editor-heading"><Sparkles size={18} /><div><h3>Shape the event</h3><p>{storageAvailable ? 'Edits autosave in this browser.' : 'Browser storage unavailable; copy your draft before leaving.'}</p></div></div>
          {source && <div className="studio-inspiration"><span className="eyebrow">INSPIRED BY A REAL OPPORTUNITY</span><strong>{source.title}</strong><span>{displayDate(source.startDate)} · {displayLocation(source)}</span><p>Its date and location do not confirm your proposed event. Verify any side-event connection with the organizer.</p>{source.url && <a href={source.url} target="_blank" rel="noopener noreferrer">Open source event ↗</a>}</div>}
          <label>Event title<input value={draft.title} onChange={event => change('title', event.target.value)} maxLength={100} /></label>
          <label>Invitation<textarea value={draft.description} onChange={event => change('description', event.target.value)} rows={6} maxLength={1200} /></label>
          <label>Audience<input value={draft.audience} onChange={event => change('audience', event.target.value)} /></label>
          <div className="studio-editor-pair"><label>Proposed date<input type="date" value={draft.date} onChange={event => change('date', event.target.value)} /></label><label>City or venue<input value={draft.location} onChange={event => change('location', event.target.value)} placeholder="To be confirmed" /></label></div>
          <label>Agenda<textarea value={draft.agenda} onChange={event => change('agenda', event.target.value)} rows={5} /></label>
          <label>Call to action<input value={draft.cta} onChange={event => change('cta', event.target.value)} /></label>
          <div className="studio-handoff"><Check size={17} /><p><strong>Ready for a human review.</strong> The Luma copy is prepared. Host, time zone, venue, capacity and registration settings still need confirmation before an event can be created.</p></div>
        </div>
      </div>
    </section>
  </div>;
}
