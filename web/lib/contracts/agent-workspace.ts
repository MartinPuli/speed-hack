import type { ResearchBrief } from './event-gtm';

export type WorkspaceAgentRole = 'lead' | 'scout' | 'partnerships' | 'producer';

export type OpportunityState = 'needs_review' | 'planned' | 'active' | 'proposal' | 'historical';
export type AgentRunStatus = 'queued' | 'running' | 'waiting_input' | 'succeeded' | 'failed';
export type AgentTaskStatus = 'queued' | 'running' | 'waiting_input' | 'waiting_approval' | 'succeeded' | 'failed' | 'cancelled';

export interface WorkspaceOpportunity {
  id: string;
  catalogEventId: string | null;
  title: string;
  state: OpportunityState;
  action: 'attend' | 'sponsor' | 'speak' | 'host' | 'research';
  fit: number | null;
  rationale: string;
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentRun {
  id: string;
  status: AgentRunStatus;
  briefVersion: number;
  opportunityId: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTask {
  id: string;
  runId: string;
  opportunityId: string | null;
  assignedRole: WorkspaceAgentRole;
  objective: string;
  status: AgentTaskStatus;
  inputRefs: string[];
  resultRefs: string[];
  result: unknown;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTimelineEvent {
  id: string;
  runId: string;
  opportunityId: string | null;
  role: WorkspaceAgentRole | 'system';
  kind: string;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface EventDraftFields {
  title: string;
  description: string;
  audience: string;
  format: string;
  agenda: string;
  host: string;
  cta: string;
  date: string;
  timezone: string;
  location: string;
  productionBrief: string;
  sourceRefs: string[];
  proposedDetails?: { date: string; time: string; venue: string; capacity: string };
}

export interface EventDraftRecord {
  id: string;
  opportunityId: string;
  version: number;
  fields: EventDraftFields;
  updatedAt: string;
  updatedBy: 'user' | WorkspaceAgentRole;
}

export interface WorkspaceSnapshot {
  workspaceId: string;
  demoMode: true;
  modelConfigured: boolean;
  latestBrief: ResearchBrief | null;
  briefVersion: number;
  opportunities: WorkspaceOpportunity[];
  runs: AgentRun[];
  tasks: AgentTask[];
  events: AgentTimelineEvent[];
  drafts: EventDraftRecord[];
}

export interface StartAgentRunInput {
  opportunityId?: string;
}

export interface StartAgentRunResult {
  run: AgentRun;
  tasks: AgentTask[];
}

export interface InboundReplyInput {
  opportunityId: string;
  messageId: string;
  message: string;
  simulated: true;
}

export interface SaveDraftInput {
  expectedVersion: number;
  fields: EventDraftFields;
}
