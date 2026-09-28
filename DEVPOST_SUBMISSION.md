# GrowthX: Devpost submission kit

Startup Speedrun Hackathon · track: Autonomous Organizations · submissions close at 3:30 PM PDT

Live: https://growthx-event-team.mpulitano1701.workers.dev/

---

## 1. Form fields (copy and paste)

**Project name**
GrowthX: your autonomous event team

**Elevator pitch** (≤200 chars)
Events need taste. Paste your website and a team of agents plans events that fit your brand and budget: venue, guests, experience, sponsors and a landing page, ready for Luma.

**Track:** Autonomous Organizations

**Built with**
brainbase, anthropic, claude, cloudflare-workers, durable-objects, taste-labs-brand-api, react, typescript, vite, next.js, sqlite, maplibre, openfreemap, python

**Links**
- Live product: https://growthx-event-team.mpulitano1701.workers.dev/
- Prepared demo (instant): https://growthx-event-team.mpulitano1701.workers.dev/demo
- Code: https://github.com/MartinPuli/speed-hack (**make it public first**)
- Demo video: <YouTube, unlisted>
- Public post: <link to X/LinkedIn post tagging @BrainbaseHQ>

---

## 2. About the project (Markdown for Devpost)

### Inspiration
I'm Martín. I organize events twice a month in Argentina and I've attended hundreds. At the events I run, sponsors were always the weak point. Sometimes 100 people show up and the budget doesn't even cover the food. Or a company spends $25,000 on a sponsorship and doesn't win a single new user. Maybe that's your case too.

Events need **taste**. A cybersecurity hackathon in a military-base museum is not the same as one in a café. So we built GrowthX: **the intelligence and taste layer for event creation.**

### What it does
GrowthX is an event growth team made of agents.

1. **Paste your website.** Taste's Brand API reads your company's logo, imagery, palette, typography and audience.
2. **Give a short brief.** Choose a goal (product adoption, partnerships or community), who you want in the room, and a budget.
3. **The team starts by itself.** Your plan opens empty ("Shaping your first event…") and fills in as four agents work through persisted tasks, with no further clicks. Every card and map pin is agent output:
   - **Noa (Lead)** decides the next action and proposes an original event you could host.
   - **Ari (Producer)** designs that event across six sections: the setting, the people, the feeling, the image, the table and the budget. Ari also writes the invitation copy. The result is a versioned, fully editable event draft and a private landing page in your brand, grounded by Taste.
   - **Atlas (Scout)** searches our evidence catalog of upcoming tech events and follows the official sources it cites. It can only save an opportunity it has inspected, with evidence that belongs to that event.
   - **June (Partnerships)** writes a private sponsorship inquiry with numbered questions for the organizer. When an organizer replies, June interprets the reply and hands it back to Lead to replan.
4. **You watch, steer and approve.** The **Your crew** button opens the "Your event team" panel. It shows each agent's live state, its Brainbase session and an activity timeline, with a **Try again** button if a task fails.
   - **Steer:** ask the team anything, or tap *Create an event*, *Find a sponsorship* or *Improve my plan* to start a new run.
   - **Edit:** change every field of a draft, including date, venue and the six experience sections, then use **Update landing from draft**.
   - **Take it out:** copy the event to Luma, Eventbrite or Partiful, or download the full brief.
5. **Nothing irreversible happens without a human.** The agents never send email, buy a sponsorship or publish a registration.

In one live run on the deployed app, all five tasks across the four roles succeeded with no human steps in between:
1. Lead proposed an original event and delegated it to Producer.
2. Producer completed "Build Night". It filled in all six experience sections, used Taste's prompt enhancement for brand direction, and provisioned a private branded landing.
3. Scout saved a sourced opportunity from the catalog (FLOCK).
4. Lead flagged that opportunity's weak audience fit.
5. Partnerships wrote a private inquiry with eight clarifying questions.

The run then stopped in `waiting_input` for human review.

**Prepared demo:** `/demo` opens instantly on a Taste Labs workspace recorded from our live Brainbase runs today. It includes the real Taste brand extraction and the original task and thread IDs. We edited the short card descriptions and the budget arithmetic for presentation. The crew panel labels this as completed example work, and any new prompt runs live.

Earlier, in a local run with a $2,000 brief, we injected a simulated organizer reply: *"Sponsorship is USD 5,000. We can also offer a workshop, but its price has not been confirmed."* From there no human was involved. Partnerships interpreted the reply, and Lead ruled out the sponsorship as over budget. Lead kept the workshop as a conditional option and listed five open blockers, citing catalog evidence IDs where they existed.

