import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'docs', 'screenshots');

fs.mkdirSync(outDir, { recursive: true });

const demoProgress = {
  version: 2,
  completedLessonIds: ['lesson-1'],
  completedStepIds: {
    'lesson-1': [
      'step-1-what-is-json',
      'step-2-objects-and-pairs',
      'step-3-strings-and-numbers',
      'step-4-booleans-and-null',
      'step-5-arrays-and-nested-data',
      'step-6-strict-syntax-rules',
    ],
  },
  currentLessonId: 'lesson-1',
  currentStepIndex: 5,
  completedChallengeIds: [
    'case-1-missing-quote',
    'case-2-trailing-comma',
    'case-3-missing-comma',
    'case-4-mismatched-brackets',
    'case-5-single-quotes',
  ],
  currentChallengeIndex: 4,
  hintsUsedByChallenge: {
    'case-1-missing-quote': 0,
    'case-2-trailing-comma': 0,
    'case-3-missing-comma': 0,
    'case-4-mismatched-brackets': 0,
    'case-5-single-quotes': 0,
  },
  earnedXpEvents: [
    'lesson-lesson-1',
    'challenge-case-1-missing-quote',
    'challenge-case-2-trailing-comma',
    'challenge-case-3-missing-comma',
    'challenge-case-4-mismatched-brackets',
    'challenge-case-5-single-quotes',
  ],
  totalXp: 225,
  unlockedStickerIds: [
    'json-beginner',
    'structure-explorer',
    'perfect-syntax',
    'bug-hunter',
    'json-champion',
  ],
  lastActiveTimestamp: 1729300000000,
};

