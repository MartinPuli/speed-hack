export type AnthropicContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown }
  | { type: string; [key: string]: unknown };

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
}

export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  strict?: boolean;
}

export interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  model: string;
  content: AnthropicContentBlock[];
  stop_reason: string | null;
  usage?: { input_tokens?: number; output_tokens?: number };
}

export interface AnthropicClientOptions {
  apiKey?: string;
  model?: string;
  workspaceId?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  maxTokens?: number;
}

export class AgentModelConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentModelConfigurationError';
  }
}

/** Continue the same durable task in a fresh worker invocation. */
export class AgentTaskYield extends Error {
  constructor() { super('Continue the agent task from its saved Brainbase conversation.'); this.name = 'AgentTaskYield'; }
}

export class AgentModelRequestError extends Error {
  readonly retryable: boolean;
  readonly status: number | null;

  constructor(message: string, status: number | null, retryable: boolean) {
    super(message);
    this.name = 'AgentModelRequestError';
    this.status = status;
    this.retryable = retryable;
  }
}

const DEFAULT_TIMEOUT_MS = 120_000;
const MAX_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_TOKENS = 1_400;
const MAX_MAX_TOKENS = 2_400;

function boundedInteger(value: number | undefined, fallback: number, max: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1_000, Math.min(max, Math.floor(value as number)));
}

function messageFromError(value: unknown): string {
  if (!value || typeof value !== 'object') return 'The model provider returned an unreadable error.';
  const error = value as { error?: { message?: unknown }; message?: unknown };
  const message = error.error?.message ?? error.message;
  return typeof message === 'string' ? message.slice(0, 500) : 'The model provider returned an error.';
}

/** A deliberately small Messages API client using only Node's built-in fetch. */
export class AnthropicModelClient {
  readonly model: string;
  private readonly apiKey: string;
  private readonly workspaceId?: string;
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;
  private readonly maxTokens: number;

  constructor(options: AnthropicClientOptions = {}) {
    const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
    const model = options.model ?? process.env.ANTHROPIC_MODEL;
    const workspaceId = options.workspaceId ?? process.env.ANTHROPIC_WORKSPACE_ID;
    if (!apiKey?.trim()) throw new AgentModelConfigurationError('ANTHROPIC_API_KEY is required to run agent tasks.');
    if (!model?.trim()) throw new AgentModelConfigurationError('ANTHROPIC_MODEL must name an explicit Anthropic model.');
    if (!/^[A-Za-z0-9._-]{1,150}$/.test(model.trim())) throw new AgentModelConfigurationError('ANTHROPIC_MODEL contains unsupported characters.');
    if (!workspaceId?.trim()) throw new AgentModelConfigurationError('ANTHROPIC_WORKSPACE_ID is required for this Anthropic API key. Set it from Anthropic Console before starting the worker.');
    this.apiKey = apiKey.trim();
    this.workspaceId = workspaceId.trim();
    if (this.workspaceId && !/^[A-Za-z0-9_-]{1,200}$/.test(this.workspaceId)) {
      throw new AgentModelConfigurationError('ANTHROPIC_WORKSPACE_ID must be a workspace ID from Anthropic Console.');
    }
    this.model = model.trim();
    this.fetcher = options.fetcher ?? fetch;
    this.timeoutMs = boundedInteger(options.timeoutMs, DEFAULT_TIMEOUT_MS, MAX_TIMEOUT_MS);
    this.maxTokens = boundedInteger(options.maxTokens, DEFAULT_MAX_TOKENS, MAX_MAX_TOKENS);
  }

  async createMessage(input: {
    system: string;
    messages: AnthropicMessage[];
    tools: AnthropicTool[];
    toolChoice?: { type: 'auto' | 'any' } | { type: 'tool'; name: string };
  }): Promise<AnthropicResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetcher('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          ...(this.workspaceId ? { 'anthropic-workspace-id': this.workspaceId } : {}),
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          system: input.system.slice(0, 18_000),
          messages: input.messages,
          tools: input.tools,
          ...(input.toolChoice ? { tool_choice: input.toolChoice } : {}),
        }),
        signal: controller.signal,
      });
      const raw = await response.text();
      let payload: unknown;
      try { payload = JSON.parse(raw); } catch {
        throw new AgentModelRequestError('Anthropic returned a non-JSON response.', response.status, response.status >= 500);
      }
      if (!response.ok) {
        const retryable = response.status === 408 || response.status === 409 || response.status === 429 || response.status >= 500;
        const providerMessage = messageFromError(payload).replaceAll(this.apiKey, '[redacted]');
        const workspaceHint = response.status === 400 && /workspace.{0,40}(id|scope)|anthropic-workspace-id|not scoped/i.test(providerMessage)
          ? ' Configure ANTHROPIC_WORKSPACE_ID with the workspace ID from Anthropic Console.' : '';
        throw new AgentModelRequestError(`Anthropic API ${response.status}: ${providerMessage}${workspaceHint}`, response.status, retryable);
      }
      if (!payload || typeof payload !== 'object' || !Array.isArray((payload as AnthropicResponse).content)) {
        throw new AgentModelRequestError('Anthropic returned an invalid Messages API response.', response.status, false);
      }
      return payload as AnthropicResponse;
    } catch (error) {
      if (error instanceof AgentModelRequestError || error instanceof AgentModelConfigurationError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AgentModelRequestError('Anthropic request timed out.', null, true);
      }
      throw new AgentModelRequestError(error instanceof Error ? error.message.slice(0, 400) : 'Anthropic request failed.', null, true);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export type AgentModelClient = Pick<AnthropicModelClient, 'model' | 'createMessage'>;
