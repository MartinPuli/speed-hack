# Prepared event demo

Open `/demo` for a ready-to-present Taste Labs workspace. The welcome screen links to it. Loading the demo does not start another model run or consume Taste credits.

- **Build Night** — an owned event concept with an editable invitation, agenda, six experience sections and a private Taste landing.
- **Beyond Generic Output** — a second owned event with real brand artwork, an editable experience and a private landing. Its $12,100–17,500 estimate explicitly flags the possible $2,500 overrun against the $15,000 cap.
- **FLOCK** — a real catalog event with a drafted sponsorship inquiry. This is a lead to qualify: audience fit, availability, package and price remain unconfirmed. No inquiry has been sent.

The two owned events are alternatives, not a combined spending plan. All dates and venues for them remain proposals.

## Provenance

`web/lib/demo/prepared-taste-plan.json` contains recorded results from live Brainbase runs on September 28, 2026, plus actual Taste brand extraction and prompt enhancement. It includes original task and thread identifiers. The two producer sessions are `5acbd29e-6ac9-44d8-9716-d871cdcfe71d` and `44087061-8403-4110-a9a3-7c552804662c`. Short card descriptions and the corrected budget arithmetic were edited for presentation.

Imported task records are marked `brainbase.archived`; the timeline records `demo.loaded`. The crew explicitly identifies this as completed example work. New prompts use the live Brainbase integration.

## Persistence

`POST /api/demo/plan` requires the existing signed workspace session. It imports examples once, preserves existing drafts and decisions, refuses to replace another company's brief, and leaves an active agent run in progress. Private previews belong to the current workspace. Each browser session gets a separate prepared-demo workspace on Cloudflare, preserving its original live plan. Demo requests select that workspace with the X-GrowthX-Workspace header; private demo previews use /demo/preview/.

Portrait sources and prompts: [agent-portraits.md](agent-portraits.md).
