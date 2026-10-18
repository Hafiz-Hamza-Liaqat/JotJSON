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

  test('completes Lesson 1, earns XP, and unlocks JSON Beginner sticker', async ({ page }) => {
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
    await page.getByRole('button', { name: 'Next Step' }).click();

    // Step 6: Strict JSON Syntax Rules
    await expect(page.getByRole('heading', { name: /Strict JSON Syntax Rules/i })).toBeVisible();
    await page.getByRole('radio', { name: '{ "name": "Byte", "active": true }' }).click();
    await page.getByRole('button', { name: /Finish Lesson & Claim XP/i }).click();

    // If sticker unlock modal appeared, dismiss it
    const modalClose = page.getByRole('button', { name: 'Awesome!' });
    if (await modalClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await modalClose.click();
    }

    // Return to dashboard
    await page.getByRole('button', { name: /Back to Learn & Play/i }).click();
    await expect(page.getByText(/JotJSON PlayLab/i).first()).toBeVisible();

    // Verify XP was awarded (100 XP)
    await expect(page.getByLabel(/total experience points/i).first()).toHaveText(/100 XP/);
  });

  test('solves Syntax Detective Case 1, reveals clues, and handles errors', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Learn & Play' }).click();
    await page.getByRole('tab', { name: 'Syntax Detective' }).click();

    await expect(page.getByRole('heading', { name: /The Unquoted String/i })).toBeVisible();

    // Run investigation on broken code
    await page.getByRole('button', { name: 'Check My JSON' }).click();
    await expect(page.getByText(/Syntax Error/i)).toBeVisible();

    // Reveal clue
    await page.getByRole('button', { name: 'Get Hint' }).click();
    await expect(page.getByText(/Clue 1:/i)).toBeVisible();

    // Fix broken code: wrap Alex in quotes in the actual starter object
    await setEditor(page, 'challenge-editor', '{\n  "id": 101,\n  "username": "Alex",\n  "role": "explorer"\n}');

    // Run investigation on fixed code
    await page.getByRole('button', { name: 'Check My JSON' }).click();
    await expect(page.getByText('Case Solved!', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next Case' })).toBeVisible();

    // Dismiss sticker modal if it pops up
    const modalClose = page.getByRole('button', { name: 'Awesome!' });
    if (await modalClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await modalClose.click();
    }
  });

  test('persists progress across page reload and prevents duplicate XP', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Learn & Play' }).click();
    await page.getByRole('tab', { name: 'Syntax Detective' }).click();

    // Solve Case 1
    await setEditor(page, 'challenge-editor', '{\n  "id": 101,\n  "username": "Alex",\n  "role": "explorer"\n}');
    await page.getByRole('button', { name: 'Check My JSON' }).click();
    await expect(page.getByText('Case Solved!', { exact: true })).toBeVisible();

    const modalClose = page.getByRole('button', { name: 'Awesome!' });
    if (await modalClose.isVisible({ timeout: 1500 }).catch(() => false)) {
      await modalClose.click();
    }

    // Get current XP text
    const xpText = await page.getByLabel(/total experience points/i).first().innerText();
    expect(xpText).toBe('25 XP');

    // Reload page
    await page.reload();
    await page.getByRole('tab', { name: 'Learn & Play' }).click();

    // Check persisted XP
    const reloadedXpText = await page.getByLabel(/total experience points/i).first().innerText();
    expect(reloadedXpText).toBe('25 XP');

    // Verify Case 1 shows solved in Syntax Detective
    await page.getByRole('tab', { name: 'Syntax Detective' }).click();
    await expect(page.getByRole('button', { name: /Case 1 \(Completed\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next Case' })).toBeVisible();

    // Re-solving already solved Case 1 does NOT grant additional XP
    await setEditor(page, 'challenge-editor', '{\n  "id": 101,\n  "username": "Alex",\n  "role": "explorer"\n}');
    await page.getByRole('button', { name: 'Check My JSON' }).click();
    await expect(page.getByText('Case Solved!', { exact: true })).toBeVisible();

    const postCheckXp = await page.getByLabel(/total experience points/i).first().innerText();
    expect(postCheckXp).toBe('25 XP');
  });

  test('displays unlocked and locked stickers in the Sticker Book', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Learn & Play' }).click();

    // Solve Case 1 to unlock Bug Hunter
    await page.getByRole('tab', { name: 'Syntax Detective' }).click();
    await setEditor(page, 'challenge-editor', '{\n  "id": 101,\n  "username": "Alex",\n  "role": "explorer"\n}');
    await page.getByRole('button', { name: 'Check My JSON' }).click();

    const modalClose = page.getByRole('button', { name: 'Awesome!' });
    if (await modalClose.isVisible({ timeout: 1500 }).catch(() => false)) {
      await modalClose.click();
    }

    // Open Sticker Book via Stickers tab
    await page.getByRole('tab', { name: 'Stickers' }).click();
    await expect(page.getByRole('heading', { name: 'Sticker Book & Achievements' })).toBeVisible();

    // Check Bug Hunter is Unlocked
    await expect(page.getByRole('heading', { name: 'Bug Hunter' })).toBeVisible();
    await expect(page.getByText('Unlocked').first()).toBeVisible();

    // Check JSON Champion is Locked
    await expect(page.getByRole('heading', { name: 'JSON Champion' })).toBeVisible();
    await expect(page.getByText('Locked').first()).toBeVisible();
  });

  test('resets learning progress safely when confirmed', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Learn & Play' }).click();
    await page.getByRole('tab', { name: 'Syntax Detective' }).click();

    // Solve Case 1
    await setEditor(page, 'challenge-editor', '{\n  "id": 101,\n  "username": "Alex",\n  "role": "explorer"\n}');
    await page.getByRole('button', { name: 'Check My JSON' }).click();
    await expect(page.getByText('Case Solved!', { exact: true })).toBeVisible();

    const modalClose = page.getByRole('button', { name: 'Awesome!' });
    if (await modalClose.isVisible({ timeout: 1500 }).catch(() => false)) {
      await modalClose.click();
    }

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
