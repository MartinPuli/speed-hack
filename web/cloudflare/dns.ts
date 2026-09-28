import { isIP } from 'node:net';
export async function lookup(hostname: string, _options?: unknown) {
  if (isIP(hostname)) return [{ address: hostname, family: isIP(hostname) }];
  const result = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`, { headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(8000) });
  const data = await result.json() as { Answer?: { data: string; type: number }[] };
  const addresses = (data.Answer ?? []).filter(answer => answer.type === 1 && isIP(answer.data)).map(answer => ({ address: answer.data, family: 4 }));
  if (!addresses.length) throw new Error('The official source host could not be resolved.');
  return addresses;
}
