# Event GTM — hackathon build brief

**Startup Speedrun Hackathon · 28 September 2026 · hacking ends 3:30 PM PDT**  
**Primary track:** Autonomous Organizations. **Optional secondary track:** Agents That Deploy Infrastructure, if the agents actually deploy and operate a customer-facing artifact. Do not bolt on payments without a real transaction and budget workflow.

## One-line pitch

**Paste your company's website. An autonomous event growth team finds the right rooms, plans the right gatherings, and turns opportunities into action.**

## What we are building

A proactive Event GTM workspace for companies. The user supplies a website and answers a tiny onboarding. The product infers a proposed company profile, asks the user to correct it, and shows a living map of relevant event opportunities. A team of agents researches, prioritizes, coordinates outreach and prepares events the company could host. The product persists the company's preferences, decisions, drafts, conversations and outcomes, then revisits opportunities as facts change.

This is not merely an event directory. Each opportunity has a **reason to act, evidence, an owner, a next step and a status**. The agents continue working after the user leaves.

### Core jobs

1. **Go where your buyers are:** identify upcoming events worth attending, speaking at or sponsoring.
2. **Create the room:** propose an owned event or side event, then prepare its event page and execution brief.
3. **Bring the right people together:** find organizers, cohosts and prospective sponsors, open a conversation through a verified channel after approval, and update the plan when they respond.

The research already in `MartinPuli/speed-hack/event-gtm-2026-09-28/` is the factual starting point. Its README describes an exploratory dataset, not a production app or proof that any sponsor paid or would renew. The repo's research contains multiple phases and counts; read the specific manifest for any number shown in the demo. Do not claim universal coverage.

## Experience: five screens, almost no configuration

### 1. Welcome and account

- Sign in with a simple account flow. Prefer Google sign-in if the chosen auth provider is ready; offer email as a fallback.
- Allow website entry immediately. Persist the account and company workspace before starting long-running research.
- On return, skip onboarding and land on the saved workspace with changes since the last visit.

### 2. Mini onboarding

Start with **company website**. Extract a *proposed* company name, product, audience, industry, markets and brand cues. Show the extracted values for correction. Ask at most four short questions:

1. What outcome matters now? (customers, partnerships, hiring, community, launch)
2. Who do you want in the room?
3. Which cities or regions and dates matter?
4. What is your approximate event budget?

Include an optional free-text goal. Distinguish website facts, model inference and user-confirmed preferences. If extraction fails, let the user type a one-sentence company description; do not block entry.

### 3. Living opportunity map

The map occupies most of the screen, with a synchronized, compact list of the **top three opportunities**. Think of Luma's approachable event discovery, with a company's decision layer on top. Use warm light surfaces, generous space, good photography, precise typography and restrained motion. Do not make the page look like an enterprise analytics dashboard.

| Visual | Meaning |
| --- | --- |
| Green circle | Upcoming event with date and location verified from a source |
| Amber circle | Potential opportunity with a material fact to confirm |
| Violet circle | Proposed event that this company could organize; explicitly a concept |
| Blue circle | Active plan with assigned tasks or a conversation underway |
| Gray circle | Past edition used only as historical context |

Circle size represents **relative fit within the current user's shortlist**, not probability of success or ROI. Color represents state, not confidence. Give every marker a text label and a matching list item so color is never the only cue. Cluster dense points; avoid giant overlapping bubbles. Support city, timeframe, event type and budget filters. Online events belong in the list, not at invented coordinates. If the research knows only a city/region, show a city-level area or list item marked “location approximate”; never invent a venue pin. The uploaded research reports substantial location gaps and no coordinates for its initial corpus, so a real geocoding/verification step is needed for precise pins.

Clicking a circle opens one excellent card: title, cover, verified date/location, why it matters *for this company*, evidence links, unknowns, expected spend if known, and one primary action: **Explore plan** or **Create my event**.

### 4. Opportunity room

Show the agents' work as a concise activity timeline, not a wall of AI chat:

- “Scout verified the 2026 edition and its date.”
- “Strategist recommends a side event because sponsorship exceeds your budget.”
- “Partnerships prepared a question for the organizer. Review before sending.”
- “Organizer replied: a workshop slot is available.”
- “Producer updated the concept and draft.”

