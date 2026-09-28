import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { dispatchClaimedTask } from '../lib/server/agents/dispatcher';
import { AgentModelConfigurationError, AnthropicModelClient } from '../lib/server/agents/model-client';
import { claimNextTask, completeAgentTask, failTask } from '../lib/server/workspace/repository';

function loadLocalEnvironment(): void {
  if (typeof process.loadEnvFile !== 'function') return;
  const locations = [
    resolve(process.cwd(), '.env.local'),
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), 'web', '.env.local'),
    resolve(process.cwd(), 'web', '.env'),
  ];
  for (const path of locations) {
    if (!existsSync(path)) continue;
    try { process.loadEnvFile(path); }
    catch {
      throw new Error(`Could not load server environment file ${path}. Check its syntax; secret values were not printed.`);
    }
  }
}

function integerEnv(name: string, fallback: number, minimum: number, maximum: number): number {
  const raw = Number(process.env[name]);
  return Number.isFinite(raw) ? Math.max(minimum, Math.min(maximum, Math.floor(raw))) : fallback;
}

function parseMaxTasks(): number {
  const rawFlag = process.argv.find(argument => argument.startsWith('--max-tasks='))?.slice('--max-tasks='.length);
  const flag = rawFlag === undefined ? undefined : Number(rawFlag);
  const requested = flag ?? (process.argv.includes('--once') ? 1 : integerEnv('AGENT_WORKER_MAX_TASKS', 0, 0, 100_000));
  if (!Number.isFinite(requested) || requested < 0) throw new Error('--max-tasks must be a non-negative integer.');
  return Math.floor(requested);
}

const delay = (ms: number) => new Promise<void>(resolveDelay => setTimeout(resolveDelay, ms));

async function runWorker(client: AnthropicModelClient): Promise<void> {
  const repository = { completeAgentTask, failTask };
  const workerId = `agent-worker-${process.pid}-${randomUUID().slice(0, 8)}`;
  const maxTasks = parseMaxTasks();
  const once = process.argv.includes('--once');
  const pollMs = integerEnv('AGENT_WORKER_POLL_MS', 1_000, 250, 10_000);
  let shouldStop = false;
  let processed = 0;
  process.once('SIGINT', () => { shouldStop = true; process.stderr.write('Stopping after the active agent task finishes.\n'); });
  process.once('SIGTERM', () => { shouldStop = true; process.stderr.write('Stopping after the active agent task finishes.\n'); });

  process.stdout.write(`Agent worker ready (model ${client.model}, poll ${pollMs}ms).\n`);
  while (!shouldStop && (!maxTasks || processed < maxTasks)) {
    const claim = claimNextTask(workerId, 5 * 60_000);
    if (!claim) {
      if (once) break;
      if (maxTasks && processed >= maxTasks) break;
      await delay(pollMs);
      continue;
    }
    process.stdout.write(`Claimed ${claim.assignedRole} task ${claim.id}.\n`);
    try {
      await dispatchClaimedTask(claim, { repository, client });
      processed += 1;
      process.stdout.write(`Completed task ${claim.id}.\n`);
    } catch (error) {
      processed += 1;
      const message = error instanceof Error ? error.message.slice(0, 700) : 'Agent task failed.';
      process.stderr.write(`Task ${claim.id} failed: ${message}\n`);
    }
  }
  process.stdout.write(`Agent worker stopped after ${processed} task${processed === 1 ? '' : 's'}.\n`);
}

try {
  loadLocalEnvironment();
  // Fail before claiming work when the model configuration is incomplete.
  const client = new AnthropicModelClient();
  void runWorker(client).catch(error => {
    process.stderr.write(`${error instanceof Error ? error.message : 'Agent worker failed.'}\n`);
    process.exitCode = 1;
  });
} catch (error) {
  const message = error instanceof AgentModelConfigurationError ? error.message : (error instanceof Error ? error.message : 'Invalid agent worker configuration.');
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
