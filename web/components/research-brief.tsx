'use client';

// Adapted from GrowthX components/atlas/onboarding-intake.tsx. Budget and
// missing information remain explicit; geography and the data source are new.
import type { ResearchBrief } from '@/lib/contracts/event-gtm';
import { ArrowRight, Globe2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export const EMPTY_BRIEF: ResearchBrief = { company: '', website: '', objective: 'adoption', audience: '', topics: '', geography: '', from: '', to: '', budget: '', currency: 'USD', constraints: '' };

export function ResearchBriefPanel({ brief, onChange, onApply, storageAvailable }: { brief: ResearchBrief; onChange: (brief: ResearchBrief) => void; onApply: () => void; storageAvailable: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const update = (key: keyof ResearchBrief, value: string) => onChange({ ...brief, [key]: value });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onApply(); }
  return <details className="brief-panel" open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
    <summary><span className="brief-icon"><Globe2 size={19} aria-hidden="true" /></span><span><strong>{brief.company || 'Start with your website'}</strong><span className="muted small">{brief.company ? `${brief.audience || 'Tell us your audience'} · ${brief.geography || 'Anywhere'}` : 'A little context makes every opportunity more useful.'}</span></span><span className="brief-edit">{brief.company ? 'Edit profile' : 'About your company'}</span></summary>
    <form className="brief-form" onSubmit={submit}>
      <p className="muted small brief-explanation">Give your team a starting point. Website extraction is being built; for now, confirm the company and audience yourself. Topic and date filters use the research catalog.</p>
      <div className="form-grid">
        <label>Company website<input value={brief.website} onChange={event => update('website', event.target.value)} placeholder="https://your-company.com" type="url" /></label>
        <label>Company name<input value={brief.company} onChange={event => update('company', event.target.value)} placeholder="What are you building?" autoComplete="organization" /></label>
        <label>Your goal<select value={brief.objective} onChange={event => update('objective', event.target.value)}><option value="adoption">Meet potential customers</option><option value="feedback">Get product feedback</option><option value="awareness">Build community</option><option value="partnerships">Find partners</option></select></label>
        <label>Who should be in the room?<input value={brief.audience} onChange={event => update('audience', event.target.value)} placeholder="e.g. AI infrastructure founders" /></label>
        <label>Topics<input value={brief.topics} onChange={event => update('topics', event.target.value)} placeholder="e.g. AI, developer tools" /><span className="field-hint">Used to find documented events.</span></label>
        <label>Where?<input value={brief.geography} onChange={event => update('geography', event.target.value)} placeholder="City or country" /></label>
        <label>Approximate budget<input type="number" min="0" step="any" value={brief.budget} onChange={event => update('budget', event.target.value)} placeholder="Optional" /></label>
        <label>Currency<input value={brief.currency} onChange={event => update('currency', event.target.value.toUpperCase())} maxLength={3} pattern="[A-Z]{3}" required /></label>
      </div>
      <details className="brief-more"><summary>Dates and other constraints</summary><div className="form-grid"><label>From<input type="date" value={brief.from} max={brief.to || undefined} onChange={event => update('from', event.target.value)} /></label><label>Through<input type="date" value={brief.to} min={brief.from || undefined} onChange={event => update('to', event.target.value)} /></label><label className="form-wide">Anything else?<textarea value={brief.constraints} onChange={event => update('constraints', event.target.value)} rows={2} placeholder="What must be true for an event to be useful?" /></label></div></details>
      <div className="brief-footer"><span className="muted small">{storageAvailable ? 'Saved on this device. Account sync is not connected yet.' : 'Browser storage unavailable. Keep a downloaded copy.'}</span><button className="button button-primary" type="submit">Explore opportunities<ArrowRight size={15} aria-hidden="true" /></button></div>
    </form>
  </details>;
}
