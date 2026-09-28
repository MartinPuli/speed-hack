// Adapted from GrowthX lib/evidence/source-link.ts. The catalog does not have
// provider/method/reviewer or fixture hashes: never manufacture those fields.
import type { SourceRecord } from '../contracts/event-gtm.ts';

export type EvidenceLink =
  | { kind: 'public'; href: string }
  | { kind: 'synthetic' | 'invalid' | 'missing'; href: null };

// URL shape permits a link, not a claim that its page has been reverified.
export function evidenceLink(url: string | null, synthetic = false): EvidenceLink {
  if (!url) return { kind: 'missing', href: null };
  if (synthetic) return { kind: 'synthetic', href: null };
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
      return { kind: 'invalid', href: null };
    }
    const host = parsed.hostname.toLowerCase().replace(/\.$/, '');
    if (/(^|\.)(example|invalid|test)$/.test(host) || /(^|\.)example\.(com|net|org)$/.test(host)) {
      return { kind: 'synthetic', href: null };
    }
    return { kind: 'public', href: parsed.href };
  } catch {
    return { kind: 'invalid', href: null };
  }
}

export function sourceLink(source: SourceRecord): EvidenceLink {
  return evidenceLink(source.url);
}

export function sameEvidenceUrl(left: string | null, right: string | null): boolean {
  if (!left || !right) return false;
  const identity = (value: string): string | null => {
    const link = evidenceLink(value);
    if (!link.href) return null;
    const parsed = new URL(link.href);
    parsed.hash = '';
    if (['lu.ma', 'www.lu.ma', 'luma.com', 'www.luma.com'].includes(parsed.hostname)) {
      parsed.hostname = 'lu.ma';
      parsed.search = '';
      parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/';
    }
    return parsed.href;
  };
  const normalized = identity(left);
  return normalized !== null && normalized === identity(right);
}
