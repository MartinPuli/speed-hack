import { database as db, transaction as withTransaction } from '@growthx/storage';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { ResearchBrief } from '@/lib/contracts/event-gtm';
import type {
  AgentRun,
  AgentTask,
  AgentTimelineEvent,
  AgentTaskStatus,
  EventDraftFields,
  EventDraftRecord,
  InboundReplyInput,
  OpportunityState,
  WorkspaceAgentRole,
  WorkspaceOpportunity,
  WorkspaceSnapshot,
} from '@/lib/contracts/agent-workspace';
import type { CompanyBrand, EventDesignBrief } from '@/lib/contracts/company-brand';

const DEMO_WORKSPACE_ID = 'demo-workspace';
const MAX_TASK_ATTEMPTS = 4;
const MAX_TASKS_PER_RUN = 50;
const DEFAULT_LEASE_MS = 60_000;
const SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000;

export interface DemoSession {
  token: string;
  workspaceId: string;
  expiresAt: string;
}

export interface CreateTaskInput {
  runId: string;
  opportunityId?: string | null;
  assignedRole: WorkspaceAgentRole;
  objective: string;
  inputRefs?: string[];
  idempotencyKey?: string;
}

export interface ClaimedTask extends AgentTask {
  resumed?: boolean;
  workspaceId: string;
  leaseOwner: string;
  leaseUntil: string;
  run: AgentRun;
  brief: ResearchBrief | null;
  briefVersion: number;
  opportunity: WorkspaceOpportunity | null;
  opportunities: WorkspaceOpportunity[];
  runTasks: AgentTask[];
  runEvents: AgentTimelineEvent[];
  draft: EventDraftRecord | null;
}

export interface CreateRunInput {
  briefVersion?: number;
  opportunityId?: string | null;
  idempotencyKey?: string;
  objective?: string;
  initialRole?: WorkspaceAgentRole;
}

export interface CreateOpportunityInput {
  catalogEventId?: string | null;
  title: string;
  state?: OpportunityState;
  action?: WorkspaceOpportunity['action'];
  fit?: number | null;
  rationale?: string;
  evidenceIds?: string[];
}

export type OpportunityPatch = Partial<Pick<WorkspaceOpportunity,
  'catalogEventId' | 'title' | 'state' | 'action' | 'fit' | 'rationale' | 'evidenceIds'>>;

export interface TimelineEventInput {
  runId?: string | null;
  opportunityId?: string | null;
  role: WorkspaceAgentRole | 'system';
  kind: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface RunPatch {
  status?: AgentRun['status'];
  error?: string | null;
  opportunityId?: string | null;
}

export interface DraftRevisionInput {
  opportunityId: string;
  expectedVersion?: number;
  fields: EventDraftFields;
  updatedBy: 'user' | WorkspaceAgentRole;
}

export interface CompleteAgentTaskInput {
  workspaceId: string;
  taskId: string;
  workerId: string;
  expectedBriefVersion: number;
  result: unknown;
  resultRefs?: string[];
  events?: TimelineEventInput[];
  opportunityCreates?: CreateOpportunityInput[];
  opportunityUpdate?: { opportunityId: string; patch: OpportunityPatch };
  draftRevision?: DraftRevisionInput;
  nextTasks?: Array<Omit<CreateTaskInput, 'runId'> & { opportunityCreateIndex?: number }>;
  runStatus?: AgentRun['status'];
}

export class WorkspaceVersionConflict extends Error {
  readonly code = 'VERSION_CONFLICT';
  constructor(message = 'The record changed since it was loaded.') { super(message); }
}

export class WorkspaceNotFound extends Error {
  readonly code = 'NOT_FOUND';
  constructor(message = 'Workspace record was not found.') { super(message); }
}

function now(): string { return new Date().toISOString(); }
function id(prefix: string): string { return `${prefix}_${randomUUID()}`; }
function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}
function hashToken(token: string): string { return createHash('sha256').update(token).digest('hex'); }
function row<T>(value: unknown): T | undefined { return value as T | undefined; }
function rows<T>(value: unknown): T[] { return value as T[]; }
function requireWorkspace(workspaceId: string): void {
  const found = db().prepare('SELECT 1 FROM workspaces WHERE id = ? AND demo_mode = 1').get(workspaceId);
  if (!found) throw new WorkspaceNotFound('Demo workspace was not found.');
}
function assertText(value: string, field: string, max: number): void {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > max) {
    throw new TypeError(`${field} must be a non-empty string of at most ${max} characters.`);
  }
}

function mapRun(record: Record<string, unknown>): AgentRun {
  return {
    id: String(record.id), status: record.status as AgentRun['status'],
    briefVersion: Number(record.brief_version), opportunityId: record.opportunity_id == null ? null : String(record.opportunity_id),
    error: record.error == null ? null : String(record.error), createdAt: String(record.created_at), updatedAt: String(record.updated_at),
  };
}
function mapTask(record: Record<string, unknown>): AgentTask {
  return {
    id: String(record.id), runId: String(record.run_id), opportunityId: record.opportunity_id == null ? null : String(record.opportunity_id),
    assignedRole: record.assigned_role as WorkspaceAgentRole, objective: String(record.objective), status: record.status as AgentTaskStatus,
    inputRefs: parseJson(record.input_refs_json, [] as string[]), resultRefs: parseJson(record.result_refs_json, [] as string[]),
    result: parseJson(record.result_json, null), attempts: Number(record.attempts), createdAt: String(record.created_at), updatedAt: String(record.updated_at),
  };
}
function mapOpportunity(record: Record<string, unknown>): WorkspaceOpportunity {
  return {
    id: String(record.id), catalogEventId: record.catalog_event_id == null ? null : String(record.catalog_event_id),
    title: String(record.title), state: record.state as OpportunityState, action: record.action as WorkspaceOpportunity['action'],
    fit: record.fit == null ? null : Number(record.fit), rationale: String(record.rationale),
    evidenceIds: parseJson(record.evidence_ids_json, [] as string[]), createdAt: String(record.created_at), updatedAt: String(record.updated_at),
  };
}
function mapEvent(record: Record<string, unknown>): AgentTimelineEvent {
  return {
    id: String(record.id), runId: String(record.run_id),
    opportunityId: record.opportunity_id == null ? null : String(record.opportunity_id), role: record.role as AgentTimelineEvent['role'],
    kind: String(record.kind), message: String(record.message), metadata: parseJson(record.metadata_json, {} as Record<string, unknown>), createdAt: String(record.created_at),
  };
}
function mapDraft(record: Record<string, unknown>): EventDraftRecord {
  return {
    id: String(record.id), opportunityId: String(record.opportunity_id), version: Number(record.version),
    fields: parseJson(record.fields_json, {} as EventDraftFields), updatedAt: String(record.updated_at), updatedBy: record.updated_by as EventDraftRecord['updatedBy'],
  };
}

