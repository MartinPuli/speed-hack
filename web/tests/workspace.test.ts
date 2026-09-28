import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import type { ResearchBrief } from '../lib/contracts/event-gtm';
import type { EventDraftFields } from '../lib/contracts/agent-workspace';
import {
  WorkspaceNotFound,
  WorkspaceVersionConflict,
  claimNextTask,
  completeAgentTask,
  createDemoSession,
  createDraft,
  createOpportunity,
  createRun,
  createTask,
  failTask,
  readWorkspaceSnapshot,
  recordInboundReply,
  resolveDemoWorkspaceId,
  saveBrief,
  updateDraft,
} from '../lib/server/workspace/repository';

function useTemporaryDatabase(): { workspaceId: string; clean: () => void } {
  const directory = mkdtempSync(join(tmpdir(), 'event-gtm-workspace-'));
  process.env.EVENT_GTM_WORKSPACE_PATH = join(directory, 'workspace.sqlite');
  const session = createDemoSession();
  return { workspaceId: session.workspaceId, clean: () => rmSync(directory, { recursive: true, force: true }) };
}

const brief: ResearchBrief = {
  company: 'Acme', website: 'https://acme.example', objective: 'partnerships', audience: 'Developer teams',
  topics: 'AI infrastructure', geography: 'San Francisco', from: '2026-10-01', to: '2026-12-31',
  budget: '2000', currency: 'USD', constraints: 'No travel outside California',
};

const draftFields: EventDraftFields = {
  title: 'Acme developer workshop', description: 'A practical workshop.', audience: 'Developer teams', format: 'Workshop',
  agenda: 'Welcome; workshop; Q&A', host: 'Acme', cta: 'Join us', date: '', timezone: '', location: '',
  productionBrief: 'Private proposal. Price is still unknown.', sourceRefs: [],
};

test('demo session resolves only stored session tokens and workspace APIs reject other workspaces', (t) => {
  const { workspaceId, clean } = useTemporaryDatabase(); t.after(clean);
  const session = createDemoSession();
  assert.equal(resolveDemoWorkspaceId(session.token), workspaceId);
  assert.equal(resolveDemoWorkspaceId(`${session.token}tampered`), null);
  assert.equal(resolveDemoWorkspaceId('not-a-session'), null);
  assert.throws(() => readWorkspaceSnapshot('another-workspace'), WorkspaceNotFound);
  assert.equal(readWorkspaceSnapshot(workspaceId).demoMode, true);
});

test('brief and draft saves enforce optimistic versions', (t) => {
  const { workspaceId, clean } = useTemporaryDatabase(); t.after(clean);
  assert.deepEqual(saveBrief(workspaceId, brief, 0).version, 1);
  assert.throws(() => saveBrief(workspaceId, brief, 0), WorkspaceVersionConflict);
  assert.equal(saveBrief(workspaceId, { ...brief, budget: '2500' }, 1).version, 2);
  const opportunity = createOpportunity(workspaceId, { title: 'AI Infrastructure Summit', catalogEventId: 'evt-catalog-1', rationale: 'Relevant audience.' });
  const first = createDraft(workspaceId, opportunity.id, draftFields, 'producer');
  assert.equal(first.version, 1);
  const second = updateDraft(workspaceId, first.id, 1, { ...draftFields, title: 'Updated workshop' }, 'user');
  assert.equal(second.version, 2);
  assert.equal(second.updatedBy, 'user');
  assert.throws(() => updateDraft(workspaceId, first.id, 1, draftFields, 'user'), WorkspaceVersionConflict);
});

