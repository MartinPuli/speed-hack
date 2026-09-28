import { createHash } from 'node:crypto';
import type { CompanyBrand } from '../lib/contracts/company-brand';
import type { EventDraftFields } from '../lib/contracts/agent-workspace';

export function coverPrompt(fields: EventDraftFields, brand: CompanyBrand): string {
  return `Create one distinctive editorial event cover. No text, no logos, no watermarks, no UI mockups. The image must work as a square event profile and a wide cover. Event: ${fields.title}. ${fields.description.slice(0, 350)}. Art direction: ${fields.experience?.artDirection || fields.format}. Atmosphere: ${fields.experience?.atmosphere?.slice(0, 300) || ''}. Brand palette: ${brand.palette.map(color => color.hex).join(', ')}. Tactile materials, considered composition, realistic light. This is concept artwork, not documentary evidence of a real event.`.slice(0, 2048);
}
export async function generateEventCover(storage: DurableObjectStorage, ai: Ai, fields: EventDraftFields, brand: CompanyBrand) {
  const prompt = coverPrompt(fields, brand);
  const id = createHash('sha256').update(prompt).digest('hex').slice(0, 24);
  if (!storage.sql.exec('SELECT id FROM event_cover_chunks WHERE id = ? LIMIT 1', id).toArray().length) {
    const recent = await storage.get<{ count: number; day: string }>('cover-usage');
    const day = new Date().toISOString().slice(0, 10);
    if (recent?.day === day && recent.count >= 6) throw new Error('Six covers have been generated today. Keep the current artwork or try again tomorrow.');
    await storage.put('cover-usage', { day, count: recent?.day === day ? recent.count + 1 : 1 });
    const output = await ai.run('@cf/black-forest-labs/flux-1-schnell', { prompt, steps: 4 });
    if (!output.image || output.image.length > 8_000_000) throw new Error('The cover could not be generated. Try again from the event.');
    const image = output.image;
    storage.transactionSync(() => { for (let offset = 0, part = 0; offset < image.length; offset += 200_000, part++) storage.sql.exec('INSERT OR REPLACE INTO event_cover_chunks(id, part, data) VALUES(?, ?, ?)', id, part, image.slice(offset, offset + 200_000)); });
  }
  return { id, prompt };
}
export function readEventCover(storage: DurableObjectStorage, id: string): Uint8Array | null {
  const rows = storage.sql.exec<{ data: string }>('SELECT data FROM event_cover_chunks WHERE id = ? ORDER BY part', id).toArray();
  if (!rows.length) return null;
  const raw = atob(rows.map(row => row.data).join(''));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
