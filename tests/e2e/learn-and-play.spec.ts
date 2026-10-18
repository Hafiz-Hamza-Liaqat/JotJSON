import { expect, test, type Page } from '@playwright/test';

async function setEditor(page: Page, editorId: string, text: string) {
  const editor = page.getByTestId(editorId).locator('.cm-content');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(text);
}

async function assertNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return doc.scrollWidth > doc.clientWidth || body.scrollWidth > doc.clientWidth;
  });
  expect(hasOverflow).toBe(false);
}

async function expectStickerStatus(page: Page, stickerId: string, status: 'Unlocked' | 'Locked') {
  const card = page.getByTestId(`sticker-card-${stickerId}`);
  await expect(card).toBeVisible();
  const statusBadge = card.getByTestId(`sticker-status-${stickerId}`);
  await expect(statusBadge).toHaveText(status);
}

async function dismissAllModals(page: Page, timeout = 2500) {
  const closeBtn = page.getByTestId('sticker-modal-close');
  try {
    await closeBtn.waitFor({ state: 'visible', timeout });
    while (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(150);
    }
  } catch {
    // No modal appeared
  }
}

const CASE_SOLUTIONS = [
  '{\n  "id": 101,\n  "username": "Alex",\n  "role": "explorer"\n}',
  '{\n  "name": "JotJSON",\n  "version": "2.0",\n  "licensed": true\n}',
  '{\n  "fruit": "Apple",\n  "color": "Red",\n  "crisp": true\n}',
  '{\n  "team": "Alpha",\n  "scores": [ 98, 95, 100 ]\n}',
  '{\n  "mascot": "Byte",\n  "active": true\n}',
];