async function run() {
  console.log('Starting Vite server for screenshot capture...');
  const server = await createServer({
    configFile: path.join(rootDir, 'vite.config.ts'),
    root: rootDir,
    server: {
      host: '127.0.0.1',
      port: 5188,
    },
  });

  await server.listen();
  const address = server.httpServer?.address();
  const port = typeof address === 'object' && address?.port ? address.port : 5188;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Vite server listening at ${baseUrl}`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });

    // 1. Format & Validate
    console.log('Capturing 01-format-validate.png...');
    {
      const context = await browser.newContext({
        viewport: { width: 1600, height: 1100 },
        deviceScaleFactor: 1,
        colorScheme: 'dark',
      });
      const page = await context.newPage();
      await page.goto(baseUrl);
      await page.getByRole('button', { name: 'Load sample' }).click();
      await page.getByRole('button', { name: 'Format' }).click();
      await page.getByRole('status').waitFor({ state: 'visible' });
      await page.locator('#format-output .cm-content').waitFor({ state: 'visible' });
      await page.getByText('Object keys').waitFor({ state: 'visible' });
      await page.waitForTimeout(400);

      await page.screenshot({
        path: path.join(outDir, '01-format-validate.png'),
        fullPage: true,
      });
      await context.close();
    }

    // 2. Compare JSON
    console.log('Capturing 02-compare-json.png...');
    {
      const context = await browser.newContext({
        viewport: { width: 1600, height: 1100 },
        deviceScaleFactor: 1,
        colorScheme: 'dark',
      });
      const page = await context.newPage();
      await page.goto(baseUrl);
      await page.getByRole('tab', { name: 'Compare JSON' }).click();
      await page.locator('#compare-original .cm-content').waitFor({ state: 'visible' });
      await page.locator('#compare-modified .cm-content').waitFor({ state: 'visible' });
      // Direct compare without Load sample
      await page.getByRole('button', { name: 'Compare' }).click();
      await page.getByText('$["user"]["name"]').waitFor({ state: 'visible' });
      await page.getByText('$["user"]["role"]').waitFor({ state: 'visible' });
      await page.getByRole('status').filter({ hasText: /difference/i }).waitFor({ state: 'visible' });
      await page.waitForTimeout(400);

      await page.screenshot({
        path: path.join(outDir, '02-compare-json.png'),
        fullPage: false,
      });
      await context.close();
    }

    // 3. Search JSON
    console.log('Capturing 03-search-json.png...');
    {
      const context = await browser.newContext({
        viewport: { width: 1600, height: 1100 },
        deviceScaleFactor: 1,
        colorScheme: 'dark',
      });
      const page = await context.newPage();
      await page.goto(baseUrl);
      await page.getByRole('tab', { name: 'Search JSON' }).click();
      await page.getByRole('button', { name: 'Load sample' }).click();
      await page.getByLabel('Query').fill('email');
      await page.getByRole('button', { name: 'Search' }).click();
      await page.getByText('$["profile"]["email"]').waitFor({ state: 'visible' });
      await page.waitForTimeout(400);

      await page.screenshot({
        path: path.join(outDir, '03-search-json.png'),
        fullPage: false,
      });
      await context.close();
    }

    // 4. Learn & Play Dashboard
    console.log('Capturing 04-learn-play.png...');
    {
      const context = await browser.newContext({
        viewport: { width: 1600, height: 1100 },
        deviceScaleFactor: 1,
        colorScheme: 'dark',
      });
      const page = await context.newPage();
      await page.goto(baseUrl);
      await page.getByRole('tab', { name: 'Learn & Play' }).click();
      await page.getByText('JotJSON PlayLab').first().waitFor({ state: 'visible' });
      await page.getByLabel(/Byte the JSON mascot/i).first().waitFor({ state: 'visible' });
      await page.getByText('JSON Basics').first().waitFor({ state: 'visible' });
      await page.waitForTimeout(400);

      await page.screenshot({
        path: path.join(outDir, '04-learn-play.png'),
        fullPage: false,
      });
      await context.close();
    }

    // 5. Syntax Detective
    console.log('Capturing 05-syntax-detective.png...');
    {
      const context = await browser.newContext({
        viewport: { width: 1600, height: 1100 },
        deviceScaleFactor: 1,
        colorScheme: 'dark',
      });
      const page = await context.newPage();
      await page.goto(baseUrl);
      await page.getByRole('tab', { name: 'Learn & Play' }).click();
      await page.getByRole('tab', { name: 'Syntax Detective' }).click();
      await page.getByRole('heading', { name: /The Unquoted String/i }).waitFor({ state: 'visible' });
      await page.locator('#challenge-editor .cm-content').waitFor({ state: 'visible' });
      await page.getByText(/Case Briefing/i).waitFor({ state: 'visible' });
      await page.waitForTimeout(400);

      await page.screenshot({
        path: path.join(outDir, '05-syntax-detective.png'),
        fullPage: false,
      });
      await context.close();
    }

    // 6. Sticker Book (Isolated context with seeded demo progress)
    console.log('Capturing 06-sticker-book.png...');
    {
      const context = await browser.newContext({
        viewport: { width: 1600, height: 1100 },
        deviceScaleFactor: 1,
        colorScheme: 'dark',
      });
      await context.addInitScript((seed) => {
        localStorage.setItem('jotjson-learning-progress:v2', JSON.stringify(seed));
      }, demoProgress);

      const page = await context.newPage();
      await page.goto(baseUrl);
      await page.getByRole('tab', { name: 'Learn & Play' }).click();
      await page.getByRole('tab', { name: 'Stickers' }).click();
      await page.getByRole('heading', { name: /Sticker Book & Achievements/i }).waitFor({ state: 'visible' });
      await page.getByTestId('sticker-card-json-beginner').waitFor({ state: 'visible' });
      await page.getByTestId('sticker-card-structure-explorer').waitFor({ state: 'visible' });
      await page.getByTestId('sticker-card-perfect-syntax').waitFor({ state: 'visible' });
      await page.getByTestId('sticker-card-bug-hunter').waitFor({ state: 'visible' });
      await page.getByTestId('sticker-card-json-champion').waitFor({ state: 'visible' });
      await page.waitForTimeout(400);

      await page.screenshot({
        path: path.join(outDir, '06-sticker-book.png'),
        fullPage: false,
      });
      await context.close();
    }

    console.log('All 6 screenshots captured successfully in docs/screenshots/');
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.close();
  }
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
