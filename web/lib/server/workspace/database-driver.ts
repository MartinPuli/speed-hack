import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { initialWorkspaceMigration } from './migrations/001_initial';
import { brandWorkspaceMigration } from './migrations/002_brand';

let cachedDatabase: { path: string; db: DatabaseSync } | undefined;

function databasePath(): string {
  const configured = process.env.EVENT_GTM_WORKSPACE_PATH?.trim();
  return resolve(configured || resolve(process.cwd(), '.data', 'workspace.sqlite'));
}

export function database(): DatabaseSync {
  const path = databasePath();
  if (cachedDatabase?.path === path) return cachedDatabase.db;
  if (cachedDatabase) cachedDatabase.db.close();
  mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  database.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;');
  database.exec('CREATE TABLE IF NOT EXISTS workspace_schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)');
  const migrationExists = database.prepare('SELECT 1 FROM workspace_schema_migrations WHERE version = 1').get();
  if (!migrationExists) {
    database.exec('BEGIN IMMEDIATE');
    try {
      database.exec(initialWorkspaceMigration);
      database.prepare('INSERT INTO workspace_schema_migrations(version, applied_at) VALUES(1, ?)').run(now());
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      database.close();
      throw error;
    }
  }
  database.exec(brandWorkspaceMigration);
  cachedDatabase = { path, db: database };
  return database;
}


function now(): string { return new Date().toISOString(); }
export function workspaceCacheScope(): object { return database(); }
export function transaction<T>(operation: () => T): T {
  const db = database(); db.exec('BEGIN IMMEDIATE');
  try { const result = operation(); db.exec('COMMIT'); return result; }
  catch (error) { db.exec('ROLLBACK'); throw error; }
}