Tabs or compact sections: **Plan**, **People**, **Evidence**, **Activity**. Every fact has a source and verification date. Every suggestion has a next action. Material unknowns remain visible.

### 5. Event studio and Luma-ready draft

Opening a violet opportunity reveals a beautiful **event page preview**, branded for the company: cover image or intentional graphic, title, short description, target audience, format, proposed agenda, host, date/time/location if confirmed, and CTA. Beside the preview, keep a private production brief: rationale, budget assumptions, possible cohosts/sponsors, tasks, outstanding decisions and source links.

The user can edit the few fields that matter and press **Prepare for Luma** to get clean copy and supported fields. The draft autosaves and remains editable after logout. Luma's documented create API creates an event and does not expose a documented draft state in the reviewed contract; therefore the hackathon product's “draft” is stored **locally**. Do not label it “created on Luma” unless an authorized integration has actually created it. A future Create on Luma action needs the user's Luma credentials, required fields, exact payload review and explicit authorization.

## Taste is a product function

The website serves two purposes: commercial understanding and visual identity. Taste Labs' Brand API describes URL-based extraction of logos, palette, typography and other brand cues, plus brand adherence verification. If credentials and time permit, use it for the company profile and event-page design. Its extraction can take minutes, so render the map and a tasteful neutral preview first; apply the brand when ready. If the API is unavailable, use a deliberately designed neutral theme rather than random gradients or fabricated brand assets.

Design rules: one strong display typeface and one readable body face; restrained palette; event photography or credible editorial graphics; few visible controls; polished empty/loading/error states; no fake metrics, stock avatar committee or endless chat bubbles. The finished event preview should feel shareable. The map remains calm and readable.

## The autonomous Event GTM team

Each role is a real worker with a bounded toolset, shared durable state and the ability to request work from another role. A renamed sequence of four prompts does not demonstrate an autonomous organization.

| Agent | Owns | Tools it may use | Output |
| --- | --- | --- | --- |
| **GTM Lead** | Goal, priorities, assignment, decisions within policy | Read brief and opportunity state; create/assign tasks; request review | Decision and next tasks |
| **Event Scout** | Candidate discovery and fact checking | Query event catalog; inspect source evidence; request targeted refresh | Verified candidate or explicit unknown |
| **Opportunity Strategist** | Choose attend/sponsor/speak/host; explain fit and tradeoffs | Read brief, candidates, history and constraints | Ranked action proposal with rationale |
| **Partnerships Agent** | Organizer, cohost and sponsor conversations | Read verified contact channels; draft outreach; process inbound reply | Contact plan, proposed message, reply summary |
| **Event Producer** | Owned event concept and execution | Read brand, brief and research; edit event draft and tasks | Luma-ready local draft and private brief |
| **Learning Agent** *(after MVP)* | Feedback and outcomes | Read explicit user decisions and campaign results | Updated preferences and evaluation record |

For today's demo, implement the first **four or five** roles. A deterministic dispatcher wakes an agent when it receives a task or a relevant external event. Agents communicate through **typed task records**, not private, uninspectable conversations.

Example handoff:

```text
Scout → GTM Lead: Event E17 confirmed for October; sponsor price unknown.
GTM Lead → Partnerships: Verify package and workshop availability; cap $2,000.
Partnerships → GTM Lead: Organizer says sponsor package is $5,000; workshop possible.
GTM Lead → Producer: Drop sponsor path; prepare workshop and side-event option.
Producer → user: Updated branded event draft, budget and next decisions.
```

Each task needs `workspace_id`, `opportunity_id`, `assigned_role`, `objective`, `input_refs`, `status`, `result_refs`, `created_at` and `updated_at`. Each decision stores the brief version, evidence IDs, rationale and action. Repeated jobs must not duplicate outreach or event creation. A changed date, budget or reply should invalidate dependent proposals and trigger a revised plan.

### Boundaries for external actions

Research and drafting can proceed autonomously within a small run budget. Contacting a real person, publishing an event or spending money needs an explicit approved action. Show the exact recipient, channel, content and account first. Receiving a response can restart the internal team automatically. For the demo, use an organizer inbox controlled by the team, so the end-to-end reply is real and safe to repeat.

