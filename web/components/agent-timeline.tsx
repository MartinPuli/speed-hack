'use client';

import { Activity, AlertCircle, Bot, Check, Clock3, LoaderCircle } from 'lucide-react';
import type { AgentTask, AgentTimelineEvent, EventDraftFields, WorkspaceAgentRole } from '@/lib/contracts/agent-workspace';

type TimelineEntry =
  | { id: string; at: string; type: 'task'; task: AgentTask }
  | { id: string; at: string; type: 'event'; event: AgentTimelineEvent };

export function displayAgentRole(role: WorkspaceAgentRole | 'system' | 'user'): string {
  return role === 'lead' ? 'Lead + Strategist' : role === 'scout' ? 'Scout' : role === 'partnerships' ? 'Partnerships' : role === 'producer' ? 'Producer' : role === 'user' ? 'You' : 'Workspace';
}

export function displayAgentStatus(status: string): string {
  return status.replaceAll('_', ' ');
}

export function formatAgentDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Just now' : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function sortedActivity(tasks: AgentTask[], events: AgentTimelineEvent[]): TimelineEntry[] {
  return [
    ...tasks.map(task => ({ id: `task:${task.id}`, at: task.updatedAt || task.createdAt, type: 'task' as const, task })),
    ...events.map(event => ({ id: `event:${event.id}`, at: event.createdAt, type: 'event' as const, event })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

export function AgentTimeline({ tasks, events }: { tasks: AgentTask[]; events: AgentTimelineEvent[] }) {
  return <ol className="agent-timeline">{sortedActivity(tasks, events).map(entry => entry.type === 'task'
    ? <TaskEntry key={entry.id} task={entry.task} />
    : <EventEntry key={entry.id} event={entry.event} />)}</ol>;
}

function TaskEntry({ task }: { task: AgentTask }) {
  return <li className={`agent-activity-row status-${task.status}`}>
    <span className="agent-timeline-node task-node" aria-hidden="true"><Bot size={13} /></span>
    <div className="agent-activity-body"><div className="agent-activity-top"><span className={`agent-role-label role-${task.assignedRole}`}>{displayAgentRole(task.assignedRole)}</span><StatusBadge status={task.status} /></div><p>{task.objective}</p><div className="agent-activity-meta"><time dateTime={task.updatedAt}>{formatAgentDate(task.updatedAt || task.createdAt)}</time>{task.attempts > 1 && <span>{task.attempts} attempts</span>}</div></div>
  </li>;
}

function EventEntry({ event }: { event: AgentTimelineEvent }) {
  const proposal = event.kind === 'draft.revision_conflict' ? readProposal(event.metadata.proposal) : null;
  const failure = event.kind === 'task.failed' && typeof event.metadata.error === 'string' ? event.metadata.error.slice(0, 500) : null;
  return <li className={`agent-activity-row event-kind-${event.kind}`}>
    <span className={`agent-timeline-node event-node role-${event.role}`} aria-hidden="true"><Activity size={12} /></span>
    <div className="agent-activity-body"><div className="agent-activity-top"><span className={`agent-role-label role-${event.role}`}>{displayAgentRole(event.role)}</span><span className="agent-event-kind">{displayAgentStatus(event.kind)}</span></div><p>{event.message}</p>{failure && <p className="agent-failure-detail">Reason: {failure}</p>}{event.kind === 'draft.revision_conflict' && <ProposalPreview proposal={proposal} />}<div className="agent-activity-meta"><time dateTime={event.createdAt}>{formatAgentDate(event.createdAt)}</time></div></div>
  </li>;
}

function readProposal(value: unknown): Partial<EventDraftFields> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const fields = value as Record<string, unknown>;
  const proposal: Partial<EventDraftFields> = {};
  for (const key of ['title', 'description', 'audience', 'format', 'agenda', 'productionBrief'] as const) {
    if (typeof fields[key] === 'string') proposal[key] = fields[key];
  }
  return Object.keys(proposal).length ? proposal : null;
}

function ProposalPreview({ proposal }: { proposal: Partial<EventDraftFields> | null }) {
  return <details className="agent-revision-proposal">
    <summary>Proposal for review <span>Read only</span></summary>
    <p className="agent-proposal-note">The human-edited draft is unchanged. Review this proposed revision before deciding what to keep.</p>
    {proposal ? <dl>{([
      ['Title', proposal.title],
      ['Description', proposal.description],
      ['Audience', proposal.audience],
      ['Format', proposal.format],
      ['Agenda', proposal.agenda],
      ['Private production brief', proposal.productionBrief],
    ] as const).filter(([, value]) => typeof value === 'string' && value.length > 0).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p className="agent-proposal-note">Proposal details are unavailable in this event record.</p>}
  </details>;
}

function StatusBadge({ status }: { status: string }) {
  const icon = status === 'succeeded' ? <Check size={11} aria-hidden="true" /> : status === 'running' ? <LoaderCircle size={11} className="agent-spin" aria-hidden="true" /> : status === 'failed' ? <AlertCircle size={11} aria-hidden="true" /> : <Clock3 size={11} aria-hidden="true" />;
  return <span className={`agent-status-badge status-${status}`}>{icon}{displayAgentStatus(status)}</span>;
}
