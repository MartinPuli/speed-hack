import type { ClaimedTask } from '../workspace/repository';
import { executeClaimedTask, type AgentRuntimeRepository } from './runtime';
import type { AgentModelClient } from './model-client';
import { getRoleDefinition } from './roles';

export interface AgentDispatcherOptions {
  repository: AgentRuntimeRepository;
  client?: AgentModelClient;
  fetcher?: typeof fetch;
}

/** Dispatch exactly the role stored on a leased task; client input cannot pick a role. */
export async function dispatchClaimedTask(claim: ClaimedTask, options: AgentDispatcherOptions) {
  if (!claim || !claim.workspaceId || !claim.leaseOwner || !claim.run || !claim.briefVersion) {
    throw new Error('The worker received an incomplete task claim.');
  }
  getRoleDefinition(claim.assignedRole);
  // Force repository capability presence at dispatch time; runtime performs the atomic completion.
  if (typeof options.repository.completeAgentTask !== 'function' || typeof options.repository.failTask !== 'function') {
    throw new Error('The agent worker repository is missing task completion methods.');
  }
  return executeClaimedTask(claim, {
    repository: options.repository,
    client: options.client,
    fetcher: options.fetcher,
  });
}
