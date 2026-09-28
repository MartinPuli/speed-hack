/** Keep the prepared demo in its own Cloudflare workspace for this browser session. */
export function workspaceHeaders(): Record<string, string> {
  return typeof window !== 'undefined' && /^\/demo(?:\/|$)/.test(window.location.pathname)
    ? { 'X-GrowthX-Workspace': 'prepared-demo' } : {};
}
