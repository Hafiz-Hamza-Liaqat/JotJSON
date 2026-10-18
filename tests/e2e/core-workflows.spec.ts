import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function setEditor(page: Page, editorId: string, text: string) {
  const editor = page.getByTestId(editorId).locator('.cm-content');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(text);
}

test.describe('JotJSON core workflows', () => {
  test('loads the sample, formats it, and copies output', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Load sample' }).click();
    await page.getByRole('button', { name: 'Format' }).click();
    await expect(page.getByRole('status')).toContainText(/formatted/i);
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Copy output' }).click();
    await expect(page.getByRole('status')).toContainText(/copied/i);
  });

  test('shows an error for invalid JSON', async ({ page }) => {
    await page.goto('/');
    await setEditor(page, 'format-input', '{"invalid":');
    await page.getByRole('button', { name: 'Validate' }).click();
    await expect(page.getByRole('alert')).toContainText(/line/i);
  });

  test('compares two documents', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Compare JSON' }).click();
    await page.getByRole('button', { name: 'Load sample' }).click();
    await page.getByRole('button', { name: 'Compare' }).click();
    await expect(page.getByText('$["user"]["name"]')).toBeVisible();
    await expect(page.getByText('$["user"]["role"]')).toBeVisible();
  });

  test('searches nested JSON', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Search JSON' }).click();
    await page.getByRole('button', { name: 'Load sample' }).click();
    await page.getByLabel('Query').fill('email');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('$["profile"]["email"]')).toBeVisible();
  });

  test('switches between dark and light themes', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await expect(page.locator('html')).toHaveClass(/light/);
  });

  test('uploads an acceptable JSON file', async ({ page }) => {
    await page.goto('/');
    const dir = join(tmpdir(), 'jotjson-e2e');
    mkdirSync(dir, { recursive: true });
    const filePath = join(dir, 'ok.json');
    writeFileSync(filePath, '{"ok":true}', 'utf8');
    await page.locator('input[type="file"]').first().setInputFiles(filePath);
    await expect(page.getByRole('status')).toContainText(/loaded ok.json/i);
  });

  test('rejects an oversized file', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      const input = document.querySelector('input[type="file"]');
      if (!(input instanceof HTMLInputElement)) {
        throw new Error('missing file input');
      }
      const bytes = new Uint8Array(5 * 1024 * 1024 + 1);
      const file = new File([bytes], 'huge.json', { type: 'application/json' });
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect(page.getByRole('alert')).toContainText(/exceeds/i);
  });

  test('shows empty search and no-difference states', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Search JSON' }).click();
    await setEditor(page, 'search-input', '{"a":1}');
    await page.getByLabel('Query').fill('zzz');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('No matches', { exact: true })).toBeVisible();

    await page.getByRole('tab', { name: 'Compare JSON' }).click();
    await setEditor(page, 'compare-original', '{"a":1}');
    await setEditor(page, 'compare-modified', '{"a":1}');
    await page.getByRole('button', { name: 'Compare' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'No differences found.' })).toBeVisible();
  });
});
