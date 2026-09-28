'use client';
import { Plus, Check, ChevronDown } from 'lucide-react';
import { CITY_CENTERS, type TeamBrief, type EventPreferences } from '@/lib/contracts/event-brief';
import type { CompanyBrand } from '@/lib/contracts/company-brand';

export function BriefForm({ brief, onChange, onSubmit, brand, busy }: { brief: TeamBrief; onChange: (brief: TeamBrief) => void; onSubmit: () => void; brand: CompanyBrand | null; busy: boolean }) {
  const extra = (key: keyof EventPreferences, value: string) => onChange({ ...brief, preferences: { ...brief.preferences, [key]: value } });
  return <form className="tg-setup-form" onSubmit={event => { event.preventDefault(); onSubmit(); }}>
    {brand && <details className="tg-brand-summary"><summary>{brand.logoUrl && <img src={brand.logoUrl} alt=""/>}<span>{brand.name || brief.website}<small>{brand.status === 'pending' ? 'Taste is reading your brand…' : 'Brand profile'}</small></span><ChevronDown size={14}/></summary><p>{brand.analysis?.summary || brand.signature || 'Your website will inform the event direction.'}</p>{brand.analysis?.eventStrategy && <p>{brand.analysis.eventStrategy}</p>}{brand.audience.length > 0 && <button type="button" className="tg-text-button" onClick={() => onChange({ ...brief, audience: brand.audience.join('; ').slice(0, 500) })}>Use suggested audience</button>}</details>}
    <fieldset className="tg-goal-fieldset"><legend>What should your events do?</legend><div className="tg-goals">{['Product adoption', 'Partnerships', 'Community'].map(goal => <button key={goal} type="button" aria-pressed={brief.goal === goal} onClick={() => onChange({ ...brief, goal })}>{goal}</button>)}</div></fieldset>
    <label>Who’s in the room?<input value={brief.audience} maxLength={800} placeholder="Founders, design engineers, your next customers…" onChange={e => onChange({ ...brief, audience: e.target.value })} required/></label>
    <div className="tg-form-pair"><label>Where<select value={brief.city} onChange={e => onChange({ ...brief, city: e.target.value })}>{Object.keys(CITY_CENTERS).map(city => <option key={city}>{city}</option>)}</select></label><label>Budget · USD<input type="number" min="100" max="10000000" step="100" value={brief.budget} onChange={e => onChange({ ...brief, budget: e.target.value })} required/></label></div>
    <details className="tg-more-options"><summary><Plus size={15}/><span>More details</span><small>Optional</small></summary><div className="tg-extra-fields">
      <div className="tg-form-pair"><label>From<input type="date" value={brief.from} onChange={e => onChange({ ...brief, from: e.target.value })} required/></label><label>Until<input type="date" min={brief.from} value={brief.to} onChange={e => onChange({ ...brief, to: e.target.value })} required/></label></div>
      <label>Your company, in a sentence<textarea rows={2} maxLength={800} value={brief.preferences.companyDescription ?? ''} placeholder="What you build and why it matters" onChange={e => extra('companyDescription', e.target.value)}/></label>
      <div className="tg-form-pair"><label>Ideal group size<input type="number" min="2" max="10000" value={brief.preferences.guestCount ?? ''} placeholder="e.g. 30" onChange={e => extra('guestCount', e.target.value)}/></label><label>Preferred format<input maxLength={200} value={brief.preferences.formats ?? ''} placeholder="Dinner, workshop…" onChange={e => extra('formats', e.target.value)}/></label></div>
      <label>What would make it a success?<input maxLength={500} value={brief.preferences.successMetric ?? ''} placeholder="10 qualified demos, new partners, honest feedback…" onChange={e => extra('successMetric', e.target.value)}/></label>
      <label>Events you already run<textarea rows={2} maxLength={800} value={brief.preferences.existingEvents ?? ''} placeholder="Add links and what you’d like to improve" onChange={e => extra('existingEvents', e.target.value)}/></label>
      <label>Partners or sponsors you have in mind<input maxLength={500} value={brief.preferences.partners ?? ''} placeholder="Names, communities or companies" onChange={e => extra('partners', e.target.value)}/></label>
      <label>The atmosphere<input maxLength={500} value={brief.preferences.atmosphere ?? ''} placeholder="Intimate, hands-on, surprising…" onChange={e => extra('atmosphere', e.target.value)}/></label>
      <label>Access & dietary needs<input maxLength={500} value={brief.preferences.accessibility ?? ''} placeholder="Step-free access, quiet spaces, food preferences…" onChange={e => extra('accessibility', e.target.value)}/></label>
      <label>Anything else?<textarea rows={3} maxLength={800} value={brief.preferences.notes ?? ''} placeholder="Must-haves, things to avoid, a launch coming up…" onChange={e => extra('notes', e.target.value)}/></label>
      <p className="tg-form-hint"><Check size={12}/>All of this goes into your team’s brief.</p>
    </div></details>
    <button className="tg-primary tg-full" disabled={busy} type="submit">{busy ? 'Opening your plan…' : 'Create my event plan'}</button>
  </form>;
}
