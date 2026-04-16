import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

/**
 * Étapes partagées entre tous les rôles.
 * Authentification, navigation barre latérale, assertions de texte générique.
 */

// ── Données de test ────────────────────────────────────────────────────────────

Given('les données de test sont prêtes', function (this: CustomWorld) {
  // Le seed est préparé dans le Before hook (support/hooks.ts)
  expect(this.seedData).toBeDefined();
});

// ── Authentification ───────────────────────────────────────────────────────────

Given("je suis connecté en tant qu'administrateur", async function (this: CustomWorld) {
  await login(this, this.seedData.admin.email, this.seedData.admin.password, '/admin');
});

Given("je suis connecté en tant qu'enseignant", async function (this: CustomWorld) {
  await login(this, this.seedData.teacher.email, this.seedData.teacher.password, '/teacher');
});

Given('je suis connecté en tant que parent', async function (this: CustomWorld) {
  await login(this, this.seedData.parent.email, this.seedData.parent.password, '/parent');
});

// ── Navigation barre latérale ──────────────────────────────────────────────────

When('je navigue vers {string} dans la barre latérale', async function (this: CustomWorld, label: string) {
  await this.page.locator('.sidebar .nav-item', { hasText: label }).first().click();
});

// ── Assertions de texte générique ─────────────────────────────────────────────

Then('je vois {string}', async function (this: CustomWorld, text: string) {
  await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 30_000 });
});

// ── Navigation directe par URL ─────────────────────────────────────────────────

When("je visite directement l'URL {string}", async function (this: CustomWorld, url: string) {
  await this.page.goto(url);
});

// ── Assertions d'URL ───────────────────────────────────────────────────────────

Then("l'URL contient {string}", async function (this: CustomWorld, fragment: string) {
  await expect(this.page).toHaveURL(new RegExp(escapeRegExp(fragment)), { timeout: 30_000 });
});

Then("l'URL est {string} sans paramètres de requête", async function (this: CustomWorld, path: string) {
  await expect(this.page).toHaveURL(new RegExp(`${escapeRegExp(path)}(?!\\?)`), { timeout: 30_000 });
});

Then("l'URL est redirigée vers {string}", async function (this: CustomWorld, expectedUrl: string) {
  await expect(this.page).toHaveURL(new RegExp(escapeRegExp(expectedUrl)), { timeout: 30_000 });
});

// ── Helpers internes ──────────────────────────────────────────────────────────

async function login(
  world: CustomWorld,
  email: string,
  password: string,
  expectedPath: string,
): Promise<void> {
  await world.page.goto('/login');
  const cookieBanner = world.page.locator('.cookie-banner');
  if (await cookieBanner.isVisible().catch(() => false)) {
    await cookieBanner.locator('button').first().click();
  }
  await world.page.locator('input[formcontrolname="email"]').fill(email);
  await world.page.locator('input[formcontrolname="password"]').fill(password);
  await world.page.locator('button.submit-btn').click();
  await world.page.waitForURL(`**${expectedPath}**`);
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