### How we built it
- **Brainbase Labs:** each role runs as a managed Brainbase agent thread (`claude_code` harness, `machine_kind: cloudflare`). GrowthX gives the agent a strict JSON tool protocol, runs the tools on its own server with validated schemas and evidence checks, and returns the results. Brainbase's persisted transcript lets us rebuild a task that a deployment interrupted.
- **Cloudflare:** the app runs as a Cloudflare Worker, and the React UI is served as static assets from it. Each signed anonymous session gets its own **SQLite Durable Object**, which stores briefs, tasks, opportunities, evidence, draft revisions, previews and activity. **Durable Object alarms** run the queued agent tasks and survive restarts. When a Worker invocation reaches 20 Brainbase requests, it pauses and later resumes the same thread with a fresh request budget. Observability is on.
- **Anthropic:** Claude is the model behind the agents, running through Brainbase's `claude_code` harness in production. The local Next.js build calls the Anthropic Messages API directly (`claude-sonnet-4-6`), with strict tool schemas and a separate queue worker.
- **Taste Labs:** we call the Brand API to extract a company's identity from its website, and use `design/prompts/enhance` for the event's art direction. The resulting brand drives the preview page.
- **Coordination:** agents never call each other directly. Each task finishes with a structured `completeTask` result (summary, findings, confidence, blockers, next action) and can queue one follow-up task for another role. The runtime enforces some handoffs, such as Scout → Lead and reply → Partnerships → Lead.
- **Guardrails:**
  - Limits per run: one catalog research pass, at most ten tasks, and capped tool calls and retries. Each workspace can start at most 8 runs an hour.
  - Evidence IDs are checked against the catalog.
  - Fetched web text is treated as untrusted input.
  - Each task's effects are applied atomically.
  - A failed run stays visible, and retrying it keeps the roles that already succeeded.
- **Data:** a research catalog with 21,747 event editions, 461k provenance assertions and 608 sources. It was built from open-licensed sources (confs.tech, conferences.computer.science, Helsinki Linked Events) with robots.txt checks and rate limits. The Worker ships a read-only snapshot of the upcoming tech events (Sep 28, 2026 to Jan 1, 2027), and every record keeps its source IDs.
- **Frontend and tests:** React 19, TypeScript, MapLibre and OpenFreeMap. There are automated Node tests for the agent runtime, persistence and the catalog, and the runtime tests use a fake model client.

