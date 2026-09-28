# Repository Guidelines

## Project Structure & Module Organization

Event GTM is a Next.js 16 / React 19 research workspace backed by a read-only SQLite catalog.

- `web/app/`: pages, layouts, styles, and API route handlers.
- `web/components/`: workspace UI; `events/` contains map, list, comparison, and evidence components.
- `web/lib/`: shared contracts, server database access, temporal rules, evidence helpers, and exports.
- `web/tests/`: automated tests and browser smoke checks.
- `event-gtm-2026-09-28/`: research datasets, evidence, reports, and Python acquisition/build scripts.
- `docs/`: product scope and migration notes. Consult `HACKATHON_BUILD_BRIEF.md`; distinguish planned features from implemented behavior.

## Build, Test, and Development Commands

Use Node.js >=22.13.0 and pnpm 11.8.0. From the root, restore missing `dataset.sqlite`:

```sh
gunzip -k event-gtm-2026-09-28/scale-expansion-20260928/dataset.sqlite.gz
```

Run from `web/`:

| Command | Purpose |
| --- | --- |
| `pnpm install --frozen-lockfile` | Install locked dependencies. |
| `pnpm dev` | Start development at `http://localhost:3010`. |
| `pnpm build` / `pnpm start` | Build / serve production locally. |
| `pnpm typecheck` | Check strict TypeScript types. |
| `pnpm lint` | Run ESLint with Next.js rules. |
| `pnpm test` | Run Node tests through `tsx`. |
| `pnpm test:browser` | Run Playwright smoke checks; requires Google Chrome and a running server. |

Development/build scripts generate MapLibre assets in `web/public/maplibre/`.

## Coding Style & Naming Conventions

Match TypeScript conventions: two-space indentation, single quotes, and semicolons. Use PascalCase components/types, camelCase functions/variables, and kebab-case filenames such as `event-dossier.tsx`. Use `@/` imports for web-root modules. Keep database access in `web/lib/server/` and API types in `web/lib/contracts/`. No dedicated formatter is configured.

## Testing Guidelines

Name Node tests `web/tests/*.test.ts`; use `node:test` and `node:assert/strict`. Cover changed behavior, inject fixed clocks for temporal cases, and preserve catalog immutability checks. Dataset tests require the restored SQLite file. No coverage threshold is configured. Before a PR, run tests, typecheck, lint, and build; run browser smoke checks for UI changes. Screenshots land in ignored `web/test-results/`.

## Commit & Pull Request Guidelines

History uses short imperative subjects, such as `Add Next.js event research web app`. Follow that style. Describe behavior changes, validation, and relevant issues in PRs; include desktop/mobile screenshots for visual changes.

## Configuration & Data Integrity

Use `web/.env.local` for app settings; see `web/.env.example` for `EVENT_GTM_DATASET_PATH`. Tests need overrides exported in the shell. Keep secrets and generated artifacts untracked. Preserve provenance, uncertainty, and read-only catalog access; regenerate datasets only in a separate copy.
