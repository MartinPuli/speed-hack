'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, Globe2 } from 'lucide-react';
import type { EventSummary, ResearchBrief } from '@/lib/contracts/event-gtm';
import { EventMap } from './events/event-map';
import { displayDate, displayLocation } from './events/display';

export function Onboarding({ brief, onChange, onComplete, events }: { brief: ResearchBrief; onChange: (brief: ResearchBrief) => void; onComplete: (brief: ResearchBrief) => void; events: EventSummary[] }) {
  const [error, setError] = useState('');
  function submitWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = brief.website.trim();
    try {
      const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      if (!parsed.hostname.includes('.') || parsed.hostname.includes('..')) throw new Error();
      const company = parsed.hostname.replace(/^www\./, '').split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
      const nextBrief = { ...brief, website: parsed.origin, company: brief.company || company };
      onChange(nextBrief);
      onComplete(nextBrief);
    } catch {
      setError(raw ? 'Enter a website like acme.com.' : 'Add your website to open the map.');
    }
  }

  return <main className="onboarding-shell">
    <header className="onboarding-topbar">
      <a className="onboarding-brand" href="/" aria-label="GrowthX home">GrowthX</a>
    </header>
    <div className="onboarding-body">
      <section className="onboarding-copy">
        <div className="onboarding-kicker">YOUR EVENT TEAM</div>
        <h1>Make events<br />work harder.</h1>
        <p className="onboarding-lede">Find events to host. Improve the ones you run. Find the right events to sponsor.</p>
        <form className="site-entry" onSubmit={submitWebsite}>
          <label htmlFor="company-site">Your website</label>
          <div className="site-input-wrap"><Globe2 size={18} /><input id="company-site" type="text" inputMode="url" autoComplete="url" placeholder="yourcompany.com" value={brief.website} onChange={event => { onChange({ ...brief, website: event.target.value }); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'site-error' : 'site-hint'} /><button type="submit"><span>Build my map</span><ArrowRight size={17} /></button></div>
          {error ? <span id="site-error" className="field-error" role="alert">{error}</span> : <span id="site-hint" className="site-hint">Your website is the starting point. Add a goal in the map prompt.</span>}
        </form>
      </section>
      <aside className="onboarding-visual" aria-label="A sample map of public event opportunities">
        <div className="visual-topline"><span>EVENT OPPORTUNITIES</span><span>MAP PREVIEW</span></div>
        <div className="onboarding-map-preview"><EventMap events={events} selectedId={null} onSelect={() => {}} /></div>
        <div className="onboarding-event-preview">
          <div className="preview-heading"><strong>On the map</strong><span>Public event listings</span></div>
          {events.slice(0, 3).map(event => <div className="preview-event" key={event.id}><span className="preview-event-dot" /><div><strong>{event.title}</strong><span>{displayDate(event.startDate)} <i>·</i> {displayLocation(event)}</span></div></div>)}
          {events.length === 0 && <p className="preview-loading">Bringing event locations into view…</p>}
        </div>
      </aside>
    </div>
    <footer className="onboarding-footer"><span>GrowthX <i>·</i> Your event team</span><span> </span></footer>
  </main>;
}
