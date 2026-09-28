'use client';

import type { WorkspaceSnapshot } from '@/lib/contracts/agent-workspace';
import type { CompanyBrand } from '@/lib/contracts/company-brand';

const roles = [
  { id: 'lead', name: 'Noa', description: 'Event direction', color: '#7168b5' },
  { id: 'scout', name: 'Atlas', description: 'Events & places', color: '#4386a7' },
  { id: 'partnerships', name: 'June', description: 'Partners & sponsors', color: '#c28e45' },
  { id: 'producer', name: 'Ari', description: 'The experience, with Taste', color: '#c16e83' },
];
export function TeamActivity({ workspace, brand, onRetry }: { workspace: WorkspaceSnapshot | null; brand: CompanyBrand | null; onRetry: () => void }) {
  const latestRun = workspace?.runs[0];
  const tasks = workspace?.tasks.filter(task => task.runId === latestRun?.id) ?? [];
  const events = workspace?.events.filter(event => event.runId === latestRun?.id) ?? [];
  return <div className="tg-team-panel">
    <span className="tg-overline">Your team</span><h2>Behind your next event.</h2>
    <p className="tg-team-intro">Your AI team. Ideas, research, partnerships and production.</p>
    <div className="tg-agent-grid">{roles.map(role => {
      const task = tasks.find(item => item.assignedRole === role.id);
      const result = task?.result as { outcome?: { summary?: string } } | null;
      const state = task?.status ?? 'ready';
      const thread = events.findLast(event => event.role === role.id && event.kind === 'brainbase.started');
      return <section className="tg-agent" key={role.id} data-status={state}>
        <div><span className="tg-agent-avatar" style={{ background: role.color }}>{role.name[0]}</span><span><strong>{role.name}</strong><small>{role.description}</small></span><i className={`tg-agent-state tg-agent-state-${state}`}>{state === 'succeeded' ? 'Done' : state === 'running' ? 'Working' : state === 'queued' ? 'Up next' : state === 'ready' ? 'Ready' : state.replaceAll('_', ' ')}</i></div>
        {task && <p>{result?.outcome?.summary ?? task.objective}</p>}
        {typeof thread?.metadata.threadId === 'string' && <details><summary>Brainbase session</summary><code>{thread.metadata.threadId}</code></details>}
      </section>;
    })}</div>
    <div className="tg-connections"><span><i/>Brainbase {workspace?.modelConfigured ? 'connected' : 'unavailable'}</span><span><i data-pending={brand?.status !== 'completed'}/>Taste {brand?.status === 'completed' ? 'brand ready' : brand?.status === 'pending' ? 'reading brand' : 'waiting for website'}</span></div>
    {latestRun?.status === 'failed' && <div className="tg-team-error"><p>{latestRun.error || 'A task could not finish.'}</p><button className="tg-primary" onClick={onRetry}>Try again</button></div>}
    {events.length > 0 && <div className="tg-team-timeline"><h3>Activity</h3>{events.slice(-12).reverse().map(event => <div key={event.id}><time>{new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time><p>{event.message}</p></div>)}</div>}
  </div>;
}
