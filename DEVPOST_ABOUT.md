## Inspiration
I'm Martín. I organize events twice a month in Argentina and I've attended hundreds. At the events I run, sponsors were always the weak point. Sometimes 100 people show up and the budget doesn't even cover the food. Or a company spends $25,000 on a sponsorship and doesn't win a single new user.

Events need **taste**. A cybersecurity hackathon in a military-base museum is not the same as one in a café. So we built GrowthX: **the intelligence and taste layer for event creation.**

## What it does
You paste your company's website, pick a goal, describe who you want in the room and set a budget. After that, a team of four agents builds your event plan with no further clicks:

- **Noa (Lead)** decides what to do next and proposes an original event you could host.
- **Ari (Producer)** designs that event with your brand, using Taste. The design covers the setting, the people, the feeling, the image, the table and the budget. Ari also creates a private landing page.
- **Atlas (Scout)** searches our event catalog and only saves opportunities it can back with evidence.
- **June (Partnerships)** drafts a sponsorship inquiry with questions for the organizer. If an organizer replies, June interprets the reply and Lead replans.

You can watch each agent work live and edit every draft. When a draft is ready, you can copy the event to Luma, Eventbrite or Partiful. The agents never send, publish or pay for anything without a human.

## How we built it
- **Brainbase Labs:** each role runs as a managed Brainbase agent thread using the `claude_code` harness. GrowthX executes the tools with validated schemas and evidence checks.
- **Anthropic:** Claude is the model behind every agent decision.
- **Cloudflare:** the app is deployed on Workers. Each session gets its own SQLite Durable Object, and Durable Object alarms run the queued agent tasks. Long tasks pause and later resume the same Brainbase thread.
- **Taste Labs:** the Brand API extracts the company's identity and supplies the event's art direction.
- **Data:** a catalog of 21,747 event records with source provenance, built from open-licensed datasets.
- **Stack:** React, TypeScript, Vite, MapLibre and SQLite.

Agents coordinate only through persisted tasks, with strict limits on tool calls, tasks and retries. Failures stay visible and can be retried.

## Challenges we ran into
- **Getting agents to finish reliably.** Our early runs ended without a valid result. We fixed this by requiring structured completion, bounding the number of rounds and enforcing handoffs between roles.
- **Running long agent work within Cloudflare Workers limits.** Tasks now pause and resume from Durable Object alarms.
- **Staying honest about the data.** A sponsor logo is not a paid deal, and a listed event is not a confirmed one. Uncertainty is part of every record.

## Accomplishments that we're proud of
- A live, deployed team of four agents that goes from a website to a branded, editable event plan. In one live run, all five tasks across the four roles succeeded without human input.
- A real replan triggered by an organizer's reply. That reply was simulated.
- A durable agent runtime built and deployed in a single day.

## What we learned
Most of the work in agent autonomy is not the model. It is the runtime around it: making the agent finish, bounding it, resuming it and saving its results safely.

## What's next for GrowthX: your autonomous event team
- **A real inbox:** organizer emails in, and outreach sent after human approval.
- **Slack and Linear:** approvals where teams already work.
- **Native publishing** to Luma and Eventbrite.
- **Accounts,** and a catalog that updates continuously.
- **Weekly proposals:** the team suggests new events at the start of each week.
- **Business model:** a $50/month subscription through Stripe. Billing is not built yet. We spent today talking to event organizers.

**Honest notes:**
- Organizer replies are simulated for now.
- `/demo` replays results recorded from today's live runs; new prompts run live.
- The agent portraits are AI-generated.
- Some map, date and evidence helpers come from our earlier open-source repo, GrowthX-for-hackaton.
