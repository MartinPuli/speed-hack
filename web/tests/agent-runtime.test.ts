import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import type { ResearchBrief } from '../lib/contracts/event-gtm';
import type { AgentTask, AgentTimelineEvent, WorkspaceAgentRole, WorkspaceOpportunity } from '../lib/contracts/agent-workspace';
import { dispatchClaimedTask } from '../lib/server/agents/dispatcher';
import { getEventDetail, searchEvents } from '../lib/server/dataset-repository';
import { AgentModelConfigurationError, AgentModelRequestError, AnthropicModelClient, type AnthropicMessage, type AnthropicResponse } from '../lib/server/agents/model-client';
import { getRoleDefinition } from '../lib/server/agents/roles';
import type { AgentRuntimeRepository } from '../lib/server/agents/runtime';
import {
  claimNextTask,
  completeAgentTask,
  createDemoSession,
  createOpportunity,
  createRun,
  readWorkspaceSnapshot,
  saveBrief,
} from '../lib/server/workspace/repository';

const brief: ResearchBrief = {
  company: 'Example Co', website: 'https://example.com', objective: 'partnerships', audience: 'Infrastructure founders',
  topics: 'AI infrastructure', geography: 'San Francisco', from: '2026-10-01', to: '2026-12-31',
  budget: '2000', currency: 'USD', constraints: '',
};

function response(content: AnthropicResponse['content'], stop_reason = 'tool_use'): AnthropicResponse {
  return { id: 'msg_test', type: 'message', role: 'assistant', model: 'test-model', content, stop_reason };
}

function toolUse(id: string, name: string, input: unknown) {
  return { type: 'tool_use' as const, id, name, input };
}

const finalInput = {
  summary: 'Reviewed the assigned work and selected the next action.',
  findings: ['Current evidence remains linked to its source.'],
  confidence: 'medium',
  blockers: [],
  nextRecommendedAction: 'research',
};

function claim(role: WorkspaceAgentRole = 'lead', opportunityId: string | null = null) {
  const task: AgentTask = {
    id: 'task_test', runId: 'run_test', opportunityId, assignedRole: role,
    objective: 'Review the current brief and determine useful next work.', status: 'running',
    inputRefs: ['brief:1'], resultRefs: [], result: null, attempts: 1,
    createdAt: '2026-09-28T12:00:00.000Z', updatedAt: '2026-09-28T12:00:00.000Z',
  };
  return {
    ...task,
    workspaceId: 'workspace_test', leaseOwner: 'worker_test', leaseUntil: '2026-09-28T12:05:00.000Z',
    run: { id: 'run_test', status: 'running' as const, briefVersion: 1, opportunityId, error: null, createdAt: task.createdAt, updatedAt: task.updatedAt },
    brief, briefVersion: 1, opportunity: null, opportunities: [], runTasks: [task], runEvents: [], draft: null,
  };
}

function repositoryStub(captures: {
  completed?: unknown[];
  failures?: Array<{ error: string; retryable?: boolean }>;
} = {}): AgentRuntimeRepository {
  return {
    completeAgentTask: (input) => { captures.completed?.push(input); return undefined; },
    failTask: (_workspaceId, _taskId, _workerId, error, retryable) => { captures.failures?.push({ error, retryable }); return undefined; },
  };
}

function scriptedClient(responses: AnthropicResponse[], requests: Array<{ messages: AnthropicMessage[]; tools: unknown[] }> = []) {
  return {
    model: 'test-model',
    async createMessage(input: { messages: AnthropicMessage[]; tools: unknown[] }) {
      requests.push(input);
      const next = responses.shift();
      if (!next) throw new Error('Scripted model exhausted.');
      return next;
    },
  } as unknown as AnthropicModelClient;
}

test('each role receives only its bounded tool allowlist', () => {
  const names = (role: WorkspaceAgentRole) => getRoleDefinition(role).tools.map(item => item.name);
  assert.ok(names('lead').includes('proposePlan'));
  assert.ok(names('scout').includes('searchCatalog'));
  assert.ok(names('partnerships').includes('draftOutreach'));
  assert.ok(names('producer').includes('proposeDraftRevision'));
  assert.ok(!names('lead').includes('searchCatalog'));
  assert.ok(!names('scout').includes('proposeDraftRevision'));
  assert.ok(!names('partnerships').includes('proposePlan'));
  for (const role of ['lead', 'scout', 'partnerships', 'producer'] as const) {
    assert.ok(names(role).includes('completeTask'));
  }
});

test('dispatcher returns an error tool result for unauthorized tools and rejects invalid arguments', async () => {
  const captures = { completed: [] as unknown[] };
  const requests: Array<{ messages: AnthropicMessage[]; tools: unknown[] }> = [];
  const client = scriptedClient([
    response([toolUse('bad-role-tool', 'searchCatalog', { q: 'AI', from: '', to: '', country: '', city: '' })]),
    response([toolUse('bad-args', 'createTask', {})]),
    response([toolUse('done', 'completeTask', finalInput)]),
  ], requests);
  await dispatchClaimedTask(claim('lead'), { repository: repositoryStub(captures), client });
  const toolResults = requests[2].messages.filter(message => message.role === 'user').flatMap(message => Array.isArray(message.content) ? message.content : []);
  assert.ok(toolResults.some(block => block.type === 'tool_result' && block.is_error === true && block.tool_use_id === 'bad-args'));
  assert.equal(captures.completed.length, 1);
  const completion = captures.completed[0] as { nextTasks?: unknown[] };
  assert.equal(completion.nextTasks?.length ?? 0, 0);
});

