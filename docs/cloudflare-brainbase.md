# GrowthX — Brainbase + Taste on Cloudflare

Public app: https://growthx-event-team.mpulitano1701.workers.dev/

## Runtime

The same GrowthX React map and onboarding ship as Vite static assets on a Cloudflare Worker. The Next.js development app remains available with `pnpm dev` and `pnpm worker`.

Each signed anonymous browser session has a separate SQLite Durable Object. Briefs, role tasks, opportunities, evidence, draft revisions, event previews and activity survive browser closure. Durable Object alarms execute queued tasks. Brainbase hosts the managed `claude_code` agent threads with `machine_kind: cloudflare`; its server credential is never sent to the browser or included in agent prompts.

Four bounded roles coordinate through persisted tasks:

- **Noa / Lead:** selects the next action and proposes original owned events.
- **Atlas / Scout:** searches a read-only snapshot of the research catalog and follows its cited official sources.
- **June / Partnerships:** writes private sponsor inquiries or interprets an explicitly simulated reply.
- **Ari / Producer:** designs the venue character, guest mix, invitation, art direction, atmosphere, food and budget assumptions; creates a versioned event draft and branded preview.

Each role uses Brainbase for real model decisions. Workspace tools execute in GrowthX, with validated schemas and evidence checks. Brainbase's persisted transcript supports reconstruction of a task interrupted by deployment. Worker invocations yield after twenty Brainbase requests, then resume the same conversation with a fresh subrequest budget. Manual retry preserves successful roles and resumes unfinished tasks. A run permits one catalog research pass, at most ten tasks, bounded tool calls and retries. Anonymous workspaces are capped at eight new runs per hour. This is a hackathon deployment, not full account authentication.

## Taste

The company website is submitted to Taste. The extracted identity supplies logo, imagery, palette, typography and audience. `design/prompts/enhance` grounds the event experience and page direction. The Producer uses that result to write the concept. Cover images use extracted brand assets; the app does not claim to generate new raster photography.

The event page is a private, persistent route on the already-deployed app. No new external Luma event, registration system, venue reservation or payment is created. Platform actions copy event details for Luma, Eventbrite and Partiful; they are not native API publishing connections.

## Deploy

From `web/`:

```sh
pnpm install --frozen-lockfile
pnpm deploy
```

`build:cloudflare` exports the original catalog's upcoming technology records for September 28, 2026–January 1, 2027, preserving source IDs and evidence. The catalog snapshot is generated and ignored; the research SQLite file stays unchanged.

Set `BRAINBASE_API_KEY`, `TASTE_API_KEY`, and `SESSION_SECRET` as Wrangler secrets. Never use `NEXT_PUBLIC_` or Vite variables for them. `.env.local` is local only. Do not rotate `SESSION_SECRET` during routine deployments because that would invalidate workspace cookies.

`/api/health` reports provider configuration without exposing credentials. The crew panel shows actual role state, Brainbase thread IDs and persisted activity. A provider failure remains visible and can be retried.

## Boundaries

The catalog is bounded, not an open-web search. Budgets and owned venues remain proposals until confirmed. The agents do not send messages, buy sponsorships or publish public registrations. Native platform publication would require the corresponding calendar/account credentials and a confirmed date and venue.

## Observed live execution

On September 28, the deployed Brainbase Lead created an original owned event and delegated to Producer. Producer completed `Build Night`, persisted all six experience sections, called Taste prompt enhancement (3,625 characters of returned brand direction), and provisioned the private preview `/preview/63c54204bbaec44bbea0104b` in its anonymous workspace. The next Scout task started from that persisted handoff. This preview is workspace scoped; the route is not a public invitation.
