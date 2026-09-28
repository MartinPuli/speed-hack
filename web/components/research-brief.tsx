'use client';

// Adapted from GrowthX components/atlas/onboarding-intake.tsx. Budget and
// missing information remain explicit; geography and the data source are new.
import type { ResearchBrief } from '@/lib/contracts/event-gtm';
import { ArrowRight, Building2 } from 'lucide-react';
import type { FormEvent } from 'react';

export const EMPTY_BRIEF: ResearchBrief = { company: '', website: '', objective: 'adoption', audience: '', topics: '', geography: '', from: '', to: '', budget: '', currency: 'USD', constraints: '' };

export function ResearchBriefPanel({ brief, onChange, onApply, storageAvailable }: { brief: ResearchBrief; onChange: (brief: ResearchBrief) => void; onApply: () => void; storageAvailable: boolean }) {
  const update = (key: keyof ResearchBrief, value: string) => onChange({ ...brief, [key]: value });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onApply(); }
  return <details className="brief-panel">
    <summary><span className="brief-icon"><Building2 size={19} aria-hidden="true" /></span><span><strong>{brief.company || 'Start with your company brief'}</strong><span className="muted small">{brief.company ? `${brief.audience || 'Audience pending'} · ${brief.topics || 'Topics pending'}` : 'Set the context for your event research.'}</span></span><span className="brief-edit">Edit brief</span></summary>
    <form className="brief-form" onSubmit={submit}>
      <p className="muted small brief-explanation">Apply uses topics, location and dates to filter the catalog. Your objective, audience and budget stay in the brief for your review. Website analysis is not connected yet.</p>
      <div className="form-grid">
        <label>Company or product<input value={brief.company} onChange={event => update('company', event.target.value)} placeholder="What are you building?" autoComplete="organization" /></label>
        <label>Company website <span className="optional">optional</span><input value={brief.website} onChange={event => update('website', event.target.value)} placeholder="https://your-company.com" type="url" /></label>
        <label>Objective<select value={brief.objective} onChange={event => update('objective', event.target.value)}><option value="adoption">Product adoption</option><option value="feedback">Technical feedback</option><option value="awareness">Awareness</option><option value="partnerships">Partnerships</option></select></label>
        <label>Audience<input value={brief.audience} onChange={event => update('audience', event.target.value)} placeholder="Who do you want to reach?" /></label>
        <label>Topics to search<input value={brief.topics} onChange={event => update('topics', event.target.value)} placeholder="e.g. data, AI, developer tools" /><span className="field-hint">Comma-separated topics. Matches any topic.</span></label>
        <label>Country or city<input value={brief.geography} onChange={event => update('geography', event.target.value)} placeholder="Any location" /></label>
        <label>From<input type="date" value={brief.from} max={brief.to || undefined} onChange={event => update('from', event.target.value)} /></label>
        <label>Through<input type="date" value={brief.to} min={brief.from || undefined} onChange={event => update('to', event.target.value)} /></label>
        <label>Participation budget<input type="number" min="0" step="any" value={brief.budget} onChange={event => update('budget', event.target.value)} placeholder="Unknown" /><span className="field-hint">Missing event costs remain unknown.</span></label>
        <label>Currency<input value={brief.currency} onChange={event => update('currency', event.target.value.toUpperCase())} maxLength={3} pattern="[A-Z]{3}" required /></label>
        <label className="form-wide">Constraints or questions<textarea value={brief.constraints} onChange={event => update('constraints', event.target.value)} rows={2} placeholder="What must be true for an event to be useful?" /></label>
      </div>
      <div className="brief-footer"><span className="muted small">{storageAvailable ? 'Saved in this browser. No account required.' : 'Browser storage unavailable. Keep a downloaded copy.'}</span><button className="button button-primary" type="submit">Apply to catalog<ArrowRight size={15} aria-hidden="true" /></button></div>
    </form>
  </details>;
}
