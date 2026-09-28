'use client';
import { useState } from 'react';
import { CalendarDays, MapPin, Copy, Check, Download } from 'lucide-react';
import type { EventPagePreview } from '@/lib/server/workspace/repository';

export function EventPage({ preview, shared = false, backHref = '/' }: { preview: EventPagePreview; shared?: boolean; backHref?: string }) {
  const [copied, setCopied] = useState(false);
  const { fields, brand } = preview;
  const invitation = `${fields.title}\n\n${fields.description}\n\n${fields.date || 'Date to be announced'}\n${fields.location || 'Venue to be announced'}\n\n${fields.agenda}\n\nEvent proposal. Registration is not open.`;
  async function copy() { await navigator.clipboard.writeText(invitation); setCopied(true); }
  function download() { const url = URL.createObjectURL(new Blob([invitation], { type: 'text/plain;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = `${fields.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  const agenda = fields.agenda.split('\n').filter(Boolean);
  return <main className="ep-page">
    <div className="ep-preview-bar"><a href={backHref}>GrowthX</a><span>{shared ? 'Event proposal' : 'Private event preview'}</span><span>Made with Taste</span></div>
    <div className="ep-layout"><aside className="ep-poster-column"><div className="ep-poster">{fields.coverImageUrl ? <img src={fields.coverImageUrl} alt={`Concept artwork for ${fields.title}`}/> : <div className="ep-type-cover"><span>{brand.name}</span><strong>{fields.title}</strong></div>}</div><div className="ep-host">{brand.logoUrl && <img src={brand.logoUrl} alt=""/>}<div><small>Hosted by</small><strong>{fields.host || brand.name}</strong></div></div><p className="ep-art-note">Concept artwork · proposed event</p></aside>
    <article className="ep-main"><header className="ep-heading"><span className="ep-format">{fields.format}</span><h1>{fields.title}</h1><div className="ep-event-facts"><div><CalendarDays size={19}/><span><strong>{fields.date || 'Date to be announced'}</strong><small>{fields.timezone || 'Details are being planned'}</small></span></div><div><MapPin size={19}/><span><strong>{fields.location || 'Venue to be announced'}</strong><small>A place chosen around the experience</small></span></div></div></header>
      <div className="ep-invitation"><span>Join the conversation</span><p>We’re shaping the guest list. Registration opens once the details are confirmed.</p><button onClick={() => void copy().catch(() => setCopied(false))}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'Invitation copied' : 'Copy invitation'}</button></div>
      <section className="ep-section"><h2>About the event</h2>{fields.description.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>
      <section className="ep-section"><h2>Who it’s for</h2><p>{fields.audience}</p></section>
      {fields.experience?.atmosphere && <section className="ep-section"><h2>The experience</h2><p>{fields.experience.atmosphere}</p></section>}
      {agenda.length > 0 && <section className="ep-section"><h2>The evening</h2><ol className="ep-agenda">{agenda.map((line, index) => { const match = line.match(/^(\+?\d{1,2}[:.]\d{2}(?:\s*[–-]\s*\+?\d{1,2}[:.]\d{2})?(?:\s*[ap]m)?|Doors|Welcome)\s*[·:—–-]?\s*(.*)$/i); return <li key={index}>{match ? <><time>{match[1]}</time><p>{match[2]}</p></> : <p>{line}</p>}</li>; })}</ol></section>}
      {!shared && <details className="ep-production"><summary>Production notes · private</summary><p>{fields.productionBrief}</p>{fields.experience?.budgetGuidance && <><h3>Budget</h3><p>{fields.experience.budgetGuidance}</p></>}</details>}
      <button className="ep-download" onClick={download}><Download size={14}/>Download invitation</button>
    </article></div><footer className="ep-footer"><span>{brand.name}</span><span>An event planned with GrowthX</span></footer>
  </main>;
}
