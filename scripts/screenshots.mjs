// Review helper: screenshot every route at mobile + desktop, in light + dark.
// Not part of the build. Output goes to .review-screens/ (gitignored).
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const OUT = '.review-screens';

const routes = [
  ['home', '/'],
  ['projects', '/projects'],
  ['project-stridesense', '/projects/stridesense'],
  ['project-cardpricer', '/projects/pokemon-card-pricer'],
  ['project-homelab', '/projects/homelab-cyberdeck'],
  ['project-rag', '/projects/local-rag-corruption'],
  ['project-invest', '/projects/investment-platform'],
  ['project-pca', '/projects/pca-work'],
  ['project-vape', '/projects/vape-teardown'],
  ['project-hackathons', '/projects/hackathons'],
  ['blog', '/blog'],
  ['post-nrf', '/blog/building-stridesense-on-nrf52840'],
  ['post-finance', '/blog/finance-to-hardware'],
  ['videos', '/videos'],
  ['about', '/about'],
  ['now', '/now'],
  ['404', '/this-page-does-not-exist'],
];

const viewports = [
  ['mobile', 375, 812],
  ['desktop', 1440, 900],
];
const themes = ['dark', 'light'];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const errors = [];

for (const [vpName, width, height] of viewports) {
  for (const theme of themes) {
    const ctx = await browser.newContext({
      viewport: { width, height },
      colorScheme: theme === 'light' ? 'light' : 'dark',
      deviceScaleFactor: 1,
    });
    // Seed the persisted theme so the manual toggle state matches.
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem('theme', t);
      } catch {}
    }, theme);

    const page = await ctx.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`[${vpName}/${theme}] ${page.url()} :: ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      errors.push(`[${vpName}/${theme}] ${page.url()} :: PAGEERROR ${err.message}`);
    });

    for (const [name, path] of routes) {
      const resp = await page.goto(BASE + path, { waitUntil: 'networkidle' });
      // 404 route is expected to 404; everything else must be 200.
      if (name !== '404' && resp && resp.status() >= 400) {
        errors.push(`[${vpName}/${theme}] ${path} returned HTTP ${resp.status()}`);
      }
      await page.waitForTimeout(250);
      await page.screenshot({
        path: `${OUT}/${name}--${vpName}--${theme}.png`,
        fullPage: true,
      });
    }
    await ctx.close();
  }
}

await browser.close();

if (errors.length) {
  console.log('\n=== CONSOLE / HTTP ERRORS ===');
  for (const e of errors) console.log(e);
  console.log(`\nTotal issues: ${errors.length}`);
} else {
  console.log('No console or HTTP errors across all routes/viewports/themes.');
}
