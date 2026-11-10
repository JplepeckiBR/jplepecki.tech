// Overnight visual review helper adapted from the archived portfolio script.
import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const OUT = 'review/v1-rebuild';

async function fixturePostPath() {
  try {
    const fixture = JSON.parse(await readFile('fixtures/notion.json', 'utf8'));
    const post = fixture.posts?.find((entry) => entry.slug);
    return post ? `/posts/${post.slug}` : null;
  } catch {
    return null;
  }
}

const postPath = await fixturePostPath();
const routes = [
  ['home', '/'],
  ['posts', '/posts'],
  ...(postPath ? [['post', postPath]] : []),
  ['loop', '/loop'],
  ['projects', '/projects'],
  ['styleguide', '/styleguide'],
];
const viewports = [
  ['390', 390, 844],
  ['1440', 1440, 1000],
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const errors = [];

for (const [viewportName, width, height] of viewports) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`[${viewportName}] ${page.url()} :: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    errors.push(`[${viewportName}] ${page.url()} :: PAGEERROR ${error.message}`);
  });

  for (const [name, route] of routes) {
    const response = await page.goto(BASE + route, { waitUntil: 'networkidle' });
    if (response && response.status() >= 400) {
      errors.push(`[${viewportName}] ${route} returned HTTP ${response.status()}`);
    }
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `${OUT}/${name}--${viewportName}.png`,
      fullPage: true,
    });
  }

  await context.close();
}

await browser.close();

if (errors.length) {
  console.error('\n=== SCREENSHOT ERRORS ===');
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(`Saved ${routes.length * viewports.length} screenshots to ${OUT}.`);
}
