import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

/**
 * Étapes spécifiques au tableau de bord parent.
 */

// ── Assertions dashboard ───────────────────────────────────────────────────────

Then('je vois le contenu privé de test', async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.seedData.privateContent.title, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

Then("je vois l'annonce de test", async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.seedData.announcement.title, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

Then('je vois le devoir de test', async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.seedData.homework.description, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

Then('je vois la ressource de test', async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.seedData.resource.title, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

// ── Navigation classe ──────────────────────────────────────────────────────────

When('je clique sur le bouton "Voir la classe"', async function (this: CustomWorld) {
  await this.page.locator('.view-class-btn').click();
});

Then('je vois le nom de la classe de test', async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.seedData.classRoom.name, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je clique sur le nom de la classe dans la barre latérale', async function (
  this: CustomWorld,
) {
  await this.page
    .locator('.sidebar .nav-item', { hasText: this.seedData.classRoom.name })
    .first()
    .click();
});

Then('la sous-navigation de la classe est visible', async function (this: CustomWorld) {
  await expect(
    this.page.locator('.class-subnav .nav-item', { hasText: 'Devoirs' }),
  ).toBeVisible({ timeout: 30_000 });
});

// ── Gestion des enfants ────────────────────────────────────────────────────────

When("j'inscris un nouvel enfant", async function (this: CustomWorld) {
  this.newChildName  = `UI Enfant ${this.seedData.suffix}`;
  this.newChildAddress = '45 avenue des tests';

  await this.page.locator('.child-dash-card.add-new-child-btn').click();
  await this.page.locator('input[formcontrolname="firstName"]').fill('UI');
  await this.page.locator('input[formcontrolname="lastName"]').fill(`Enfant ${this.seedData.suffix}`);
  await this.page.locator('input[formcontrolname="birthDate"]').fill('2019-03-15');
  await this.page.locator('input[formcontrolname="birthPlace"]').fill('Lviv');
  await this.page.locator('input[formcontrolname="address"]').fill(this.newChildAddress);
  await this.page.locator('input[formcontrolname="schoolName"]').fill('Ecole UI locale');
  await this.page.locator('button.btn-save').click();
});

Then("l'enfant inscrit apparaît dans la liste avec son adresse", async function (
  this: CustomWorld,
) {
  await expect(
    this.page.getByText(this.newChildName!, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
  await expect(
    this.page.getByText(this.newChildAddress!, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When("je modifie l'adresse de l'enfant", async function (this: CustomWorld) {
  this.updatedChildAddress = '99 avenue des tests';
  await this.page.getByRole('button', { name: /modifier/i }).click();
  await this.page.locator('input[formcontrolname="address"]').fill(this.updatedChildAddress);
  await this.page.locator('button.btn-save').click();
});

Then("la nouvelle adresse apparaît dans la fiche de l'enfant", async function (
  this: CustomWorld,
) {
  await expect(
    this.page.getByText(this.updatedChildAddress!, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});