test('dispatcher caps model tool calls and records a non-retryable limit failure', async () => {
  const failures: Array<{ error: string; retryable?: boolean }> = [];
  const tooMany = Array.from({ length: 11 }, (_, index) => toolUse(`read-${index}`, 'readBrief', {}));
  const client = scriptedClient([response(tooMany)]);
  await assert.rejects(dispatchClaimedTask(claim('lead'), { repository: repositoryStub({ failures }), client }), /limit of 10 tool calls/);
  assert.equal(failures.length, 1);
  assert.equal(failures[0].retryable, false);
});

test('Lead follow-ups keep a run queued for the next role instead of marking it complete', async () => {
  const captures = { completed: [] as unknown[] };
  const client = scriptedClient([
    response([toolUse('scout', 'createTask', {
      assignedRole: 'scout', objective: 'Search the catalog for relevant events.', opportunityId: null,
      opportunityCreateIndex: null, inputRefs: ['brief:1'],
    })]),
    response([toolUse('done', 'completeTask', finalInput)]),
  ]);
  await dispatchClaimedTask(claim('lead'), { repository: repositoryStub(captures), client });
  const completion = captures.completed[0] as { runStatus?: string; nextTasks?: Array<{ assignedRole: string }> };
  assert.equal(completion.runStatus, 'queued');
  assert.equal(completion.nextTasks?.[0]?.assignedRole, 'scout');
});

test('Partnerships reads the persisted reply and queues a Lead replanning task', async () => {
  const opportunity: WorkspaceOpportunity = {
    id: 'opp_sim', catalogEventId: null, title: 'Demo event', state: 'planned', action: 'sponsor', fit: 70,
    rationale: 'Under review.', evidenceIds: [], createdAt: '2026-09-28T12:00:00.000Z', updatedAt: '2026-09-28T12:00:00.000Z',
  };
  const inbound: AgentTimelineEvent = {
    id: 'evt_reply', runId: 'run_test', opportunityId: opportunity.id, role: 'system', kind: 'inbound.simulated',
    message: 'A simulated organizer reply was received.',
    metadata: { messageId: 'demo-reply-1', replyId: 'reply_record', message: 'Sponsorship is $5,000; the workshop price is still unknown.', simulated: true },
    createdAt: '2026-09-28T12:01:00.000Z',
  };
  const base = claim('partnerships', opportunity.id);
  const leased = { ...base, opportunity, opportunities: [opportunity], runEvents: [inbound] };
  const captures = { completed: [] as unknown[] };
  const requests: Array<{ messages: AnthropicMessage[]; tools: unknown[] }> = [];
  const client = scriptedClient([
    response([toolUse('read-reply', 'readInboundReply', {})]),
    response([toolUse('summary', 'saveReplySummary', {
      messageId: 'demo-reply-1', summary: 'The reply offers sponsorship at $5,000; workshop pricing remains unknown.',
      confirmedFacts: ['The simulated sponsorship offer is $5,000.'], unknowns: ['Workshop price is unknown.'], simulated: true,
    })]),
    response([toolUse('done', 'completeTask', finalInput)]),
  ], requests);
  await dispatchClaimedTask(leased, { repository: repositoryStub(captures), client });
  const replyToolResults = requests[1].messages.filter(message => message.role === 'user').flatMap(message => Array.isArray(message.content) ? message.content : []);
  assert.ok(replyToolResults.some(block => block.type === 'tool_result' && String(block.content).includes('Sponsorship is $5,000')));
  const completion = captures.completed[0] as { runStatus?: string; nextTasks?: Array<{ assignedRole: string; opportunityId: string | null }> };
  assert.equal(completion.runStatus, 'queued');
  assert.equal(completion.nextTasks?.[0]?.assignedRole, 'lead');
  assert.equal(completion.nextTasks?.[0]?.opportunityId, opportunity.id);
});

