import assert from 'node:assert/strict';
import test from 'node:test';
import { composeResearchBrief } from '../lib/drafts/export.ts';
import type { ResearchBrief } from '../lib/contracts/event-gtm.ts';

test('brief export preserves unknown budget and distinguishes supplied website from research', () => {
  const brief: ResearchBrief = {
    company: 'Data team', website: 'https://www.python.org', objective: 'feedback',
    audience: 'Python developers', topics: 'python', geography: 'Germany', from: '', to: '',
    budget: '', currency: 'USD', constraints: '',
  };
  const output = composeResearchBrief(brief, []);
  assert.match(output, /Buyer budget: Unknown; not zero/);
  assert.match(output, /not automatically researched/);
  assert.match(output, /No events selected/);
  assert.match(output, /not a Luma event/);
  assert.doesNotMatch(output, /USD 0/);
});