### Sponsor tools
- **Brainbase Labs:** hosts all four agents as managed threads.
- **Cloudflare:** hosts the whole product, using Workers, static assets, SQLite Durable Objects, alarms and observability.
- **Anthropic:** Claude is the reasoning model behind the agents, through Brainbase in production and the Messages API directly in local development.
- **Taste Labs** (today's panel): the Brand API handles brand extraction and prompt enhancement.
- Not used: Stripe.

### What we got done today (honest status)
**Working**
- The deployed app accepts any company website.
- Taste reads the company's brand.
- The four-agent team starts from the brief, and its progress is persisted and shown live.
- Producer creates a branded event draft and a private preview.
- Scout does evidence-backed research.
- Partnerships drafts sponsorship inquiries.
- Retry and resume work, and the live view reconnects by itself ("Reconnecting to your team… Your work continues in the background.").

**Not done yet**
- Organizer replies are **simulated**. The reply endpoint only accepts messages flagged `simulated: true`, and the UI has no button for it. No email is sent or received.
- "Copy to Luma/Eventbrite/Partiful" copies the details. It is not native publishing.
- There are no user accounts, only anonymous signed sessions.
- The catalog is a bounded snapshot, not open-web search, and its coverage of San Francisco is thin.
- Budgets and venues are proposals until someone confirms them.
- There are no payments.
- The example map on the welcome screen is a static sample. The plan itself is built by the agents.
- The portraits of Noa, Atlas, June and Ari are AI-generated fictional characters.

**Pre-existing code (disclosed):** a MapLibre map component, date utilities, evidence-formatting helpers and CSS come from our earlier public open-source repo ([Julian0444/GrowthX-for-hackaton](https://github.com/Julian0444/GrowthX-for-hackaton), last pushed Sep 17). Everything else was written today: the agent runtime, the Brainbase and Cloudflare integration, the Durable Object workspace, the four roles, the planning UI, the Taste integration and the tests. The first commit in this repo is at 10:45 AM PT. The event dataset was compiled by research scripts on Sep 28.

### Challenges we ran into
- **Getting agents to actually finish.** Early runs failed with invalid final results, too many rounds, and agents that ended without completing. We fixed most of this with forced structured completion, one repair attempt, bounded rounds and handoffs enforced by the runtime. Failures stay visible and can be retried.
- **Running long agent work inside Workers limits.** A Worker invocation can only make so many requests. We made tasks pause after a budget of Brainbase requests and resume the same thread from a Durable Object alarm.
- **Staying honest about the data.** A sponsor logo is not a paid deal, and a listed event is not a confirmed one. We treat uncertainty as a first-class field.
- **Autonomy without damage.** We wanted agents that decide on their own but never send, publish or spend anything.

### Accomplishments we're proud of
- A deployed team of four agents, hosted on Brainbase and Cloudflare. It goes from a company website to a branded, editable event plan with no human steps in between, and in our live run all five tasks succeeded.
- A real replan triggered by an organizer's reply.
- Durable agent runs (tasks, leases, alarms, resume, atomic effects), built in one day.

### What we learned
Most of the difficulty in agent autonomy is in the runtime around the model: getting the model to finish, bounding it, recovering and resuming it, and writing its effects atomically. The model itself was the easier part.

### What's next
- **Real inbox:** organizer emails arrive through a webhook, and outreach goes out from an approval queue.
- **Slack/Linear:** agents post tasks and ask for approvals where the growth team already works.
- **Native publishing:** Luma and Eventbrite, after a human approves.
- **Accounts** and a broader catalog that updates continuously.
- **Business model:** a $50/month subscription, charged through Stripe. We haven't built the checkout yet. We spent the day talking to event organizers, and several were interested.

---

## 3. Demo video script (2:30, team on camera)

**Before recording**
1. **Use `/demo` for the walkthrough.** It loads instantly and shows recorded results from our live runs. For the autonomy proof, also record one live prompt on the main URL: a full run takes several minutes, and Noa's first task alone took over 2 min when we tested. Cut the waits and caption each cut, for example "[2 min skipped, real run]". Say on camera that `/demo` is a recording of today's runs.
2. Use a real website. Taste works with any company. As a backup, "Explore the Taste Labs demo" runs the same live team on tastelabs.com.
3. Click **Your crew** (top right) to open the "Your event team" panel. Expand each agent's **Brainbase session** so the thread ID shows on camera, and keep the **Activity** timeline in view. That panel is the proof of autonomy.

| Time | On screen | What we say |
|---|---|---|
| 0:00–0:25 | **Martín on camera** | "I'm Martín. I organize events twice a month in Argentina and I've attended hundreds. Sponsors were always the problem. Sometimes 100 people show up and the budget doesn't cover the food. Or a company spends $25,000 and doesn't win a single new user. Maybe that's your case." |
| 0:25–0:35 | **Team on camera** | "Events need taste. A cybersecurity hackathon in a military-base museum isn't the same as one in a café. So we built GrowthX, the intelligence and taste layer for event creation." |
| 0:35–0:50 | Website → **Build my event plan** → brief → **See my event plan** | "You paste your website and add a few details. Here's our example, Taste Labs." |
| 0:50–1:20 | **Your crew** → Noa, Ari, Atlas and June working, with their Brainbase sessions and activity timeline | "From here the agents are proactive. They analyze your brand and context, then propose. Four agents on Brainbase talk to each other through persisted tasks, all running on Cloudflare." |
| 1:20–1:50 | "Create" card → **Experience** (The setting, The people, The feeling, The image, The table, The budget) → **Share** → **Open landing** | "They generate the event: date, venue and budget, the ideal guests, the experience, and a landing page in your brand. You can prompt for new ideas or edit anything." |
| 1:50–2:05 | **Share** → Luma / Eventbrite / Partiful → "Partner" card → **Partnership inquiry** | "It's ready to publish on Luma, Eventbrite or Partiful. And the sponsors they suggest come with evidence, not guesses. Nothing is sent without you." |
| 2:05–2:30 | **Martín on camera** | "We spent today talking to organizers, and they want this. It'll be $50 a month through Stripe. That's GrowthX: events with taste, within your budget." |

---

## 4. Public post (required, pass/fail)

**X** (≈270 chars counting the link)
> We built GrowthX at the @BrainbaseHQ Startup Speedrun: paste your website and 4 agents on Brainbase plan an original event, design it with your brand, find sponsorships and draft the outreach. Live on @Cloudflare. Nothing sent without a human. [link]

**LinkedIn** (tag the Brainbase Labs company page)
> Today at the Startup Speedrun Hackathon (Brainbase Labs × Anthropic × Cloudflare × Stripe) we built GrowthX, an event growth team made of agents.
>
> You paste your company's website. Taste reads your brand. Then four agents running on Brainbase (Noa, Ari, Atlas and June) coordinate through persisted tasks. They propose and design an original event with a private branded landing, research existing events with evidence, and draft the sponsorship outreach. Every line is editable. Nothing is sent or published without a human.
>
> It runs on Cloudflare Workers + Durable Objects. Built today at Cloudflare HQ. Try it: https://growthx-event-team.mpulitano1701.workers.dev/

---

## 5. Checklist (in order)

- [ ] **Now:** make the repo public (`gh repo edit MartinPuli/speed-hack --visibility public --accept-visibility-change-consequences`), or give the organizers access.
- [ ] Create the Devpost project and **submit a draft now** with the text, the live link and the repo link. Edit it until 3:30.
- [ ] Add every teammate on Devpost.
- [ ] Record the video with the team on camera (2–3 min) and upload it to YouTube as **unlisted**.
- [ ] Post on X/LinkedIn tagging @BrainbaseHQ and paste the link.
