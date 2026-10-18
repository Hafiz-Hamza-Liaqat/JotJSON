import { expect, test, type Page } from '@playwright/test';

const BREAKPOINTS = [
  { label: '375px mobile', width: 375, height: 667 },
  { label: '768px tablet', width: 768, height: 1024 },
  { label: '1024px desktop', width: 1024, height: 768 },
  { label: '1440px wide desktop', width: 1440, height: 900 },
];

async function assertNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return doc.scrollWidth > doc.clientWidth || body.scrollWidth > doc.clientWidth;
  });
  expect(hasOverflow).toBe(false);
}

for (const { label, width, height } of BREAKPOINTS) {
  test.describe(`Responsive layout at ${label}`, () => {
    test.use({ viewport: { width, height } });

    test('has no horizontal page overflow and supports workspace navigation, theme toggle, and visible panels', async ({
      page,
    }) => {
      await page.goto('/');

      // 1. Initial Format & Validate workspace check
      await expect(page.getByRole('tab', { name: 'Format & Validate' })).toBeVisible();
      await expect(page.getByTestId('format-input')).toBeVisible();
      await expect(page.getByTestId('format-output')).toBeVisible();
      await assertNoHorizontalOverflow(page);

      // 2. Wrapping controls check & sample formatting
      const loadSampleButton = page.getByRole('button', { name: 'Load sample' });
      await expect(loadSampleButton).toBeVisible();
      await loadSampleButton.click();
      await page.getByRole('button', { name: 'Format' }).click();
      await expect(page.getByRole('status')).toContainText(/formatted/i);
      await assertNoHorizontalOverflow(page);

      // 3. Theme switching check
      const themeToggle = page.getByRole('button', { name: /switch to (light|dark) theme/i });
      await expect(themeToggle).toBeVisible();
      await themeToggle.click();
      await expect(page.locator('html')).toHaveClass(/light/);
      await assertNoHorizontalOverflow(page);
      await themeToggle.click();
      await expect(page.locator('html')).toHaveClass(/dark/);

      // 4. Compare JSON workspace navigation and layout
      await page.getByRole('tab', { name: 'Compare JSON' }).click();
      await expect(page.getByTestId('compare-original')).toBeVisible();
      await expect(page.getByTestId('compare-modified')).toBeVisible();
      await assertNoHorizontalOverflow(page);

      await page.getByRole('button', { name: 'Load sample' }).click();
      await page.getByRole('button', { name: 'Compare' }).click();
      await expect(page.getByText('$["user"]["name"]')).toBeVisible();
      await assertNoHorizontalOverflow(page);

      // 5. Search JSON workspace navigation and layout
      await page.getByRole('tab', { name: 'Search JSON' }).click();
      await expect(page.getByTestId('search-input')).toBeVisible();
      const queryInput = page.getByLabel('Query');
      await expect(queryInput).toBeVisible();
      await assertNoHorizontalOverflow(page);

      await page.getByRole('button', { name: 'Load sample' }).click();
      await queryInput.fill('email');
      await page.getByRole('button', { name: 'Search' }).click();
      await expect(page.getByText('$["profile"]["email"]')).toBeVisible();
      await assertNoHorizontalOverflow(page);

      // 6. Navigate back to Format workspace
      await page.getByRole('tab', { name: 'Format & Validate' }).click();
      await expect(page.getByTestId('format-input')).toBeVisible();
      await assertNoHorizontalOverflow(page);
    });
  });
}
