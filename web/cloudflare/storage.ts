import { AsyncLocalStorage } from 'node:async_hooks';
import { initialWorkspaceMigration } from '../lib/server/workspace/migrations/001_initial';
import { brandWorkspaceMigration } from '../lib/server/workspace/migrations/002_brand';

const current = new AsyncLocalStorage<DurableObjectStorage>();
export function initialize(storage: DurableObjectStorage) {
  storage.transactionSync(() => {
    storage.sql.exec(initialWorkspaceMigration);
    storage.sql.exec(brandWorkspaceMigration);
  });
}
export function inWorkspace<T>(storage: DurableObjectStorage, operation: () => T): T {
  return current.run(storage, operation);
}
function storage() {
  const value = current.getStore();
  if (!value) throw new Error('A workspace storage context is required.');
  return value;
}
export function database() {
  return {
    prepare(query: string) {
      return {
        get: (...args: (string | number | null)[]) => storage().sql.exec(query, ...args).toArray()[0],
        all: (...args: (string | number | null)[]) => storage().sql.exec(query, ...args).toArray(),
        run: (...args: (string | number | null)[]) => { storage().sql.exec(query, ...args).toArray(); return { changes: Number(storage().sql.exec('SELECT changes() AS count').one().count) }; },
      };
    },
  };
}
export function transaction<T>(operation: () => T): T { return storage().transactionSync(operation); }
export function workspaceCacheScope(): object { return storage(); }
