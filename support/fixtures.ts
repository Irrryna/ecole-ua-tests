import { test as base, expect, type Page } from '@playwright/test';
import { ensureDashboardSeed, type DashboardSeed, type LoginAccount } from './test-data';

export const test = base.extend<{ seedData: DashboardSeed }>({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.confirm = () => true;
      window.alert = () => undefined;
    });

    await use(page);
  },
  seedData: [
    async ({}, use) => {
      const seedData = await ensureDashboardSeed();
      await use(seedData);
    },
    { scope: 'worker' },
  ],
});

export { expect };

export async function loginAs(page: Page, account: LoginAccount, expectedPath: string) {
  await page.goto('/login');
  const cookieBanner = page.locator('.cookie-banner');
  if (await cookieBanner.isVisible().catch(() => false)) {
    await cookieBanner.locator('button').first().click();
  }
  await page.locator('input[formcontrolname="email"]').fill(account.email);
  await page.locator('input[formcontrolname="password"]').fill(account.password);
  await page.locator('button.submit-btn').click();
  // Use ** suffix to tolerate optional query params (e.g. /teacher?tab=resources)
  await page.waitForURL(`**${expectedPath}**`);
}

export async function openSidebarItem(page: Page, label: string) {
  await page.locator('.sidebar .nav-item', { hasText: label }).first().click();
}

export async function expectVisibleText(page: Page, text: string) {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
}
