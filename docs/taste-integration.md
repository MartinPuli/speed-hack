# Taste integration and hackathon status

Updated September 28, 2026.

## Implemented

- Preserved the GrowthX map, photo cards and minimal two-step onboarding while pulling the persistent agent backend from `origin/main` through `cbe5f0b`.
- Real server-side Taste client: company extraction, asynchronous result polling, logo/palette/type/tone normalization, and brand-grounded event-design prompts. Credentials never cross into the browser.
- Extraction verified against Taste’s API for `https://tastelabs.com/`. The completed result identifies Taste, supplies five palette entries and a monochrome logo. Its cached extraction timestamp is September 21, 2026, not a fresh September 28 crawl.
- Company brand, design briefs and private event-page previews persist in the operational SQLite database, separately from the research catalog.
- Owned-event Draft tab has **Design with Taste**. This uses prompt enhancement and provisions a private event preview using the extracted identity. It does not publish on Luma or open registration.
- Onboarding writes a server brief and seeds the researched Taste opportunities/drafts. Draft edits retain local fallback and also save to the versioned server record when the workspace is available.
- The prompt composer submits work to the existing durable agent runtime; suggested research questions remain shortcuts into the researched demo.
- Lead/Strategist, Scout, Partnerships and Producer can read the company brand and curated opportunity evidence. Producer can call Taste and provision a private event-page preview. Roles remain bounded; no raw shell, arbitrary SQL, outbound email or spending tools were added.

## Current limits

- The local environment has a working Taste credential. It does not yet have the Anthropic model, API key and workspace ID required by the pulled agent runtime. A complete live multi-role run has therefore not been demonstrated here. The interface must not substitute fake agent results.
- The account is the repository’s shared demo session, not multi-user authentication.
- Private `/preview/:id` pages run on the current Next.js app. They are persistent local artifacts, **not proof of the Infrastructure track**. That track requires an agent to deploy and operate an actual production artifact with a configured hosting target.
- Taste prompt enhancement rewrites a creative/design prompt using brand context. It does not replace the team’s general reasoning, verified event research, cost comparison or task coordination.
- The Taste Labs research demo does not claim arbitrary-company research or complete global coverage.

## Running

1. Configure `TASTE_API_KEY` in ignored `web/.env.local`.
2. Configure `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` and `ANTHROPIC_WORKSPACE_ID` for the live team.
3. Run the Next app and `pnpm worker` from `web/`.
4. Complete the Taste Labs brief, ask the team for a concrete action, and inspect the resulting persistent draft.
5. Use **Design with Taste** to prepare the branded event preview. Publishing remains a separate operation.

## What counts for Autonomous Organizations

Demonstrate a real goal-driven loop: Lead assigns work; Scout inspects evidence; Partnerships interprets a clearly labeled controlled organizer reply; Lead changes the plan when a quote exceeds budget; Producer updates the draft. Preserve tasks, evidence, decisions and human edits across a refresh. The pasted hackathon description gives Slack/Linear as examples of coordination surfaces; shared durable task records implement the coordination, but actual execution still needs to be shown.

## Primary API documentation

- https://docs.tastelabs.com/quickstart
- https://docs.tastelabs.com/concepts/design-system
- https://docs.tastelabs.com/concepts/prompt-enhancement
- https://docs.tastelabs.com/api-reference/endpoint/enhance-prompt