test('Scout can stage no more than three evidence-backed opportunities per run', async () => {
  const filters = { q: '', from: '2026-10-01', to: '2030-12-31', country: '', city: '', scope: 'upcoming' as const, sector: 'tech' as const, page: 1, pageSize: 30 };
  const candidates = searchEvents(filters).events
    .map(event => ({ id: event.id, evidence: getEventDetail(event.id)?.evidence ?? [] }))
    .filter(event => event.evidence.length > 0)
    .slice(0, 4);
  assert.equal(candidates.length, 4, 'the checked-in catalog should provide four upcoming events with evidence');
  const captures = { completed: [] as unknown[] };
  const requests: Array<{ messages: AnthropicMessage[]; tools: unknown[] }> = [];
  const client = scriptedClient([
    response([toolUse('search', 'searchCatalog', { q: filters.q, from: filters.from, to: filters.to, country: filters.country, city: filters.city })]),
    response(candidates.map((event, index) => toolUse(`evidence-${index}`, 'getEventEvidence', { eventId: event.id }))),
    response(candidates.map((event, index) => toolUse(`save-${index}`, 'saveOpportunity', {
      catalogEventId: event.id, action: 'attend', rationale: 'This event is a possible audience fit.', evidenceIds: [event.evidence[0].id],
    }))),
    response([toolUse('done', 'completeTask', finalInput)]),
  ], requests);
  await dispatchClaimedTask(claim('scout'), { repository: repositoryStub(captures), client });
  const completion = captures.completed[0] as { opportunityCreates?: Array<{ catalogEventId: string }> };
  assert.equal(completion.opportunityCreates?.length, 3);
  const saveResults = requests[3].messages.filter(message => message.role === 'user').flatMap(message => Array.isArray(message.content) ? message.content : []);
  assert.ok(saveResults.some(block => block.type === 'tool_result' && block.tool_use_id === 'save-3' && block.is_error === true));
});

test('stale model work persists its result but does not apply staged plan or follow-up tasks', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'agent-runtime-stale-'));
  const previousPath = process.env.EVENT_GTM_WORKSPACE_PATH;
  process.env.EVENT_GTM_WORKSPACE_PATH = join(directory, 'workspace.sqlite');
  t.after(() => {
    if (previousPath === undefined) delete process.env.EVENT_GTM_WORKSPACE_PATH;
    else process.env.EVENT_GTM_WORKSPACE_PATH = previousPath;
    rmSync(directory, { recursive: true, force: true });
  });

  const workspaceId = createDemoSession().workspaceId;
  saveBrief(workspaceId, brief, 0);
  const opportunity = createOpportunity(workspaceId, { title: 'Relevant event', rationale: 'Awaiting review.' });
  createRun(workspaceId, { opportunityId: opportunity.id, idempotencyKey: 'stale-runtime' });
  const lease = claimNextTask('worker-stale');
  assert.ok(lease);
  const client = {
    model: 'test-model',
    async createMessage(input: { messages: AnthropicMessage[] }) {
      if (input.messages.length === 1) {
        return response([toolUse('plan', 'proposePlan', {
          opportunityId: opportunity.id, action: 'sponsor', state: 'planned', fit: 80,
          rationale: 'The current evidence supports a sponsorship review.', evidenceIds: [],
        })]);
      }
      saveBrief(workspaceId, { ...brief, budget: '2500' }, 1);
      return response([toolUse('done', 'completeTask', finalInput)]);
    },
  } as unknown as AnthropicModelClient;
  await dispatchClaimedTask(lease, { repository: { completeAgentTask, failTask: () => undefined }, client });
  const snapshot = readWorkspaceSnapshot(workspaceId);
  assert.equal(snapshot.opportunities.find(item => item.id === opportunity.id)?.action, 'research');
  assert.ok(snapshot.events.some(event => event.kind === 'task.stale_result'));
  assert.equal(snapshot.tasks.some(task => task.objective.includes('follow-up')), false);
  assert.deepEqual(snapshot.tasks[0]?.result && (snapshot.tasks[0].result as { outcome?: unknown }).outcome, finalInput);
});

test('Anthropic configuration is explicit and requires the workspace ID before a worker can claim work', () => {
  assert.throws(() => new AnthropicModelClient({ apiKey: '', model: 'claude-sonnet-4-5', workspaceId: 'wrkspc_test' }), AgentModelConfigurationError);
  assert.throws(() => new AnthropicModelClient({ apiKey: 'key', model: '', workspaceId: 'wrkspc_test' }), AgentModelConfigurationError);
  assert.throws(() => new AnthropicModelClient({ apiKey: 'key', model: 'claude-sonnet-4-5' }), /ANTHROPIC_WORKSPACE_ID is required/);
});

test('Anthropic client adds workspace header and redacts credentials from provider errors', async () => {
  let observedHeaders: Headers | undefined;
  const client = new AnthropicModelClient({
    apiKey: 'secret-value', model: 'claude-sonnet-4-5', workspaceId: 'wrkspc_test',
    fetcher: async (_input, init) => {
      observedHeaders = new Headers(init?.headers);
      return new Response(JSON.stringify({ error: { message: 'secret-value is not scoped to one workspace; use anthropic-workspace-id.' } }), { status: 400 });
    },
  });
  await assert.rejects(client.createMessage({ system: 'role', messages: [], tools: [] }), (error: unknown) => {
    assert.ok(error instanceof AgentModelRequestError);
    assert.match(error.message, /ANTHROPIC_WORKSPACE_ID/);
    assert.doesNotMatch(error.message, /secret-value/);
    return true;
  });
  assert.equal(observedHeaders?.get('anthropic-workspace-id'), 'wrkspc_test');
  assert.equal(observedHeaders?.get('x-api-key'), 'secret-value');
});
