// Overnight visual review helper adapted from the archived portfolio script.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const OUT = process.env.SCREENSHOT_OUT ?? 'review/v1-rebuild';

// Discover real routes from the running site so this works with fixtures and live Notion alike.
async function firstLink(browser, listPath, prefix) {
  const page = await browser.newPage();
  try {
    await page.goto(BASE + listPath, { waitUntil: 'networkidle' });
    const hrefs = await page.$$eval('a[href]', (links) => links.map((link) => link.getAttribute('href')));
    return hrefs.find((href) => href?.startsWith(prefix) && href.replace(/\/$/, '') !== prefix.replace(/\/$/, '')) ?? null;
  } finally {
    await page.close();
  }
}

const discoveryBrowser = await chromium.launch();
const postPath = await firstLink(discoveryBrowser, '/posts', '/posts/');
const projectPath = await firstLink(discoveryBrowser, '/projects', '/projects/');
await discoveryBrowser.close();

const routes = [
  ['home', '/'],
  ['posts', '/posts'],
  ...(postPath ? [['post', postPath]] : []),
  ['loop', '/loop'],
  ['projects', '/projects'],
  ...(projectPath ? [['project', projectPath]] : []),
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

    if (name === 'home' && width >= 1100) {
      const tidyButton = page.locator('[data-tidy-button]');
      const restoreButton = page.locator('[data-restore-button]');
      await tidyButton.click();
      if (!(await restoreButton.isVisible())) {
        errors.push(`[${viewportName}] organized home is missing its restore control`);
      }
      await page.screenshot({
        path: `${OUT}/home-organized--${viewportName}.png`,
        fullPage: true,
      });
      await restoreButton.click();
      if ((await page.locator('[data-home-desk]').getAttribute('data-tidy')) !== 'false') {
        errors.push(`[${viewportName}] restore control did not return the messy desk`);
      }
    }
  }

  await context.close();
}

await browser.close();

if (errors.length) {
  console.error('\n=== SCREENSHOT ERRORS ===');
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(`Saved ${routes.length * viewports.length + 1} screenshots to ${OUT}.`);
}
