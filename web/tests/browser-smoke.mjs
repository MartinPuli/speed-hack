// Recorrido de integración sobre el servidor local y el catálogo real.
// No llama proveedores de investigación ni altera la SQLite.
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = process.env.EVENT_GTM_BASE_URL || 'http://localhost:3010';
await mkdir('test-results', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const runtimeErrors = [];
const details = [];
page.on('pageerror', error => runtimeErrors.push(error.message));
page.on('request', request => {
  if (new URL(request.url()).pathname.match(/^\/api\/events\/[^/]+$/)) details.push(request.url());
});

try {
  await page.goto(origin);
  await page.locator('.event-row').first().waitFor();
  assert.equal(await page.locator('.event-row').count(), 20);
  assert.equal(details.length, 0, 'initial list should not fetch each dossier');
  await page.waitForFunction(() => ['ready', 'error'].includes(document.querySelector('[data-map-state]')?.getAttribute('data-map-state')), null, { timeout: 20000 });
  await page.screenshot({ path: 'test-results/catalog-desktop.png', fullPage: false });

  await page.getByRole('button', { name: 'View evidence', exact: true }).first().click();
  await page.getByRole('heading', { name: 'Evidence by field', exact: true }).waitFor();
  assert.ok(await page.locator('dialog .source-record a').count() > 0);
  assert.ok(details.length < 4, 'detail reads must remain bounded');
  await page.screenshot({ path: 'test-results/event-dossier.png', fullPage: false });
  await page.getByRole('button', { name: 'Close event evidence' }).click();

  await page.getByRole('checkbox').nth(0).check();
  await page.getByRole('checkbox').nth(1).check();
  await page.getByRole('button', { name: 'Compare selected (2/3)' }).click();
  await page.getByRole('region', { name: 'Event comparison table' }).waitFor();
  assert.equal(await page.locator('.comparison-table thead th').count(), 3);
  await page.getByRole('button', { name: 'Back to catalog' }).click();

  await page.locator('.brief-panel summary').click();
  await page.getByLabel('Company or product', { exact: true }).fill('Migration verification');
  await page.getByLabel('Topics to search', { exact: false }).fill('python');
  await page.getByLabel('Country or city', { exact: true }).fill('Germany');
  await Promise.all([
    page.waitForResponse(response => response.url().includes('/api/events?') && response.url().includes('country=Germany') && response.status() === 200),
    page.getByRole('button', { name: 'Apply to catalog' }).click(),
  ]);
  await page.locator('.event-row').first().waitFor();
  assert.ok((await page.locator('.event-list').innerText()).includes('Germany'));
  await page.getByRole('heading', { name: 'No published coordinates in this view' }).waitFor();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export brief', exact: true }).click();
  const download = await downloadEvent;
  await download.saveAs('test-results/research-brief.md');
  const exported = await readFile('test-results/research-brief.md', 'utf8');
  assert.match(exported, /Migration verification/);
  assert.match(exported, /Dataset ID:/);
  assert.match(exported, /Source: https:/);
  assert.equal(download.suggestedFilename(), 'event-gtm-research-brief.md');

  await page.reload();
  await page.locator('.event-row').first().waitFor();
  assert.equal(await page.getByLabel('Company or product', { exact: true }).inputValue(), 'Migration verification');

  await page.getByRole('searchbox').fill('zzzxqvnomatchingevent');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('heading', { name: 'No events match these filters' }).waitFor();
  await page.getByRole('button', { name: 'Reset filters', exact: true }).last().click();
  await page.locator('.event-row').first().waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/catalog-mobile.png', fullPage: false });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'mobile viewport must not overflow horizontally');
  assert.deepEqual(runtimeErrors, [], 'browser runtime errors');
  const degraded = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await degraded.route('https://tiles.openfreemap.org/**', route => route.abort());
  await degraded.goto(origin);
  await degraded.locator('.event-row').first().waitFor();
  await degraded.getByText('Map unavailable', { exact: true }).waitFor();
  assert.equal(await degraded.locator('.event-row').count(), 20);
  await degraded.screenshot({ path: 'test-results/map-fallback.png', fullPage: false });
  await degraded.close();
  console.log('Browser smoke passed: paginated catalog, on-demand evidence, comparison, brief persistence, export, empty state, mobile and map failure fallback.');
} finally {
  await browser.close();
}