async function completeLessonOne(page: Page) {
  await page.getByRole('tab', { name: 'Lesson 1' }).click();

  // Step 1: What is JSON?
  await page
    .getByRole('radio', {
      name: 'It is a lightweight, text-based data format that computers and humans can easily read and write.',
    })
    .click();
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Step 2: Key & Value Pairs
  await page.getByRole('radio', { name: '"username" is the KEY, and "coder_alex" is the VALUE' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Step 3: Strings vs Numbers
  await page.getByRole('radio', { name: '"25" is a STRING (text), while 25 is a NUMBER (integer)' }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Step 4: Booleans and Null
  await page.getByRole('radio', { name: 'true', exact: true }).click();
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Step 5: Arrays & Nested Data
  await page.getByRole('radio', { name: 'An ARRAY containing two nested OBJECTS' }).click();
  await dismissAllModals(page);
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Step 6: Strict JSON Syntax Rules
  await page.getByRole('radio', { name: '{ "name": "Byte", "active": true }' }).click();
  await page.getByRole('button', { name: /Finish Lesson & Claim XP/i }).click();

  await dismissAllModals(page);
}

async function completeAllDetectiveCases(page: Page) {
  await page.getByRole('tab', { name: 'Syntax Detective' }).click();

  for (let i = 0; i < CASE_SOLUTIONS.length; i++) {
    await setEditor(page, 'challenge-editor', CASE_SOLUTIONS[i]!);
    await page.getByRole('button', { name: 'Check My JSON' }).click();
    await expect(page.getByText('Case Solved!', { exact: true })).toBeVisible();

    // Achievements only unlock on Case 1 (Perfect Syntax) and Case 5 (Bug Hunter / JSON Champion)
    if (i === 0 || i === CASE_SOLUTIONS.length - 1) {
      await dismissAllModals(page);
    }

    if (i < CASE_SOLUTIONS.length - 1) {
      await page.getByRole('button', { name: 'Next Case' }).click();
    }
  }
}

test.describe('JotJSON Learn & Play E2E Workflows', () => {
  test('switches between Playground and Learn & Play, preserves state', async ({ page }) => {
    await page.goto('/');

    // Check default Playground workspace
    await expect(page.getByRole('tab', { name: 'Format & Validate' })).toBeVisible();
    await expect(page.getByTestId('format-input')).toBeVisible();

    // Switch to Learn & Play
    await page.getByRole('tab', { name: 'Learn & Play' }).click();
    await expect(page.getByText(/JotJSON PlayLab/i).first()).toBeVisible();
    await expect(page.getByRole('img', { name: /Byte the JSON mascot/i })).toBeVisible();
    await expect(page.getByText('0 XP').first()).toBeVisible();

    // Check navigation sub-tabs
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Lesson 1' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Syntax Detective' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Stickers' })).toBeVisible();

    // Switch back to Playground and verify
    await page.getByRole('tab', { name: 'Playground' }).click();
    await expect(page.getByRole('tab', { name: 'Format & Validate' })).toBeVisible();

    // Switch back to Learn & Play
    await page.getByRole('tab', { name: 'Learn & Play' }).click();
    await expect(page.getByText(/JotJSON PlayLab/i).first()).toBeVisible();
  });

  test('completes Lesson 1, displays floating +100 XP award, and unlocks JSON Beginner', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    await page.getByRole('tab', { name: 'Learn & Play' }).click();

    // Start Lesson 1
    await page.getByRole('button', { name: /Start Lesson 1/i }).click();
    await expect(page.getByRole('tab', { name: 'Lesson 1', selected: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What is JSON?' })).toBeVisible();

    // Test hint trigger
    const hintButton = page.getByRole('button', { name: /Need a hint\?/i });
    await expect(hintButton).toBeVisible();
    await hintButton.click();
    await expect(page.getByRole('region', { name: 'Hint' })).toBeVisible();

    // Step 1: Wrong answer then correct answer
    await page.getByRole('radio', { name: 'It is a proprietary compiled programming language like C++ or Rust.' }).click();
    await expect(page.getByText(/Not quite/i)).toBeVisible();

    await page.getByRole('radio', { name: 'It is a lightweight, text-based data format that computers and humans can easily read and write.' }).click();
    await expect(page.getByText(/Exactly right!/i)).toBeVisible();
    await page.getByRole('button', { name: 'Next Step' }).click();

    // Step 2: Key & Value Pairs
    await expect(page.getByRole('heading', { name: /Objects and Key\/Value Pairs/i })).toBeVisible();
    await page.getByRole('radio', { name: '"username" is the KEY, and "coder_alex" is the VALUE' }).click();
    await expect(page.getByText(/Spot on!/i)).toBeVisible();
    await page.getByRole('button', { name: 'Next Step' }).click();

    // Step 3: Strings vs Numbers
    await expect(page.getByRole('heading', { name: /Strings vs Numbers/i })).toBeVisible();
    await page.getByRole('radio', { name: '"25" is a STRING (text), while 25 is a NUMBER (integer)' }).click();
    await expect(page.getByText(/Correct!/i)).toBeVisible();
    await page.getByRole('button', { name: 'Next Step' }).click();

    // Step 4: Booleans and Null
    await expect(page.getByRole('heading', { name: /Booleans and Null/i })).toBeVisible();
    await page.getByRole('radio', { name: 'true', exact: true }).click();
    await expect(page.getByText(/Correct!/i)).toBeVisible();
    await page.getByRole('button', { name: 'Next Step' }).click();

    // Step 5: Arrays & Nested Data
    await expect(page.getByRole('heading', { name: /Arrays & Nested Data/i })).toBeVisible();
    await page.getByRole('radio', { name: 'An ARRAY containing two nested OBJECTS' }).click();
    await expect(page.getByText(/Spot on!/i)).toBeVisible();
    await dismissAllModals(page);
    await page.getByRole('button', { name: 'Next Step' }).click();

    // Step 6: Strict JSON Syntax Rules
    await expect(page.getByRole('heading', { name: /Strict JSON Syntax Rules/i })).toBeVisible();
    await page.getByRole('radio', { name: '{ "name": "Byte", "active": true }' }).click();
    await page.getByRole('button', { name: /Finish Lesson & Claim XP/i }).click();

    // Verify floating +100 XP! indicator appears in header
    await expect(page.getByText('+100 XP!')).toBeVisible();

    await dismissAllModals(page);

    // Return to dashboard
    await page.getByRole('button', { name: /Back to Learn & Play/i }).click();
    await expect(page.getByText(/JotJSON PlayLab/i).first()).toBeVisible();

    // Verify total XP updated
    await expect(page.getByLabel(/total experience points/i).first()).toHaveText(/100 XP/);

    // Check Sticker Book: JSON Beginner is unlocked, Bug Hunter and JSON Champion are locked
    await page.getByRole('tab', { name: 'Stickers' }).click();
    await expectStickerStatus(page, 'json-beginner', 'Unlocked');
    await expectStickerStatus(page, 'bug-hunter', 'Locked');
    await expectStickerStatus(page, 'json-champion', 'Locked');
  });

  test('solves Syntax Detective Case 1, displays floating +25 XP award, and unlocks Perfect Syntax', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    await page.getByRole('tab', { name: 'Learn & Play' }).click();
    await page.getByRole('tab', { name: 'Syntax Detective' }).click();

    await expect(page.getByRole('heading', { name: /The Unquoted String/i })).toBeVisible();

    // Investigation on broken code
    await page.getByRole('button', { name: 'Check My JSON' }).click();
    await expect(page.getByText(/Syntax Error/i)).toBeVisible();

    // Solve Case 1 without hints
    await setEditor(page, 'challenge-editor', '{\n  "id": 101,\n  "username": "Alex",\n  "role": "explorer"\n}');
    await page.getByRole('button', { name: 'Check My JSON' }).click();
    await expect(page.getByText('Case Solved!', { exact: true })).toBeVisible();

    // Floating XP indicator for +25 XP!
    await expect(page.getByText('+25 XP!')).toBeVisible();

    await dismissAllModals(page);

    // Advance to Case 2 and test hint trigger
    await page.getByRole('button', { name: 'Next Case' }).click();
    await page.getByRole('button', { name: 'Get Hint' }).click();
    await expect(page.getByText(/Clue 1:/i)).toBeVisible();

    // Check Sticker Book:
    // 1. Completing only first case does NOT unlock Bug Hunter
    // 2. Completing without hints unlocks Perfect Syntax
    await page.getByRole('tab', { name: 'Stickers' }).click();
    await expectStickerStatus(page, 'perfect-syntax', 'Unlocked');
    await expectStickerStatus(page, 'bug-hunter', 'Locked');
    await expectStickerStatus(page, 'json-champion', 'Locked');
  });

  test('completes all five detective cases and unlocks Bug Hunter', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    await page.getByRole('tab', { name: 'Learn & Play' }).click();

    // Solve all 5 cases
    await completeAllDetectiveCases(page);

    // Check Sticker Book: Bug Hunter is Unlocked, but JSON Champion is Locked (Lesson 1 not completed yet)
    await page.getByRole('tab', { name: 'Stickers' }).click();
    await expectStickerStatus(page, 'bug-hunter', 'Unlocked');
    await expectStickerStatus(page, 'json-champion', 'Locked');
  });

  test('unlocks JSON Champion when Lesson 1 is completed first, followed by all five detective cases', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    await page.getByRole('tab', { name: 'Learn & Play' }).click();

    // 1. Complete Lesson 1
    await completeLessonOne(page);

    // 2. Complete all 5 detective cases
    await completeAllDetectiveCases(page);

    // Check Sticker Book: JSON Champion is now Unlocked!
    await page.getByRole('tab', { name: 'Stickers' }).click();
    await expectStickerStatus(page, 'json-beginner', 'Unlocked');
    await expectStickerStatus(page, 'bug-hunter', 'Unlocked');
    await expectStickerStatus(page, 'json-champion', 'Unlocked');
  });

  test('unlocks JSON Champion when all five detective cases are completed first, followed by Lesson 1', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    await page.getByRole('tab', { name: 'Learn & Play' }).click();

    // 1. Complete all 5 detective cases first
    await completeAllDetectiveCases(page);

    // Bug Hunter is unlocked, JSON Champion is locked
    await page.getByRole('tab', { name: 'Stickers' }).click();
    await expectStickerStatus(page, 'bug-hunter', 'Unlocked');
    await expectStickerStatus(page, 'json-champion', 'Locked');

    // 2. Complete Lesson 1
    await completeLessonOne(page);

    // Check Sticker Book: JSON Champion is now Unlocked!
    await page.getByRole('tab', { name: 'Stickers' }).click();
    await expectStickerStatus(page, 'json-beginner', 'Unlocked');
    await expectStickerStatus(page, 'bug-hunter', 'Unlocked');
    await expectStickerStatus(page, 'json-champion', 'Unlocked');
  });

  test('persists progress across page reload and prevents duplicate XP or re-triggering achievements on replay', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    await page.getByRole('tab', { name: 'Learn & Play' }).click();
    await page.getByRole('tab', { name: 'Syntax Detective' }).click();

    // Solve Case 1
    await setEditor(page, 'challenge-editor', '{\n  "id": 101,\n  "username": "Alex",\n  "role": "explorer"\n}');
    await page.getByRole('button', { name: 'Check My JSON' }).click();
    await expect(page.getByText('Case Solved!', { exact: true })).toBeVisible();

    await dismissAllModals(page);

    const xpText = await page.getByLabel(/total experience points/i).first().innerText();
    expect(xpText).toBe('25 XP');

    // Reload page
    await page.reload();
    await expect(page.getByRole('tab', { name: 'Learn & Play' })).toBeVisible();
    await page.getByRole('tab', { name: 'Learn & Play' }).click();
    await expect(page.getByRole('tab', { name: 'Learn & Play', selected: true })).toBeVisible();

    // Check persisted XP
    const reloadedXpText = await page.getByLabel(/total experience points/i).first().innerText();
    expect(reloadedXpText).toBe('25 XP');

    // Verify Case 1 shows completed in Syntax Detective
    await page.getByRole('tab', { name: 'Syntax Detective' }).click();
    await expect(page.getByRole('button', { name: /Case 1 \(Completed\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next Case' })).toBeVisible();

    // Re-solving already solved Case 1 does NOT grant additional XP or floating XP
    await setEditor(page, 'challenge-editor', '{\n  "id": 101,\n  "username": "Alex",\n  "role": "explorer"\n}');
    await page.getByRole('button', { name: 'Check My JSON' }).click();
    await expect(page.getByText('Case Solved!', { exact: true })).toBeVisible();

    // Verify no floating +25 XP appears on replay
    await expect(page.getByText('+25 XP!')).not.toBeVisible();

    const postCheckXp = await page.getByLabel(/total experience points/i).first().innerText();
    expect(postCheckXp).toBe('25 XP');
  });

  test('resets learning progress safely when confirmed', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Learn & Play' }).click();
    await page.getByRole('tab', { name: 'Syntax Detective' }).click();

    // Solve Case 1
    await setEditor(page, 'challenge-editor', '{\n  "id": 101,\n  "username": "Alex",\n  "role": "explorer"\n}');
    await page.getByRole('button', { name: 'Check My JSON' }).click();
    await expect(page.getByText('Case Solved!', { exact: true })).toBeVisible();

    await dismissAllModals(page);

    // Go back to Learn & Play Dashboard
    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.getByLabel(/total experience points/i).first()).toHaveText(/25 XP/);

    // Click Reset Progress
    await page.getByRole('button', { name: /Reset Learning Progress/i }).click();
    await expect(page.getByText('Reset all learning progress?')).toBeVisible();

    // Cancel first
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Reset all learning progress?')).not.toBeVisible();

    // Open again and confirm
    await page.getByRole('button', { name: /Reset Learning Progress/i }).click();
    await page.getByRole('button', { name: 'Yes, Reset' }).click();

    // XP should be 0 XP
    await expect(page.getByLabel(/total experience points/i).first()).toHaveText(/0 XP/);
  });

  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('tab', { name: 'Learn & Play' }).click();

    await expect(page.getByText(/JotJSON PlayLab/i).first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });
});

const BREAKPOINTS = [
  { label: '375px mobile', width: 375, height: 667 },
  { label: '768px tablet', width: 768, height: 1024 },
  { label: '1024px desktop', width: 1024, height: 768 },
  { label: '1440px wide desktop', width: 1440, height: 900 },
];

for (const { label, width, height } of BREAKPOINTS) {
  test.describe(`Responsive layout in Learn & Play at ${label}`, () => {
    test.use({ viewport: { width, height } });

    test('has no horizontal page overflow across all Learn & Play views', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('tab', { name: 'Learn & Play' }).click();
      await assertNoHorizontalOverflow(page);

      // Lesson 1 view
      await page.getByRole('tab', { name: 'Lesson 1' }).click();
      await assertNoHorizontalOverflow(page);

      // Syntax Detective view
      await page.getByRole('tab', { name: 'Syntax Detective' }).click();
      await assertNoHorizontalOverflow(page);

      // Stickers view
      await page.getByRole('tab', { name: 'Stickers' }).click();
      await assertNoHorizontalOverflow(page);
    });
  });
}
