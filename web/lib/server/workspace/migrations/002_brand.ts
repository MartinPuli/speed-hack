export const brandWorkspaceMigration = `
CREATE TABLE IF NOT EXISTS company_brands (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  source_url TEXT NOT NULL,
  submission_id TEXT NOT NULL,
  data_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (workspace_id, source_url)
);
CREATE TABLE IF NOT EXISTS event_design_briefs (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  input_hash TEXT NOT NULL,
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (workspace_id, input_hash)
);
CREATE TABLE IF NOT EXISTS event_page_previews (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  opportunity_id TEXT,
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
