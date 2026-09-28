# GrowthX: Devpost submission kit

Startup Speedrun Hackathon · track: Autonomous Organizations · submissions close at 3:30 PM PDT

---

## 1. Form fields (copy and paste)

**Project name**
GrowthX: your autonomous event team

**Elevator pitch** (172 chars)
Tell GrowthX your company, goal and budget. A team of Claude agents finds the events to host or sponsor, cites evidence, drafts outreach, and replans when organizers reply.

**Track:** Autonomous Organizations

**Built with**
anthropic, claude, next.js, react, typescript, node.js, sqlite, maplibre, openfreemap, python, taste-labs-brand-api

**Links**
- Code: https://github.com/MartinPuli/speed-hack (**make it public first**)
- Demo video: <YouTube, unlisted>
- Live product: <Cloudflare Tunnel URL, only if we open one>
- Public post: <link to X/LinkedIn post tagging @BrainbaseHQ>

---

## 2. About the project (Markdown for Devpost)

### Inspiration
Startups spend thousands of dollars a quarter on events, and most of those choices come from stale directories, a sponsor logo wall and a hunch. Doing it properly takes a growth person days: finding which rooms actually have your buyers, what they really cost, who to contact and what to host yourself. Listing events is already a commodity. Deciding what to do, backing it with evidence and then acting on it is not. That work is what we wanted to hand to a team of agents.

### What it does
GrowthX is an event growth team made of agents.

1. **Brief.** You enter your company website, a goal (product adoption, partnerships or community), who you want in the room, and a budget.
2. **Plan.** You get an event plan with events to **host** and events to **sponsor**, shown on a map. Each opportunity comes with a recommendation, a budget broken into lines (each line has a stated basis, plus a 15% contingency and staff hours), dated source links, the open unknowns, and an editable draft. For a hosted event the draft is page copy you can copy to Luma. For a sponsorship it is a partnership inquiry.
3. **Agents at work.** You type a request to your event team ("find one more partnership for AI builders under our budget") and it becomes a durable run for four Claude agents:
   - **Lead** reads the brief and decides which role works next.
   - **Scout** searches a 21.7k-event evidence catalog. It can only save an opportunity it has inspected, and every evidence ID it attaches must belong to that event.
   - **Partnerships** drafts outreach and reads organizer replies. Outreach is saved as a draft and never sent.
   - **Producer** is designed to turn a plan into a draft event page that uses the company's brand from the Taste Labs Brand API. It has not completed a live run yet.
4. **Replanning.** When an organizer replies, the team revises the plan by itself. In a run earlier today with a $2,000 brief, we injected this simulated organizer reply: *"Sponsorship is USD 5,000. We can also offer a workshop, but its price has not been confirmed."* From there no human was involved. Partnerships interpreted the reply and handed it to Lead. Lead ruled out the sponsorship as over budget, kept the workshop only as a conditional option, and listed five open blockers, citing catalog evidence IDs where the catalog had them. The replanned FLOCK card (its text starts with "REPLAN v2") is live in the app, and every step is a persisted task in the timeline.
5. **A human approves anything irreversible.** Nothing is sent, published or paid without one.

Our demo customer is **Taste Labs**. We researched a real plan for them: 3 events to host and 5 sponsorships in San Francisco and worldwide, each with costs and sources. The Taste plan was researched today and loaded as seed data, and the agents extend and replan it live. We have not contacted Taste and nothing has been booked. It is a researched demo, not a partnership.

### How we built it
- **Agents:** Claude (`claude-sonnet-4-6`) on the Anthropic Messages API, using strict tool schemas. Each role has its own tool allowlist. A task finishes only when the agent calls `completeTask` with a structured result: summary, findings, confidence, blockers and the next recommended action.
- **Coordination:** agents never call each other directly. They coordinate through a durable SQLite task queue with leases, retries and idempotency keys. A separate worker process claims and runs the tasks. Each task can queue at most one follow-up for another role, and the runtime enforces some handoffs (Scout → Lead, and organizer reply → Partnerships → Lead).
- **Guardrails:**
  - Only one Scout pass per run.
  - Caps on tool calls, model rounds and tasks.
  - Every evidence ID is checked against the catalog.
  - Fetched web pages are treated as untrusted input, behind an SSRF guard.
  - Each task's effects are applied in a single atomic transaction.
  - A result is thrown away if the brief changed while the task ran.
  - A failed run stays failed and is never hidden behind a later success.