test('task completion atomically applies discoveries, updates, draft revisions and follow-up work; stale results have no side effects', (t) => {
  const { workspaceId, clean } = useTemporaryDatabase(); t.after(clean);
  const { version: briefVersion } = saveBrief(workspaceId, brief, 0);
  const opportunity = createOpportunity(workspaceId, { title: 'Existing opportunity', rationale: 'Initial review.' });
  const started = createRun(workspaceId, { opportunityId: opportunity.id, idempotencyKey: 'run-current' });
  const lease = claimNextTask('worker-a');
  assert.ok(lease);
  const completion = completeAgentTask({
    workspaceId, taskId: lease.id, workerId: 'worker-a', expectedBriefVersion: briefVersion,
    result: { summary: 'Found a relevant event.' }, resultRefs: ['catalog:evt-1'],
    events: [{ role: 'scout', kind: 'catalog_search', message: 'Found one candidate.' }],
    opportunityCreates: [{ title: 'New event', catalogEventId: 'evt-1', action: 'attend', rationale: 'Strong audience fit.', evidenceIds: ['evidence:1'] }],
    opportunityUpdate: { opportunityId: opportunity.id, patch: { state: 'planned', action: 'sponsor', rationale: 'Sponsor option is under review.' } },
    draftRevision: { opportunityId: opportunity.id, expectedVersion: 0, fields: draftFields, updatedBy: 'producer' },
    nextTasks: [{ assignedRole: 'producer', objective: 'Prepare the event concept.', opportunityCreateIndex: 0 }],
  });
  assert.equal(completion.stale, false);
  assert.equal(completion.task.status, 'succeeded');
  assert.equal(completion.opportunitiesCreated.length, 1);
  const snapshot = readWorkspaceSnapshot(workspaceId);
  assert.equal(snapshot.opportunities.find(item => item.id === opportunity.id)?.state, 'planned');
  assert.equal(snapshot.drafts[0]?.version, 1);
  assert.equal(snapshot.tasks.length, 2);
  assert.equal(snapshot.tasks.find(task => task.assignedRole === 'producer')?.opportunityId, completion.opportunitiesCreated[0].id);
  assert.ok(snapshot.events.some(event => event.kind === 'task.succeeded'));
  assert.equal(started.run.status, 'queued');

  const followup = claimNextTask('worker-producer');
  assert.ok(followup);
  assert.equal(followup.assignedRole, 'producer');
  completeAgentTask({ workspaceId, taskId: followup.id, workerId: 'worker-producer', expectedBriefVersion: briefVersion, result: { summary: 'Concept saved.' } });

  const { version: latestBriefVersion } = saveBrief(workspaceId, { ...brief, budget: '3000' }, briefVersion);
  const staleRun = createRun(workspaceId, { idempotencyKey: 'run-stale' });
  const staleLease = claimNextTask('worker-b');
  assert.ok(staleLease);
  const staleResult = completeAgentTask({
    workspaceId, taskId: staleLease.id, workerId: 'worker-b', expectedBriefVersion: briefVersion,
    result: { summary: 'Late result from old brief.' },
    opportunityCreates: [{ title: 'Stale candidate', catalogEventId: 'evt-old', rationale: 'Should not apply.' }],
    nextTasks: [{ assignedRole: 'lead', objective: 'Replan from stale result.' }],
  });
  assert.equal(staleResult.stale, true);
  assert.equal(staleResult.run.status, 'succeeded');
  const afterStale = readWorkspaceSnapshot(workspaceId);
  assert.equal(afterStale.opportunities.some(item => item.title === 'Stale candidate'), false);
  assert.equal(afterStale.tasks.some(task => task.objective === 'Replan from stale result.'), false);
  assert.ok(afterStale.events.some(event => event.kind === 'task.stale_result'));
  assert.equal(latestBriefVersion, briefVersion + 1);
  assert.equal(staleRun.run.status, 'queued');

  const currentDraft = afterStale.drafts.find(item => item.opportunityId === opportunity.id)!;
  updateDraft(workspaceId, currentDraft.id, currentDraft.version, { ...draftFields, title: 'Human edit kept' }, 'user');
  createRun(workspaceId, { opportunityId: opportunity.id, idempotencyKey: 'run-draft-conflict' });
  const producerLease = claimNextTask('worker-producer-conflict');
  assert.ok(producerLease);
  const conflicted = completeAgentTask({
    workspaceId, taskId: producerLease.id, workerId: 'worker-producer-conflict', expectedBriefVersion: latestBriefVersion,
    result: { summary: 'Proposed a revised title.' },
    draftRevision: { opportunityId: opportunity.id, expectedVersion: currentDraft.version, fields: { ...draftFields, title: 'Agent proposal for review' }, updatedBy: 'producer' },
  });
  assert.equal(conflicted.draftConflict, true);
  assert.equal(conflicted.run.status, 'waiting_input');
  const afterConflict = readWorkspaceSnapshot(workspaceId);
  assert.equal(afterConflict.drafts.find(item => item.opportunityId === opportunity.id)?.fields.title, 'Human edit kept');
  const conflictEvent = afterConflict.events.find(event => event.kind === 'draft.revision_conflict');
  assert.equal((conflictEvent?.metadata.proposal as EventDraftFields).title, 'Agent proposal for review');
});

