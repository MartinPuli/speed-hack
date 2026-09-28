export const initialWorkspaceMigration = `
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  demo_mode INTEGER NOT NULL CHECK (demo_mode = 1),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS demo_sessions (
  token_hash TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS demo_sessions_expiry_idx ON demo_sessions(expires_at);

CREATE TABLE IF NOT EXISTS brief_versions (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (workspace_id, version)
);

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  catalog_event_id TEXT,
  title TEXT NOT NULL,
  state TEXT NOT NULL,
  action TEXT NOT NULL,
  fit REAL,
  rationale TEXT NOT NULL,
  evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (workspace_id, id)
);
CREATE INDEX IF NOT EXISTS opportunities_workspace_idx ON opportunities(workspace_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  brief_version INTEGER NOT NULL,
  opportunity_id TEXT,
  error TEXT,
  idempotency_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (workspace_id, idempotency_key),
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS runs_workspace_idx ON runs(workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  opportunity_id TEXT,
  assigned_role TEXT NOT NULL,
  objective TEXT NOT NULL,
  status TEXT NOT NULL,
  input_refs_json TEXT NOT NULL DEFAULT '[]',
  result_refs_json TEXT NOT NULL DEFAULT '[]',
  result_json TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  lease_owner TEXT,
  lease_until TEXT,
  idempotency_key TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS tasks_idempotency_idx ON tasks(workspace_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS tasks_claim_idx ON tasks(status, created_at);
CREATE INDEX IF NOT EXISTS tasks_run_idx ON tasks(workspace_id, run_id, created_at);

CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  run_id TEXT NOT NULL,
  opportunity_id TEXT,
  role TEXT NOT NULL,
  kind TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE,
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS timeline_workspace_idx ON timeline_events(workspace_id, created_at);

CREATE TABLE IF NOT EXISTS drafts (
  id TEXT NOT NULL,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  fields_json TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (id, version),
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS drafts_workspace_idx ON drafts(workspace_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS inbound_replies (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  message TEXT NOT NULL,
  simulated INTEGER NOT NULL CHECK (simulated = 1),
  created_at TEXT NOT NULL,
  UNIQUE (workspace_id, message_id),
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);
`;