## Data model and minimum architecture

Keep two distinct layers:

1. **Shared event catalog:** imported and versioned editions, series, organizers, roles, claims, source URLs, timestamps and location precision. A sponsor listing is not a verified payment. A previous edition does not confirm the next edition.
2. **Private company workspace:** users, company profile, briefs, preferences, opportunities, tasks, messages, approvals, local event drafts, feedback and outcomes.

Suggested minimal tables/collections: `users`, `workspaces`, `workspace_members`, `company_profiles`, `brief_versions`, `event_editions`, `event_claims`, `opportunities`, `agent_tasks`, `agent_events`, `contact_channels`, `outreach_threads`, `approval_requests`, `event_drafts`, `feedback`.

Server APIs can be small: `POST /onboard`, `GET /map`, `GET /opportunities/:id`, `POST /opportunities/:id/plan`, `POST /tasks/:id/run`, `POST /drafts`, `PATCH /drafts/:id`, `POST /approvals/:id/decision`, `POST /inbound/reply`. Derive workspace scope from the authenticated session. Log agent steps and error states. Persist data server-side; browser local storage alone is not a user account.

Do not feed the entire dataset to a model. Filter by city/date/type first, fetch a handful of candidates and their supporting claims, then ask agents to explain or plan. Store original values, source and verification date. If there is no usable contact or location, say so and create a verification task. Keep outbound credentials out of research agents.

## Hackathon scope and order

The judges need one compelling loop, not every feature from the long-term vision.

**P0 — must work live**

1. User signs in, enters a website, confirms a short profile and chooses city/goal/budget.
2. Map displays a small, genuine shortlist from the uploaded dataset; each point has its correct status and source.
3. Click one event; show why it fits and a visible agent task timeline.
4. Agents propose an owned side event; Producer makes a polished, editable, autosaved Luma-ready local draft.
5. Simulate or receive a reply from an inbox the team controls; GTM Lead reassigns work and the plan visibly changes.
6. Refresh/sign out/sign back in; profile, opportunity, agent history and draft are still there.

**P1 — only after P0 is reliable:** Taste Brand API, real approved outbound email to the controlled inbox, geographically accurate pins after geocoding, optional Cloudflare production deployment, Luma authenticated create action.

**Cut for today:** universal scraping, global coverage claims, mass outreach, ROI prediction, ticket purchase, unsupervised spending, a generic chat interface and a full CRM.

### Demo script (about 90 seconds)

1. “We pasted a startup website and told our event growth team the goal: meet AI infrastructure buyers in SF.”
2. Show the map and one green verified event plus one violet event concept. Click the strongest opportunity and show its source-backed reason.
3. Show GTM Lead assigning Scout, Partnerships and Producer distinct tasks. Open the branded event preview and its Luma-ready copy.
4. Trigger the controlled organizer reply: sponsorship is over budget, but a workshop is possible. Watch the agent tasks and recommendation change; the blue active marker and draft update.
5. Reload: the team, decision and draft persist. End: “This team keeps working between visits.”

## Acceptance checklist

- Onboarding is under a minute and permits correction of inferred fields.
- A returning user lands on their saved company workspace.
- Marker color and size have separate, legible meanings; no invented coordinates.
- At least one real catalog event includes source URL and verification date.
- An owned event is labeled as a proposal, never as a confirmed listing.
- Agent roles create and consume persisted tasks; an inbound reply changes another agent's task and the visible plan.
- Draft edits survive page reload and produce a usable Luma-ready package.
- No demo screen claims that an email was sent, a sponsor committed, a venue was booked or a Luma event was created unless that action occurred.

## Sources and starting points

- Research repo: https://github.com/MartinPuli/speed-hack/tree/main/event-gtm-2026-09-28
- Original product/research prompt: https://github.com/MartinPuli/speed-hack/blob/main/event-gtm-2026-09-28/inputs/prompt-maestro.md
- Luma discovery help: https://help.luma.com/p/searching-for-events
- Luma Create Event API: https://docs.luma.com/reference/post_v1-events-create
- Taste Labs Brand API: https://tastelabs.com/api

**Working name:** Event GTM / Growth Atlas. Choose a final brand after the working demo is stable.