test('duplicate simulated organizer reply creates a single reply and task', (t) => {
  const { workspaceId, clean } = useTemporaryDatabase(); t.after(clean);
  saveBrief(workspaceId, brief, 0);
  const opportunity = createOpportunity(workspaceId, { title: 'Sponsor opportunity' });
  const input = { opportunityId: opportunity.id, messageId: 'demo-inbox-1', message: 'We can offer sponsorship for $5,000; workshop pricing is still unknown.', simulated: true as const };
  const first = recordInboundReply(workspaceId, input);
  const duplicate = recordInboundReply(workspaceId, input);
  assert.equal(first.duplicate, false);
  assert.ok(first.task);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.replyId, first.replyId);
  assert.equal(duplicate.task, null);
  assert.equal(readWorkspaceSnapshot(workspaceId).tasks.length, 1);
});

test('terminal task failure is not masked by a sibling success and cancels queued follow-up work', (t) => {
  const { workspaceId, clean } = useTemporaryDatabase(); t.after(clean);
  const { version } = saveBrief(workspaceId, brief, 0);
  const { run } = createRun(workspaceId, { idempotencyKey: 'failure-is-terminal' });
  createTask(workspaceId, { runId: run.id, assignedRole: 'scout', objective: 'Inspect one catalog candidate.' });
  const failedTask = claimNextTask('worker-failure');
  const concurrentTask = claimNextTask('worker-success');
  assert.ok(failedTask);
  assert.ok(concurrentTask);
  failTask(workspaceId, failedTask.id, 'worker-failure', 'Provider task failed.', false);

  const completion = completeAgentTask({
    workspaceId, taskId: concurrentTask.id, workerId: 'worker-success', expectedBriefVersion: version,
    result: { summary: 'The sibling completed successfully.' },
    nextTasks: [{ assignedRole: 'lead', objective: 'Continue after the sibling task.' }],
  });
  assert.equal(completion.run.status, 'failed');
  assert.equal(completion.run.error, 'Provider task failed.');
  const snapshot = readWorkspaceSnapshot(workspaceId);
  assert.equal(snapshot.runs.find(item => item.id === run.id)?.status, 'failed');
  assert.equal(snapshot.tasks.find(item => item.objective === 'Continue after the sibling task.')?.status, 'cancelled');
});

test('a retryable running sibling is failed rather than requeued after another task terminally fails', (t) => {
  const { workspaceId, clean } = useTemporaryDatabase(); t.after(clean);
  saveBrief(workspaceId, brief, 0);
  const { run } = createRun(workspaceId, { idempotencyKey: 'retry-after-terminal-sibling' });
  createTask(workspaceId, { runId: run.id, assignedRole: 'scout', objective: 'Search the catalog.' });
  const first = claimNextTask('worker-terminal-failure');
  const second = claimNextTask('worker-retryable-failure');
  assert.ok(first);
  assert.ok(second);

  failTask(workspaceId, first.id, 'worker-terminal-failure', 'First task failed terminally.', false);
  const secondResult = failTask(workspaceId, second.id, 'worker-retryable-failure', 'Second task had a transient error.', true);

  assert.equal(secondResult.status, 'failed');
  const snapshot = readWorkspaceSnapshot(workspaceId);
  const failedRun = snapshot.runs.find(item => item.id === run.id);
  assert.equal(failedRun?.status, 'failed');
  assert.equal(failedRun?.error, 'First task failed terminally.');
  assert.equal(snapshot.tasks.filter(task => task.runId === run.id && task.status === 'queued').length, 0);
  assert.ok(snapshot.events.some(event => event.kind === 'task.failed' && event.metadata.taskId === second.id));
});

test('expired worker reservation returns the same task to the queue for a new attempt', async (t) => {
  const { workspaceId, clean } = useTemporaryDatabase(); t.after(clean);
  saveBrief(workspaceId, brief, 0);
  createRun(workspaceId, { idempotencyKey: 'lease-retry' });
  const first = claimNextTask('worker-before-restart', 5_000);
  assert.ok(first);
  await new Promise(resolve => setTimeout(resolve, 5_100));
  const recovered = claimNextTask('worker-after-restart', 5_000);
  assert.ok(recovered);
  assert.equal(recovered.id, first.id);
  assert.equal(recovered.attempts, 2);
  assert.equal(recovered.leaseOwner, 'worker-after-restart');
});