function insertEvent(workspaceId: string, input: TimelineEventInput, defaultRunId?: string): AgentTimelineEvent {
  assertText(input.kind, 'kind', 80); assertText(input.message, 'message', 2000);
  const runId = input.runId ?? defaultRunId;
  if (!runId) throw new TypeError('Timeline events must belong to a run.');
  if (!db().prepare('SELECT 1 FROM runs WHERE id = ? AND workspace_id = ?').get(runId, workspaceId)) throw new WorkspaceNotFound('Event run was not found in this workspace.');
  if (input.opportunityId && !db().prepare('SELECT 1 FROM opportunities WHERE id = ? AND workspace_id = ?').get(input.opportunityId, workspaceId)) {
    throw new WorkspaceNotFound('Event opportunity was not found in this workspace.');
  }
  const metadataJson = JSON.stringify(input.metadata ?? {});
  if (metadataJson.length > 60_000) throw new TypeError('Timeline event metadata is too large.');
  const eventId = id('evt'); const createdAt = now();
  db().prepare(`INSERT INTO timeline_events(id, workspace_id, run_id, opportunity_id, role, kind, message, metadata_json, created_at)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(eventId, workspaceId, runId, input.opportunityId ?? null, input.role, input.kind, input.message,
      metadataJson, createdAt);
  return {
    id: eventId, runId, opportunityId: input.opportunityId ?? null, role: input.role,
    kind: input.kind, message: input.message, metadata: input.metadata ?? {}, createdAt,
  };
}

function insertTask(workspaceId: string, input: CreateTaskInput): AgentTask {
  assertText(input.runId, 'runId', 100); assertText(input.objective, 'objective', 2000);
  if (!(['lead', 'scout', 'partnerships', 'producer'] as string[]).includes(input.assignedRole)) throw new TypeError('Invalid task role.');
  const run = row<{ id: string }>(db().prepare('SELECT id FROM runs WHERE id = ? AND workspace_id = ?').get(input.runId, workspaceId));
  if (!run) throw new WorkspaceNotFound('Run was not found in this workspace.');
  if (input.opportunityId && !db().prepare('SELECT 1 FROM opportunities WHERE id = ? AND workspace_id = ?').get(input.opportunityId, workspaceId)) {
    throw new WorkspaceNotFound('Opportunity was not found in this workspace.');
  }
  if (input.idempotencyKey) {
    assertText(input.idempotencyKey, 'idempotencyKey', 200);
    const existing = row<Record<string, unknown>>(db().prepare('SELECT * FROM tasks WHERE workspace_id = ? AND idempotency_key = ?').get(workspaceId, input.idempotencyKey));
    if (existing) return mapTask(existing);
  }
  const taskCount = row<{ total: number }>(db().prepare('SELECT COUNT(*) AS total FROM tasks WHERE workspace_id = ? AND run_id = ?').get(workspaceId, input.runId));
  if ((taskCount?.total ?? 0) >= MAX_TASKS_PER_RUN) throw new TypeError('Run reached its task limit.');
  const taskId = id('task'); const createdAt = now(); const inputRefs = input.inputRefs ?? [];
  if (inputRefs.length > 40) throw new TypeError('A task may contain at most 40 input references.');
  if (inputRefs.some((ref) => typeof ref !== 'string' || ref.length > 500)) throw new TypeError('Task references must be strings of at most 500 characters.');
  db().prepare(`INSERT INTO tasks(id, workspace_id, run_id, opportunity_id, assigned_role, objective, status, input_refs_json, idempotency_key, created_at, updated_at)
    VALUES(?, ?, ?, ?, ?, ?, 'queued', ?, ?, ?, ?)`)
    .run(taskId, workspaceId, input.runId, input.opportunityId ?? null, input.assignedRole, input.objective, JSON.stringify(inputRefs), input.idempotencyKey ?? null, createdAt, createdAt);
  const created = row<Record<string, unknown>>(db().prepare('SELECT * FROM tasks WHERE id = ?').get(taskId));
  return mapTask(created!);
}

function insertOpportunity(workspaceId: string, input: CreateOpportunityInput): WorkspaceOpportunity {
  assertText(input.title, 'title', 240);
  if (input.state && !(['needs_review', 'planned', 'active', 'proposal', 'historical'] as string[]).includes(input.state)) throw new TypeError('Invalid opportunity state.');
  if (input.action && !(['attend', 'sponsor', 'speak', 'host', 'research'] as string[]).includes(input.action)) throw new TypeError('Invalid opportunity action.');
  const evidenceIds = input.evidenceIds ?? [];
  if (evidenceIds.length > 40 || evidenceIds.some((item) => typeof item !== 'string' || item.length > 500)) throw new TypeError('Opportunity evidence references are invalid.');
  if ((input.rationale ?? '').length > 2_000) throw new TypeError('Opportunity rationale is too long.');
  if (input.fit != null && !Number.isFinite(input.fit)) throw new TypeError('Opportunity fit must be finite.');
  const opportunityId = id('opp'); const timestamp = now();
  db().prepare(`INSERT INTO opportunities(id, workspace_id, catalog_event_id, title, state, action, fit, rationale, evidence_ids_json, created_at, updated_at)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(opportunityId, workspaceId, input.catalogEventId ?? null, input.title, input.state ?? 'needs_review', input.action ?? 'research',
      input.fit ?? null, input.rationale ?? '', JSON.stringify(evidenceIds), timestamp, timestamp);
  return getOpportunity(workspaceId, opportunityId);
}

function getOpportunity(workspaceId: string, opportunityId: string): WorkspaceOpportunity {
  const record = row<Record<string, unknown>>(db().prepare('SELECT * FROM opportunities WHERE workspace_id = ? AND id = ?').get(workspaceId, opportunityId));
  if (!record) throw new WorkspaceNotFound('Opportunity was not found in this workspace.');
  return mapOpportunity(record);
}

function insertDraft(workspaceId: string, opportunityId: string, fields: EventDraftFields, updatedBy: EventDraftRecord['updatedBy'], expectedVersion?: number): EventDraftRecord {
  getOpportunity(workspaceId, opportunityId);
  validateDraftFields(fields);
  const existing = row<Record<string, unknown>>(db().prepare('SELECT * FROM drafts WHERE workspace_id = ? AND opportunity_id = ? ORDER BY version DESC LIMIT 1').get(workspaceId, opportunityId));
  if (existing && expectedVersion == null) throw new WorkspaceVersionConflict('A draft already exists; provide its expected version.');
  const currentVersion = existing ? Number(existing.version) : 0;
  if (expectedVersion != null && expectedVersion !== currentVersion) throw new WorkspaceVersionConflict();
  const draftId = existing ? String(existing.id) : id('draft'); const version = currentVersion + 1; const timestamp = now();
  db().prepare(`INSERT INTO drafts(id, workspace_id, opportunity_id, version, fields_json, updated_by, created_at, updated_at)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(draftId, workspaceId, opportunityId, version, JSON.stringify(fields), updatedBy, existing ? String(existing.created_at) : timestamp, timestamp);
  const created = row<Record<string, unknown>>(db().prepare('SELECT * FROM drafts WHERE id = ? AND version = ?').get(draftId, version));
  return mapDraft(created!);
}

function validateDraftFields(fields: EventDraftFields): void {
  const stringFields: Array<keyof EventDraftFields> = ['title', 'description', 'audience', 'format', 'agenda', 'host', 'cta', 'date', 'timezone', 'location', 'productionBrief'];
  for (const field of stringFields) {
    const value = fields[field];
    if (typeof value !== 'string' || value.length > 5_000) throw new TypeError(`Draft field ${field} must be a string of at most 5000 characters.`);
  }
  if (!Array.isArray(fields.sourceRefs) || fields.sourceRefs.length > 40 || fields.sourceRefs.some((ref) => typeof ref !== 'string' || ref.length > 500)) {
    throw new TypeError('Draft source references are invalid.');
  }
  if (fields.experience && (typeof fields.experience !== 'object' || Object.values(fields.experience).some(value => typeof value !== 'string' || value.length > 2000))) throw new TypeError('Event experience sections must be concise text.');
  if (fields.coverImageUrl && !/^https:\/\/[^\s]+$/.test(fields.coverImageUrl)) throw new TypeError('The cover image must use HTTPS.');
  if (JSON.stringify(fields).length > 45_000) throw new TypeError('Draft revision is too large.');
}

export function getDemoWorkspaceId(): string {
  const database = db();
  database.prepare(`INSERT OR IGNORE INTO workspaces(id, demo_mode, created_at) VALUES(?, 1, ?)`).run(DEMO_WORKSPACE_ID, now());
  return DEMO_WORKSPACE_ID;
}

export function createDemoSession(): DemoSession {
  const workspaceId = getDemoWorkspaceId(); const token = Buffer.from(randomBytes(32)).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS).toISOString();
  db().prepare('DELETE FROM demo_sessions WHERE expires_at <= ?').run(now());
  db().prepare('INSERT INTO demo_sessions(token_hash, workspace_id, expires_at, created_at) VALUES(?, ?, ?, ?)')
    .run(hashToken(token), workspaceId, expiresAt, now());
  return { token, workspaceId, expiresAt };
}

export function resolveDemoWorkspaceId(sessionToken: string): string | null {
  if (typeof sessionToken !== 'string' || sessionToken.length < 32 || sessionToken.length > 128) return null;
  const record = row<{ workspace_id: string; expires_at: string }>(db().prepare('SELECT workspace_id, expires_at FROM demo_sessions WHERE token_hash = ?').get(hashToken(sessionToken)));
  if (!record || record.expires_at <= now()) return null;
  return record.workspace_id;
}

export function saveBrief(workspaceId: string, brief: ResearchBrief, expectedVersion?: number): { version: number; savedAt: string } {
  requireWorkspace(workspaceId);
  const briefFields: Array<keyof ResearchBrief> = ['company', 'website', 'objective', 'audience', 'topics', 'geography', 'from', 'to', 'budget', 'currency', 'constraints'];
  if (!briefFields.every((field) => typeof brief[field] === 'string' && brief[field].length <= 2_000)
    || !(['adoption', 'feedback', 'awareness', 'partnerships'] as string[]).includes(brief.objective)) {
    throw new TypeError('Brief fields are invalid.');
  }
  const serial = JSON.stringify(brief);
  if (serial.length > 24_000) throw new TypeError('Brief is too large.');
  return withTransaction(() => {
    const latest = row<{ version: number }>(db().prepare('SELECT version FROM brief_versions WHERE workspace_id = ? ORDER BY version DESC LIMIT 1').get(workspaceId));
    const currentVersion = latest?.version ?? 0;
    if (expectedVersion != null && expectedVersion !== currentVersion) throw new WorkspaceVersionConflict('Brief version changed.');
    const version = currentVersion + 1; const savedAt = now();
    db().prepare('INSERT INTO brief_versions(workspace_id, version, data_json, created_at) VALUES(?, ?, ?, ?)').run(workspaceId, version, serial, savedAt);
    return { version, savedAt };
  });
}

export function readWorkspaceSnapshot(workspaceId: string): WorkspaceSnapshot {
  requireWorkspace(workspaceId);
  const database = db();
  const brief = row<{ version: number; data_json: string }>(database.prepare('SELECT version, data_json FROM brief_versions WHERE workspace_id = ? ORDER BY version DESC LIMIT 1').get(workspaceId));
  const opportunityRows = rows<Record<string, unknown>>(database.prepare('SELECT * FROM opportunities WHERE workspace_id = ? ORDER BY updated_at DESC').all(workspaceId));
  const runRows = rows<Record<string, unknown>>(database.prepare('SELECT * FROM runs WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 100').all(workspaceId));
  const taskRows = rows<Record<string, unknown>>(database.prepare('SELECT * FROM tasks WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 250').all(workspaceId));
  const eventRows = rows<Record<string, unknown>>(database.prepare('SELECT * FROM timeline_events WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 500').all(workspaceId)).reverse();
  const draftRows = rows<Record<string, unknown>>(database.prepare(`SELECT d.* FROM drafts d
    JOIN (SELECT opportunity_id, MAX(version) AS version FROM drafts WHERE workspace_id = ? GROUP BY opportunity_id) latest
    ON latest.opportunity_id = d.opportunity_id AND latest.version = d.version WHERE d.workspace_id = ? ORDER BY d.updated_at DESC`).all(workspaceId, workspaceId));
  return {
    workspaceId, demoMode: true,
    modelConfigured: Boolean(process.env.BRAINBASE_API_KEY?.trim() || (process.env.ANTHROPIC_API_KEY?.trim() && process.env.ANTHROPIC_WORKSPACE_ID?.trim() && process.env.ANTHROPIC_MODEL?.trim())),
    latestBrief: brief ? parseJson(brief.data_json, null as ResearchBrief | null) : null,
    briefVersion: brief?.version ?? 0,
    opportunities: opportunityRows.map(mapOpportunity), runs: runRows.map(mapRun), tasks: taskRows.map(mapTask),
    events: eventRows.map(mapEvent), drafts: draftRows.map(mapDraft),
  };
}

export function createRun(workspaceId: string, input: CreateRunInput): { run: AgentRun; tasks: AgentTask[] } {
  requireWorkspace(workspaceId);
  return withTransaction(() => {
    const brief = row<{ version: number }>(db().prepare('SELECT version FROM brief_versions WHERE workspace_id = ? ORDER BY version DESC LIMIT 1').get(workspaceId));
    if (!brief) throw new WorkspaceVersionConflict('Save a brief before starting a run.');
    const briefVersion = input.briefVersion ?? brief.version;
    if (briefVersion !== brief.version) throw new WorkspaceVersionConflict('Run must start from the latest brief.');
    const key = input.idempotencyKey ?? id('run-request');
    assertText(key, 'idempotencyKey', 200);
    const existing = row<Record<string, string | number | null>>(db().prepare('SELECT * FROM runs WHERE workspace_id = ? AND idempotency_key = ?').get(workspaceId, key));
    if (existing) {
      const taskRows = rows<Record<string, unknown>>(db().prepare('SELECT * FROM tasks WHERE workspace_id = ? AND run_id = ? ORDER BY created_at').all(workspaceId, existing.id));
      return { run: mapRun(existing), tasks: taskRows.map(mapTask) };
    }
    if (input.opportunityId) getOpportunity(workspaceId, input.opportunityId);
    const runId = id('run'); const createdAt = now();
    db().prepare(`INSERT INTO runs(id, workspace_id, status, brief_version, opportunity_id, idempotency_key, created_at, updated_at)
      VALUES(?, ?, 'queued', ?, ?, ?, ?, ?)`)
      .run(runId, workspaceId, briefVersion, input.opportunityId ?? null, key, createdAt, createdAt);
    const task = insertTask(workspaceId, {
      runId, opportunityId: input.opportunityId ?? null, assignedRole: input.initialRole ?? 'lead',
      objective: input.objective ?? 'Review the confirmed brief, research relevant opportunities, and choose the next useful action.',
      inputRefs: [`brief:${briefVersion}`], idempotencyKey: `initial:${key}`,
    });
    insertEvent(workspaceId, { runId, opportunityId: input.opportunityId ?? null, role: 'system', kind: 'run.created', message: 'Agent run queued from the latest brief.', metadata: { briefVersion, simulated: false } });
    const record = row<Record<string, unknown>>(db().prepare('SELECT * FROM runs WHERE id = ?').get(runId));
    return { run: mapRun(record!), tasks: [task] };
  });
}

export function updateRun(workspaceId: string, runId: string, patch: RunPatch): AgentRun {
  requireWorkspace(workspaceId);
  const existing = row<Record<string, string | number | null>>(db().prepare('SELECT * FROM runs WHERE id = ? AND workspace_id = ?').get(runId, workspaceId));
  if (!existing) throw new WorkspaceNotFound('Run was not found in this workspace.');
  if (patch.opportunityId) getOpportunity(workspaceId, patch.opportunityId);
  db().prepare('UPDATE runs SET status = ?, error = ?, opportunity_id = ?, updated_at = ? WHERE id = ? AND workspace_id = ?')
    .run(patch.status ?? existing.status, patch.error === undefined ? existing.error : patch.error,
      patch.opportunityId === undefined ? existing.opportunity_id : patch.opportunityId, now(), runId, workspaceId);
  const updated = row<Record<string, unknown>>(db().prepare('SELECT * FROM runs WHERE id = ?').get(runId));
  return mapRun(updated!);
}

export function retryFailedRun(workspaceId: string, runId: string): AgentRun {
  return withTransaction(() => {
    const snapshot = readWorkspaceSnapshot(workspaceId);
    const run = snapshot.runs.find(item => item.id === runId);
    if (!run) throw new WorkspaceNotFound('This run is unavailable.');
    if (run.status !== 'failed' || snapshot.runs.some(item => ['queued', 'running'].includes(item.status))) throw new WorkspaceVersionConflict('Wait for the current plan to finish.');
    if (run.briefVersion !== snapshot.briefVersion) throw new WorkspaceVersionConflict('Your brief changed. Start a new plan with the updated details.');
    if (snapshot.events.filter(event => event.runId === runId && event.kind === 'run.resumed').length >= 3) throw new WorkspaceVersionConflict('This plan could not finish after three retries. Start a new request.');
    db().prepare(`UPDATE tasks SET status = 'queued', lease_owner = NULL, lease_until = NULL, attempts = 0, updated_at = ? WHERE workspace_id = ? AND run_id = ? AND status IN ('failed', 'cancelled')`).run(now(), workspaceId, runId);
    insertEvent(workspaceId, { runId, role: 'system', kind: 'run.resumed', message: 'Continuing the unfinished work. Completed results are preserved.', metadata: {} });
    return updateRun(workspaceId, runId, { status: 'queued', error: null });
  });
}

export function createTask(workspaceId: string, input: CreateTaskInput): AgentTask {
  requireWorkspace(workspaceId);
  return withTransaction(() => insertTask(workspaceId, input));
}

export function claimNextTask(workerId: string, leaseMs = DEFAULT_LEASE_MS, resumeOwned = false): ClaimedTask | null {
  assertText(workerId, 'workerId', 160);
  const boundedLeaseMs = Math.min(Math.max(leaseMs, 5_000), 30 * 60_000);
  return withTransaction(() => {
    const database = db(); const timestamp = now();
    const expired = rows<{ id: string; workspace_id: string; run_id: string; attempts: number }>(database.prepare(`SELECT id, workspace_id, run_id, attempts FROM tasks
      WHERE status = 'running' AND lease_until <= ? ORDER BY lease_until LIMIT 100`).all(timestamp));
    for (const task of expired) {
      if (task.attempts >= MAX_TASK_ATTEMPTS) {
        database.prepare(`UPDATE tasks SET status = 'failed', lease_owner = NULL, lease_until = NULL, updated_at = ? WHERE id = ?`).run(timestamp, task.id);
        database.prepare(`UPDATE runs SET status = 'failed', error = 'Task lease expired after maximum attempts.', updated_at = ? WHERE id = ? AND workspace_id = ?`).run(timestamp, task.run_id, task.workspace_id);
        insertEvent(task.workspace_id, { runId: task.run_id, role: 'system', kind: 'task.lease_expired', message: 'A task failed after its worker reservation expired repeatedly.', metadata: { taskId: task.id } });
      } else {
        database.prepare(`UPDATE tasks SET status = 'queued', lease_owner = NULL, lease_until = NULL, updated_at = ? WHERE id = ?`).run(timestamp, task.id);
      }
    }
    const queued = row<{ id: string; workspace_id: string; run_id: string; status: string }>(database.prepare(`SELECT id, workspace_id, run_id, status FROM tasks WHERE status = 'queued' OR (? = 1 AND status = 'running' AND lease_owner = ?) ORDER BY created_at LIMIT 1`).get(resumeOwned ? 1 : 0, workerId));
    if (!queued) return null;
    const leaseUntil = new Date(Date.now() + boundedLeaseMs).toISOString();
    const changed = database.prepare(`UPDATE tasks SET status = 'running', lease_owner = ?, lease_until = ?, attempts = attempts + ?, updated_at = ? WHERE id = ? AND (status = 'queued' OR (status = 'running' AND lease_owner = ?))`)
      .run(workerId, leaseUntil, queued.status === 'running' ? 0 : 1, timestamp, queued.id, workerId);
    if (Number(changed.changes) !== 1) return null;
    database.prepare(`UPDATE runs SET status = 'running', updated_at = ? WHERE id = ? AND workspace_id = ? AND status IN ('queued', 'running')`).run(timestamp, queued.run_id, queued.workspace_id);
    const claimedRecord = row<Record<string, unknown>>(database.prepare('SELECT * FROM tasks WHERE id = ?').get(queued.id));
    insertEvent(queued.workspace_id, { runId: queued.run_id, opportunityId: claimedRecord?.opportunity_id == null ? null : String(claimedRecord.opportunity_id), role: 'system', kind: 'task.started', message: 'A worker claimed this task.', metadata: { taskId: queued.id, workerId, attempt: Number(claimedRecord?.attempts ?? 1), leaseUntil } });
    const record = row<Record<string, unknown>>(database.prepare('SELECT * FROM tasks WHERE id = ?').get(queued.id));
    const claimedTask = mapTask(record!);
    const runRecord = row<Record<string, unknown>>(database.prepare('SELECT * FROM runs WHERE id = ?').get(queued.run_id));
    const briefRecord = row<{ version: number; data_json: string }>(database.prepare('SELECT version, data_json FROM brief_versions WHERE workspace_id = ? ORDER BY version DESC LIMIT 1').get(queued.workspace_id));
    const opportunityRows = rows<Record<string, unknown>>(database.prepare('SELECT * FROM opportunities WHERE workspace_id = ? ORDER BY updated_at DESC LIMIT 50').all(queued.workspace_id));
    const taskRows = rows<Record<string, unknown>>(database.prepare('SELECT * FROM tasks WHERE workspace_id = ? AND run_id = ? ORDER BY created_at LIMIT 100').all(queued.workspace_id, queued.run_id));
    const eventRows = rows<Record<string, unknown>>(database.prepare('SELECT * FROM timeline_events WHERE workspace_id = ? AND run_id = ? ORDER BY created_at DESC LIMIT 200').all(queued.workspace_id, queued.run_id)).reverse();
    const draftRecord = claimedTask.opportunityId ? row<Record<string, unknown>>(database.prepare('SELECT * FROM drafts WHERE workspace_id = ? AND opportunity_id = ? ORDER BY version DESC LIMIT 1').get(queued.workspace_id, claimedTask.opportunityId)) : undefined;
    return {
      ...claimedTask, resumed: queued.status === 'running', workspaceId: queued.workspace_id, leaseOwner: workerId, leaseUntil,
      run: mapRun(runRecord!), brief: briefRecord ? parseJson(briefRecord.data_json, null as ResearchBrief | null) : null,
      briefVersion: briefRecord?.version ?? 0,
      opportunity: claimedTask.opportunityId ? opportunityRows.map(mapOpportunity).find(({ id: opportunityId }) => opportunityId === claimedTask.opportunityId) ?? null : null,
      opportunities: opportunityRows.map(mapOpportunity), runTasks: taskRows.map(mapTask), runEvents: eventRows.map(mapEvent),
      draft: draftRecord ? mapDraft(draftRecord) : null,
    };
  });
}

export function completeAgentTask(input: CompleteAgentTaskInput): { task: AgentTask; stale: boolean; draftConflict: boolean; run: AgentRun; opportunitiesCreated: WorkspaceOpportunity[] } {
  requireWorkspace(input.workspaceId);
  return withTransaction(() => {
    const database = db();
    const taskRecord = row<Record<string, unknown>>(database.prepare(`SELECT * FROM tasks WHERE id = ? AND workspace_id = ? AND status = 'running' AND lease_owner = ?`)
      .get(input.taskId, input.workspaceId, input.workerId));
    if (!taskRecord) throw new WorkspaceNotFound('Task is not actively leased by this worker.');
    const task = mapTask(taskRecord);
    const runRecord = row<Record<string, unknown>>(database.prepare('SELECT * FROM runs WHERE id = ? AND workspace_id = ?').get(task.runId, input.workspaceId));
    if (!runRecord) throw new WorkspaceNotFound('Run was not found in this workspace.');
    const currentBrief = row<{ version: number }>(database.prepare('SELECT version FROM brief_versions WHERE workspace_id = ? ORDER BY version DESC LIMIT 1').get(input.workspaceId));
    const stale = !currentBrief || currentBrief.version !== input.expectedBriefVersion || Number(runRecord.brief_version) !== input.expectedBriefVersion;
    const timestamp = now();
    let createdOpportunities: WorkspaceOpportunity[] = [];
    let draftConflict = false;
    const resultJson = JSON.stringify(input.result ?? null);
    if (resultJson.length > 64_000) throw new TypeError('Task result is too large.');
    const resultRefs = input.resultRefs ?? [];
    if (resultRefs.length > 40 || resultRefs.some((ref) => typeof ref !== 'string' || ref.length > 500)) throw new TypeError('Task result references are invalid.');
    if ((input.events?.length ?? 0) > 20 || (input.nextTasks?.length ?? 0) > 20) throw new TypeError('A task may create at most 20 timeline events or follow-up tasks.');
    database.prepare(`UPDATE tasks SET status = 'succeeded', result_json = ?, result_refs_json = ?, lease_owner = NULL, lease_until = NULL, updated_at = ? WHERE id = ?`)
      .run(resultJson, JSON.stringify(resultRefs), timestamp, input.taskId);
    if (stale) {
      insertEvent(input.workspaceId, { runId: task.runId, opportunityId: task.opportunityId, role: 'system', kind: 'task.stale_result', message: 'Task result was saved for history but not applied because its brief is outdated.', metadata: { taskId: task.id, expectedBriefVersion: input.expectedBriefVersion, currentBriefVersion: currentBrief?.version ?? 0 } });
      const cancelled = database.prepare(`UPDATE tasks SET status = 'cancelled', lease_owner = NULL, lease_until = NULL, updated_at = ?
        WHERE workspace_id = ? AND run_id = ? AND id <> ? AND status IN ('queued', 'waiting_input', 'waiting_approval')`)
        .run(timestamp, input.workspaceId, task.runId, task.id);
      if (Number(cancelled.changes) > 0) insertEvent(input.workspaceId, {
        runId: task.runId, role: 'system', kind: 'run.stale_tasks_cancelled',
        message: 'Unstarted follow-up tasks were cancelled because this run uses an outdated brief.',
        metadata: { cancelledCount: Number(cancelled.changes) },
      });
    } else {
      if ((input.opportunityCreates?.length ?? 0) > 20) throw new TypeError('A task may create at most 20 opportunities.');
      createdOpportunities = (input.opportunityCreates ?? []).map((opportunity) => insertOpportunity(input.workspaceId, opportunity));
      for (const event of input.events ?? []) insertEvent(input.workspaceId, event, task.runId);
      if (input.opportunityUpdate) applyOpportunityPatch(input.workspaceId, input.opportunityUpdate.opportunityId, input.opportunityUpdate.patch);
      if (input.draftRevision) {
        try {
          insertDraft(input.workspaceId, input.draftRevision.opportunityId, input.draftRevision.fields, input.draftRevision.updatedBy, input.draftRevision.expectedVersion);
        } catch (error) {
          if (!(error instanceof WorkspaceVersionConflict)) throw error;
          draftConflict = true;
          const current = row<{ id: string; version: number }>(database.prepare('SELECT id, version FROM drafts WHERE workspace_id = ? AND opportunity_id = ? ORDER BY version DESC LIMIT 1').get(input.workspaceId, input.draftRevision.opportunityId));
          insertEvent(input.workspaceId, {
            runId: task.runId, opportunityId: input.draftRevision.opportunityId, role: 'producer', kind: 'draft.revision_conflict',
            message: 'The current draft was kept. The Producer proposal is saved for review because the draft changed while the agent was working.',
            metadata: { taskId: task.id, draftId: current?.id ?? null, expectedVersion: input.draftRevision.expectedVersion ?? null,
              currentVersion: current?.version ?? 0, proposal: input.draftRevision.fields },
          });
        }
      }
      for (const nextTask of input.nextTasks ?? []) {
        const { opportunityCreateIndex, ...taskInput } = nextTask;
        if (opportunityCreateIndex !== undefined && !createdOpportunities[opportunityCreateIndex]) {
          throw new TypeError('nextTask opportunityCreateIndex does not identify a created opportunity.');
        }
        insertTask(input.workspaceId, { ...taskInput, runId: task.runId,
          opportunityId: opportunityCreateIndex === undefined ? (taskInput.opportunityId ?? task.opportunityId) : createdOpportunities[opportunityCreateIndex].id });
      }
    }
    if (!stale) insertEvent(input.workspaceId, { runId: task.runId, opportunityId: task.opportunityId, role: task.assignedRole, kind: 'task.succeeded', message: 'Task result was saved.', metadata: { taskId: task.id, resultRefs: resultRefs.slice(0, 20) } });
    const failedSibling = row<{ id: string }>(database.prepare(`SELECT id FROM tasks WHERE workspace_id = ? AND run_id = ? AND id <> ? AND status = 'failed' LIMIT 1`)
      .get(input.workspaceId, task.runId, input.taskId));
    if (failedSibling) {
      const cancelled = database.prepare(`UPDATE tasks SET status = 'cancelled', lease_owner = NULL, lease_until = NULL, updated_at = ?
        WHERE workspace_id = ? AND run_id = ? AND id <> ? AND status IN ('queued', 'waiting_input', 'waiting_approval')`)
        .run(timestamp, input.workspaceId, task.runId, input.taskId);
      if (Number(cancelled.changes) > 0) insertEvent(input.workspaceId, {
        runId: task.runId, role: 'system', kind: 'run.tasks_cancelled',
        message: 'Unstarted follow-up tasks were cancelled because another task in this run failed.',
        metadata: { cancelledCount: Number(cancelled.changes) },
      });
    }
    const remaining = rows<{ status: AgentTaskStatus }>(database.prepare(`SELECT status FROM tasks WHERE workspace_id = ? AND run_id = ? AND id <> ? AND status IN ('queued', 'running', 'waiting_input', 'waiting_approval')`)
      .all(input.workspaceId, task.runId, input.taskId));
    let nextRunStatus: AgentRun['status'];
    if (failedSibling) nextRunStatus = 'failed';
    else if (draftConflict && !(input.nextTasks?.length)) nextRunStatus = 'waiting_input';
    else if (input.runStatus) nextRunStatus = input.runStatus;
    else if (stale) nextRunStatus = remaining.some(({ status }) => status === 'running') ? 'running' : 'succeeded';
    else if (remaining.some(({ status }) => status === 'waiting_input' || status === 'waiting_approval')) nextRunStatus = 'waiting_input';
    else if (remaining.length > 0 || (input.nextTasks?.length ?? 0) > 0) nextRunStatus = 'queued';
    else nextRunStatus = 'succeeded';
    const priorRun = row<{ error: string | null }>(database.prepare('SELECT error FROM runs WHERE id = ? AND workspace_id = ?').get(task.runId, input.workspaceId));
    const runError = failedSibling ? priorRun?.error ?? 'Another task in this run failed and needs attention.' : null;
    database.prepare('UPDATE runs SET status = ?, error = ?, updated_at = ? WHERE id = ? AND workspace_id = ?')
      .run(nextRunStatus, runError, now(), task.runId, input.workspaceId);
    return {
      task: mapTask(row<Record<string, unknown>>(database.prepare('SELECT * FROM tasks WHERE id = ?').get(input.taskId))!),
      stale,
      draftConflict,
      run: mapRun(row<Record<string, unknown>>(database.prepare('SELECT * FROM runs WHERE id = ?').get(task.runId))!),
      opportunitiesCreated: createdOpportunities,
    };
  });
}

function applyOpportunityPatch(workspaceId: string, opportunityId: string, patch: OpportunityPatch): WorkspaceOpportunity {
  const current = getOpportunity(workspaceId, opportunityId);
  const next = { ...current, ...patch, updatedAt: now() };
  if (!(['needs_review', 'planned', 'active', 'proposal', 'historical'] as string[]).includes(next.state)
    || !(['attend', 'sponsor', 'speak', 'host', 'research'] as string[]).includes(next.action)) throw new TypeError('Opportunity state or action is invalid.');
  if (next.title.length === 0 || next.title.length > 240) throw new TypeError('Opportunity title must be at most 240 characters.');
  if (next.rationale.length > 2_000 || next.evidenceIds.length > 40 || next.evidenceIds.some((item) => typeof item !== 'string' || item.length > 500)) {
    throw new TypeError('Opportunity rationale or evidence references are invalid.');
  }
  if (next.fit != null && !Number.isFinite(next.fit)) throw new TypeError('Opportunity fit must be finite.');
  db().prepare(`UPDATE opportunities SET catalog_event_id = ?, title = ?, state = ?, action = ?, fit = ?, rationale = ?, evidence_ids_json = ?, updated_at = ?
    WHERE workspace_id = ? AND id = ?`)
    .run(next.catalogEventId, next.title, next.state, next.action, next.fit, next.rationale, JSON.stringify(next.evidenceIds), next.updatedAt, workspaceId, opportunityId);
  return getOpportunity(workspaceId, opportunityId);
}

export function failTask(workspaceId: string, taskId: string, workerId: string, error: string, retryable = true): AgentTask {
  requireWorkspace(workspaceId); assertText(error, 'error', 2000);
  return withTransaction(() => {
    const task = row<Record<string, unknown>>(db().prepare(`SELECT * FROM tasks WHERE id = ? AND workspace_id = ? AND status = 'running' AND lease_owner = ?`).get(taskId, workspaceId, workerId));
    if (!task) throw new WorkspaceNotFound('Task is not actively leased by this worker.');
    const mapped = mapTask(task); const timestamp = now();
    const database = db();
    const priorRun = row<{ status: AgentRun['status']; error: string | null }>(database.prepare('SELECT status, error FROM runs WHERE id = ? AND workspace_id = ?').get(mapped.runId, workspaceId));
    const failedSibling = row<{ id: string }>(database.prepare(`SELECT id FROM tasks WHERE workspace_id = ? AND run_id = ? AND id <> ? AND status = 'failed' LIMIT 1`).get(workspaceId, mapped.runId, taskId));
    const runWasAlreadyFailed = priorRun?.status === 'failed';
    const shouldRetry = retryable && mapped.attempts < MAX_TASK_ATTEMPTS && !failedSibling && !runWasAlreadyFailed;
    db().prepare('UPDATE tasks SET status = ?, lease_owner = NULL, lease_until = NULL, updated_at = ? WHERE id = ?')
      .run(shouldRetry ? 'queued' : 'failed', timestamp, taskId);
    const runFailed = !shouldRetry || Boolean(failedSibling) || runWasAlreadyFailed;
    const status: AgentRun['status'] = runFailed ? 'failed' : 'queued';
    const runError = failedSibling || runWasAlreadyFailed
      ? priorRun?.error ?? 'Another task in this run failed and needs attention.'
      : !shouldRetry ? error.slice(0, 2000) : null;
    database.prepare('UPDATE runs SET status = ?, error = ?, updated_at = ? WHERE id = ? AND workspace_id = ?').run(status, runError, timestamp, mapped.runId, workspaceId);
    if (runFailed) {
      const cancelled = database.prepare(`UPDATE tasks SET status = 'cancelled', lease_owner = NULL, lease_until = NULL, updated_at = ?
        WHERE workspace_id = ? AND run_id = ? AND id <> ? AND status IN ('queued', 'waiting_input', 'waiting_approval')`)
        .run(timestamp, workspaceId, mapped.runId, taskId);
      if (Number(cancelled.changes) > 0) insertEvent(workspaceId, {
        runId: mapped.runId, role: 'system', kind: 'run.tasks_cancelled',
        message: 'Unstarted follow-up tasks were cancelled because this run failed.',
        metadata: { cancelledCount: Number(cancelled.changes) },
      });
    }
    insertEvent(workspaceId, { runId: mapped.runId, opportunityId: mapped.opportunityId, role: 'system', kind: shouldRetry ? 'task.retry' : 'task.failed', message: shouldRetry ? 'Task failed and was queued for another attempt.' : 'Task failed and needs attention.', metadata: { taskId, error: error.slice(0, 500), attempts: mapped.attempts } });
    return mapTask(row<Record<string, unknown>>(db().prepare('SELECT * FROM tasks WHERE id = ?').get(taskId))!);
  });
}

export function createOpportunity(workspaceId: string, input: CreateOpportunityInput): WorkspaceOpportunity {
  requireWorkspace(workspaceId); return withTransaction(() => insertOpportunity(workspaceId, input));
}

export function updateOpportunity(workspaceId: string, opportunityId: string, patch: OpportunityPatch): WorkspaceOpportunity {
  requireWorkspace(workspaceId); return withTransaction(() => applyOpportunityPatch(workspaceId, opportunityId, patch));
}

export function createDraft(workspaceId: string, opportunityId: string, fields: EventDraftFields, updatedBy: EventDraftRecord['updatedBy']): EventDraftRecord {
  requireWorkspace(workspaceId); getOpportunity(workspaceId, opportunityId);
  return withTransaction(() => insertDraft(workspaceId, opportunityId, fields, updatedBy, 0));
}

export function updateDraft(workspaceId: string, draftId: string, expectedVersion: number, fields: EventDraftFields, updatedBy: EventDraftRecord['updatedBy']): EventDraftRecord {
  requireWorkspace(workspaceId);
  return withTransaction(() => {
    const current = row<Record<string, unknown>>(db().prepare(`SELECT * FROM drafts WHERE workspace_id = ? AND id = ? ORDER BY version DESC LIMIT 1`).get(workspaceId, draftId));
    if (!current) throw new WorkspaceNotFound('Draft was not found in this workspace.');
    return insertDraft(workspaceId, String(current.opportunity_id), fields, updatedBy, expectedVersion);
  });
}

export function appendTimelineEvent(workspaceId: string, input: TimelineEventInput): AgentTimelineEvent {
  requireWorkspace(workspaceId); return withTransaction(() => insertEvent(workspaceId, input));
}

export function recordInboundReply(workspaceId: string, input: InboundReplyInput): { duplicate: boolean; replyId: string; task: AgentTask | null } {
  requireWorkspace(workspaceId);
  assertText(input.messageId, 'messageId', 200); assertText(input.message, 'message', 5000);
  if (input.simulated !== true) throw new TypeError('Only explicitly simulated demo replies are supported.');
  getOpportunity(workspaceId, input.opportunityId);
  return withTransaction(() => {
    const existing = row<{ id: string }>(db().prepare('SELECT id FROM inbound_replies WHERE workspace_id = ? AND message_id = ?').get(workspaceId, input.messageId));
    if (existing) return { duplicate: true, replyId: existing.id, task: null };
    const brief = row<{ version: number }>(db().prepare('SELECT version FROM brief_versions WHERE workspace_id = ? ORDER BY version DESC LIMIT 1').get(workspaceId));
    if (!brief) throw new WorkspaceVersionConflict('Save a brief before adding an organizer reply.');
    const replyId = id('reply'); const timestamp = now();
    db().prepare('INSERT INTO inbound_replies(id, workspace_id, opportunity_id, message_id, message, simulated, created_at) VALUES(?, ?, ?, ?, ?, 1, ?)')
      .run(replyId, workspaceId, input.opportunityId, input.messageId, input.message, timestamp);
    const runId = id('run'); const runKey = `inbound:${input.messageId}`;
    db().prepare(`INSERT INTO runs(id, workspace_id, status, brief_version, opportunity_id, idempotency_key, created_at, updated_at)
      VALUES(?, ?, 'queued', ?, ?, ?, ?, ?)`)
      .run(runId, workspaceId, brief.version, input.opportunityId, runKey, timestamp, timestamp);
    const task = insertTask(workspaceId, {
      runId, opportunityId: input.opportunityId, assignedRole: 'partnerships',
      objective: 'Interpret the simulated organizer reply, separate confirmed terms from unknown terms, and ask the Lead to replan.',
      inputRefs: [`inbound:${replyId}`, `brief:${brief.version}`], idempotencyKey: `inbound:${input.messageId}`,
    });
    insertEvent(workspaceId, { runId, opportunityId: input.opportunityId, role: 'system', kind: 'inbound.simulated', message: 'A simulated organizer reply was received and queued for review.', metadata: { replyId, messageId: input.messageId, message: input.message, simulated: true } });
    return { duplicate: false, replyId, task };
  });
}

export function getRun(workspaceId: string, runId: string): { run: AgentRun; tasks: AgentTask[]; events: AgentTimelineEvent[] } {
  requireWorkspace(workspaceId);
  const run = row<Record<string, unknown>>(db().prepare('SELECT * FROM runs WHERE id = ? AND workspace_id = ?').get(runId, workspaceId));
  if (!run) throw new WorkspaceNotFound('Run was not found in this workspace.');
  const tasks = rows<Record<string, unknown>>(db().prepare('SELECT * FROM tasks WHERE workspace_id = ? AND run_id = ? ORDER BY created_at').all(workspaceId, runId));
  const events = rows<Record<string, unknown>>(db().prepare('SELECT * FROM timeline_events WHERE workspace_id = ? AND run_id = ? ORDER BY created_at').all(workspaceId, runId));
  return { run: mapRun(run), tasks: tasks.map(mapTask), events: events.map(mapEvent) };
}

export function readCompanyBrand(workspaceId: string, sourceUrl?: string): CompanyBrand | null {
  requireWorkspace(workspaceId);
  const record = sourceUrl
    ? db().prepare('SELECT data_json FROM company_brands WHERE workspace_id = ? AND source_url = ?').get(workspaceId, sourceUrl)
    : db().prepare('SELECT data_json FROM company_brands WHERE workspace_id = ? ORDER BY updated_at DESC LIMIT 1').get(workspaceId);
  return record ? parseJson(record.data_json, null as CompanyBrand | null) : null;
}

export function saveCompanyBrand(workspaceId: string, brand: CompanyBrand): CompanyBrand {
  requireWorkspace(workspaceId);
  db().prepare(`INSERT INTO company_brands(workspace_id, source_url, submission_id, data_json, updated_at) VALUES(?, ?, ?, ?, ?)
    ON CONFLICT(workspace_id, source_url) DO UPDATE SET submission_id = excluded.submission_id, data_json = excluded.data_json, updated_at = excluded.updated_at`)
    .run(workspaceId, brand.sourceUrl, brand.submissionId, JSON.stringify(brand), now());
  return brand;
}

export function readEventDesignBrief(workspaceId: string, hash: string): EventDesignBrief | null {
  requireWorkspace(workspaceId);
  const record = db().prepare('SELECT data_json FROM event_design_briefs WHERE workspace_id = ? AND input_hash = ?').get(workspaceId, hash);
  return record ? parseJson(record.data_json, null as EventDesignBrief | null) : null;
}

export function saveEventDesignBrief(workspaceId: string, hash: string, design: EventDesignBrief): EventDesignBrief {
  requireWorkspace(workspaceId);
  db().prepare('INSERT OR REPLACE INTO event_design_briefs(workspace_id, input_hash, data_json, created_at) VALUES(?, ?, ?, ?)')
    .run(workspaceId, hash, JSON.stringify(design), now());
  return design;
}

export interface EventPagePreview {
  id: string;
  opportunityId: string | null;
  fields: EventDraftFields;
  brand: CompanyBrand;
  design: EventDesignBrief | null;
  createdAt: string;
}

export function provisionEventPreview(workspaceId: string, input: Omit<EventPagePreview, 'id' | 'createdAt'>): EventPagePreview {
  requireWorkspace(workspaceId);
  if (input.opportunityId) getOpportunity(workspaceId, input.opportunityId);
  const key = createHash('sha256').update(workspaceId + JSON.stringify(input)).digest('hex').slice(0, 24);
  const existing = readEventPreview(workspaceId, key);
  if (existing) return existing;
  const result = { ...input, id: key, createdAt: now() };
  db().prepare('INSERT INTO event_page_previews(id, workspace_id, opportunity_id, data_json, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?)')
    .run(key, workspaceId, input.opportunityId, JSON.stringify(result), result.createdAt, result.createdAt);
  return result;
}

export function readEventPreview(workspaceId: string, previewId: string): EventPagePreview | null {
  requireWorkspace(workspaceId);
  const record = db().prepare('SELECT data_json FROM event_page_previews WHERE workspace_id = ? AND id = ?').get(workspaceId, previewId);
  return record ? parseJson(record.data_json, null as EventPagePreview | null) : null;
}