- **Data:** a read-only SQLite catalog with 21,747 event editions, 461k provenance assertions and 608 sources, including about 270 upcoming tech conferences. It was built from open-licensed sources (confs.tech, conferences.computer.science, Helsinki Linked Events), with robots.txt checks and rate limits. When a source blocked us or its robots.txt could not be read, we dropped it rather than working around it.
- **App:** Next.js 16, React 19 and TypeScript, with MapLibre and OpenFreeMap for the map. Drafts are versioned and autosave. Private branded preview pages live at `/preview/:id`.
- **Quality:** 44 automated tests pass, including 16 agent-runtime tests that use a fake model client. TypeScript typecheck is clean.

### Sponsor tools
- **Anthropic.** Claude powers all four agents through tool use with strict schemas. It is the whole decision layer: picking roles, searching, choosing opportunities, drafting, and interpreting replies.
- **Taste Labs** (today's panel). We wrote a client for their Brand API (brand extraction and event-page art direction) so generated event pages can match the company's brand. It needs an API key, and it was not exercised live in this build.
- *(Only if we open the tunnel)* **Cloudflare:** we used Cloudflare Tunnel to expose the running build for judging.
- Not used: Stripe, Brainbase Labs.

### What we got done today (honest status)
**Working today**
- The agent team really ran. Today Claude completed 17 tasks across Lead, Scout and Partnerships, all persisted with a timeline.
- The full reply → reinterpret → replan loop.
- A plan UI with a map, budgets, sources and editable drafts.
- The evidence catalog and the test suite.

**Not done yet**
- The **Producer** agent has not completed a live run yet. It hit timeouts and output limits. Branded previews (`/preview/:id`) are meant to come from a direct Taste call, which needs a `TASTE_API_KEY` that this build does not have.
- Organizer replies are **simulated**. The API rejects any reply that is not flagged `simulated: true`. No email is sent or received.
- Onboarding is hard-coded to tastelabs.com, and the Taste plan was researched today and loaded as seed data.
- The three suggestion chips return scripted answers. The typed prompt is what calls the agents.
- There is no Slack or Linear surface, no payments and no production deploy.

**Pre-existing code (disclosed):** a MapLibre map component, date utilities, evidence-formatting helpers and CSS come from our earlier public open-source repo ([Julian0444/GrowthX-for-hackaton](https://github.com/Julian0444/GrowthX-for-hackaton), last pushed September 17). Everything else was written today: the agent runtime, task queue, worker, four roles, planning UI, Taste client and tests. The first commit in this repo is at 10:45 AM PT. The event dataset was compiled by research scripts on September 28.

### Challenges we ran into
- **Getting agents to actually finish.** 4 of our first 6 live runs failed: invalid final results, too many rounds, and agents that ended without completing. We fixed most of this with forced structured completion, one repair attempt, bounded rounds and runtime-enforced handoffs. We kept the failures visible instead of hiding them.
- **Staying honest about the data.** Most public event data is stale or skewed. A sponsor logo is not a paid deal, and a listed event is not a confirmed one. We made uncertainty a first-class field.
- **Autonomy without damage.** We wanted agents that decide on their own but never send, publish or spend.

### Accomplishments we're proud of
- A real multi-agent replan, triggered by an organizer's reply and backed by evidence IDs.
- A durable agent runtime (queue, leases, atomic effects, idempotent inbound replies) built and tested in one day.

### What we learned
Most of the difficulty in agent autonomy is in the runtime around the model: getting the model to finish, bounding it, recovering when it fails, and writing its effects atomically. The model itself was the easier part. Structured completion plus hard budgets beat longer prompts.

### What's next
- **Any website:** Taste brand extraction becomes a draft brief automatically.
- **Real inbox:** organizer emails arrive through a webhook, and outreach goes out from an approval queue.
- **Slack/Linear:** the agents post tasks and ask for approvals where the growth team already works.
- **Luma:** publish events after a human approves them.
- **Cloudflare:** deploy on Workers + D1.
- **Business model** (hypothesis): about $299 per month per company for a continuous event radar plus drafts, and later a success fee on sponsorships we negotiate. Our cost model estimates about $0.14 of model and search cost per research workflow, against about $6.67 of equivalent human review time.

---

## 3. Demo video script (2:30, team on camera)

**Before recording (5 min)**
1. In `web/`, run `pnpm worker` in a second terminal. Without it, prompts stay on "preparing…" forever.
2. Rehearse one typed prompt. Each task takes about 30–70 s. Record the wait, cut it, and put a caption on the cut such as "[52 s skipped, real run]".
3. Skip "Design with Taste": `TASTE_API_KEY` is missing from `web/.env.local`, so it will error. If someone on the team has a Taste key, add it and restart `pnpm dev`, then show 5 seconds of the preview.
4. Use the **typed** prompt, not the chips.

| Time | On screen | What we say |
|---|---|---|
| 0:00–0:15 | **Team on camera** | "We're [names]. Startups spend thousands on events chosen from a hunch. Today we built GrowthX: an event growth team made of agents." |
| 0:15–0:30 | Welcome screen | "You give it your company, your goal and your budget. Our demo customer is Taste Labs, from today's panel. We researched a plan for them; we haven't contacted them." |
| 0:30–0:40 | Enter `tastelabs.com` → brief → **See my event plan** | "Product adoption, AI builders, $15k." |
| 0:40–1:10 | Plan + map → open **From brand to build** → Budget and Sources tabs → Draft | "Events to host and to sponsor. Every number has a stated basis, every fact has a dated source, and the unknowns are listed. The draft is ready for Luma, but nothing gets published." |
| 1:10–1:20 | Sponsor card → **Outreach** tab | "Partnerships drafts the outreach. It's never sent without a human." |
| 1:20–1:55 | Split screen: type into **Ask your event team…** + worker terminal (Claimed lead task → scout → lead) | "This is the real team: four Claude agents on a durable queue. Lead decides who works next, and Scout searches the 21,747-event catalog and can only save opportunities that cite real evidence. That prompt just ran several tasks across two agents with no clicks from us." |
| 1:55–2:15 | **FLOCK** card ("REPLAN v2…") → Review plan | "In a run earlier today with a $2,000 brief, we injected a simulated organizer reply: sponsorship is $5,000. From there no human was involved. Partnerships interpreted it, Lead ruled out the sponsorship, kept the workshop as a conditional option and listed the open blockers." |
| 2:15–2:30 | **Team on camera** | "What's still missing: the Producer agent hasn't finished a live run yet, and the organizer replies are simulated. Next up are a real inbox, Slack and Luma. That's GrowthX." |

---

## 4. Public post (required, pass/fail)

**X** (≈274 chars counting the link)
> We built GrowthX at the @BrainbaseHQ Startup Speedrun: an autonomous event team for startups. Claude agents pick the events to host or sponsor, cite the evidence, draft outreach and replan when an organizer replies. Nothing gets sent without a human. [link]

**LinkedIn** (tag the Brainbase Labs company page)
> Today at the Startup Speedrun Hackathon (Brainbase Labs × Anthropic × Cloudflare × Stripe) we built GrowthX: an event growth team made of agents.
>
> You give it your company, goal and budget. Four Claude agents (Lead, Scout, Partnerships, Producer) coordinate through a durable task queue. They find the events worth hosting or sponsoring, back every choice with evidence from a 21k-event catalog, draft the outreach, and replan by themselves when an organizer replies. Nothing is sent or published without a human.
>
> Built today at Cloudflare HQ. [video/repo link]

---

## 5. Checklist (in order)

- [ ] **Now:** make the repo public (`gh repo edit MartinPuli/speed-hack --visibility public --accept-visibility-change-consequences`), or give the organizers access.
- [ ] Create the Devpost project and **submit a draft now** with the text and repo link. Edit it until 3:30.
- [ ] Add every teammate on Devpost.
- [ ] `pnpm worker` running, then rehearse one prompt.
- [ ] Record the video with the team on camera (2–3 min) and upload it to YouTube as **unlisted**.
- [ ] Post on X/LinkedIn tagging @BrainbaseHQ and paste the link.
- [ ] (Optional) `cloudflared tunnel --url http://localhost:3010` for a live link during judging.
