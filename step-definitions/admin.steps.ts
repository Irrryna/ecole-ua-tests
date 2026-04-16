import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

/**
 * Étapes spécifiques au tableau de bord administrateur.
 */

// ── Navigation modules ─────────────────────────────────────────────────────────

When('je navigue vers la gestion générale', async function (this: CustomWorld) {
  await this.page.locator('.admin-card').nth(0).click();
});

When('je navigue vers la gestion des enseignants', async function (this: CustomWorld) {
  await this.page.locator('.admin-card').nth(2).click();
});

When('je navigue vers la validation des comptes', async function (this: CustomWorld) {
  await this.page.locator('.admin-card').nth(3).click();
});

// ── Assertions chargement dashboard ───────────────────────────────────────────

Then("je vois la grille de modules d'administration", async function (this: CustomWorld) {
  await expect(this.page.locator('.admin-cards-grid')).toBeVisible({ timeout: 30_000 });
});

Then("je vois la grille de l'emploi du temps", async function (this: CustomWorld) {
  await expect(this.page.locator('app-admin-schedule-grid')).toBeVisible({ timeout: 30_000 });
});

Then('je vois le nom de la classe de test dans la grille', async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.seedData.classRoom.name, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

// ── Petite annonce (post-it) ───────────────────────────────────────────────────

When('je crée une petite annonce', async function (this: CustomWorld) {
  this.quickNoteTitle = `UI post-it admin ${this.seedData.suffix}`;
  await this.page.getByRole('button', { name: /nouvelle petite annonce/i }).click();
  await this.page.locator('input[formcontrolname="title"]').fill(this.quickNoteTitle);
  await this.page.locator('textarea[formcontrolname="content"]').fill('Contenu admin post-it');
  await this.page.getByRole('button', { name: /^publier$/i }).click();
});

Then('la petite annonce est visible dans la liste', async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.quickNoteTitle!, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je supprime la petite annonce', async function (this: CustomWorld) {
  const card = this.page.locator('.qa-card', { hasText: this.quickNoteTitle }).first();
  await card.locator('.qa-btn-action.delete').click();
});

Then("la petite annonce n'est plus visible", async function (this: CustomWorld) {
  await expect(
    this.page.locator('.qa-card', { hasText: this.quickNoteTitle }),
  ).toHaveCount(0, { timeout: 30_000 });
});

// ── Classes ────────────────────────────────────────────────────────────────────

When("je crée une nouvelle classe avec le groupe d'âge {string}", async function (
  this: CustomWorld,
  ageGroup: string,
) {
  this.newClassName = `UI Classe ${this.seedData.suffix}`;
  await this.page.getByRole('button', { name: /nouvelle classe/i }).click();
  const dialog = this.page.locator('mat-dialog-container');
  await dialog.locator('input[formcontrolname="name"]').fill(this.newClassName);
  await dialog.locator('input[formcontrolname="ageGroup"]').fill(ageGroup);
  await dialog.getByRole('button', { name: /enregistrer/i }).click();
});

Then('la classe créée apparaît dans le tableau', async function (this: CustomWorld) {
  await expect(
    this.page.locator('a.class-name-link', { hasText: this.newClassName }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When("je modifie la classe avec le groupe d'âge {string}", async function (
  this: CustomWorld,
  ageGroup: string,
) {
  this.updatedClassName = `${this.newClassName} Mod`;
  const classRow = this.page.locator('tr').filter({
    has: this.page.locator('a.class-name-link', { hasText: this.newClassName }),
  }).first();
  await classRow.locator('button').first().click();
  const dialog = this.page.locator('mat-dialog-container');
  await dialog.locator('input[formcontrolname="name"]').fill(this.updatedClassName);
  await dialog.locator('input[formcontrolname="ageGroup"]').fill(ageGroup);
  await dialog.getByRole('button', { name: /enregistrer/i }).click();
});

Then('la classe modifiée apparaît dans le tableau', async function (this: CustomWorld) {
  await expect(
    this.page.locator('a.class-name-link', { hasText: this.updatedClassName }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je supprime la classe modifiée', async function (this: CustomWorld) {
  const classRow = this.page.locator('tr').filter({
    has: this.page.locator('a.class-name-link', { hasText: this.updatedClassName }),
  }).first();
  const href = await classRow.locator('a.class-name-link').getAttribute('href');
  const classId = href?.split('/').pop();

  const deleteResponse = this.page.waitForResponse(
    (r) =>
      r.request().method() === 'DELETE' &&
      r.url().endsWith(`/users/classes/${classId}`),
  );
  await classRow.locator('button').nth(1).click();
  this.lastDeleteResponse = await deleteResponse;
});

Then("l'API confirme la suppression de la classe avec HTTP 200", function (this: CustomWorld) {
  expect(this.lastDeleteResponse?.ok()).toBeTruthy();
});

Then("la classe supprimée n'apparaît plus dans le tableau", async function (this: CustomWorld) {
  await expect(
    this.page.locator('a.class-name-link', { hasText: this.updatedClassName }),
  ).toHaveCount(0, { timeout: 30_000 });
});

// ── Validation compte parent ───────────────────────────────────────────────────

Then("je vois l'email du parent en attente", async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.seedData.pendingParent.email, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je valide le compte du parent en attente', async function (this: CustomWorld) {
  const pendingRow = this.page
    .locator('tr', { hasText: this.seedData.pendingParent.email })
    .first();
  await pendingRow.getByRole('button', { name: /valider/i }).click();
});

Then("le bouton de validation n'est plus visible pour ce parent", async function (
  this: CustomWorld,
) {
  await expect(
    this.page
      .locator('tr', { hasText: this.seedData.pendingParent.email })
      .getByRole('button', { name: /valider/i }),
  ).toHaveCount(0, { timeout: 30_000 });
});

// ── Enseignants et matières ────────────────────────────────────────────────────

Then("je vois l'email de l'enseignant de test", async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.seedData.teacher.email, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je crée une nouvelle matière', async function (this: CustomWorld) {
  this.newSubjectName = `UI Matiere ${this.seedData.suffix}`;
  await this.page.getByRole('button', { name: /^ajouter$/i }).click();
  const dialog = this.page.locator('mat-dialog-container');
  await dialog.locator('input[formcontrolname="nameFr"]').fill(this.newSubjectName);
  await dialog.locator('input[formcontrolname="nameUk"]').fill(`UI Predmet ${this.seedData.suffix}`);
  await dialog.locator('input[formcontrolname="color"]').last().fill('#0EA5E9');
  await dialog.getByRole('button', { name: /enregistrer/i }).click();
});

Then('le tag de la matière créée est visible', async function (this: CustomWorld) {
  await expect(
    this.page.locator('.subject-tag', { hasText: this.newSubjectName }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je supprime la matière créée', async function (this: CustomWorld) {
  const tag = this.page.locator('.subject-tag', { hasText: this.newSubjectName }).first();
  await tag.locator('.delete-icon').click();
});

Then("le tag de la matière n'est plus visible", async function (this: CustomWorld) {
  await expect(
    this.page.locator('.subject-tag', { hasText: this.newSubjectName }),
  ).toHaveCount(0, { timeout: 30_000 });
});

// ── Gestion des contenus (admin) ───────────────────────────────────────────────

When('je crée un contenu administrateur privé publié', async function (this: CustomWorld) {
  this.newAdminContentTitle = `UI contenu admin ${this.seedData.suffix}`;
  await this.page.getByRole('button', { name: /nouveau contenu/i }).click();
  await this.page.locator('input[formcontrolname="title"]').fill(this.newAdminContentTitle);
  await this.page.locator('textarea[formcontrolname="summary"]').fill('Resume Playwright admin');
  await this.page.locator('textarea[formcontrolname="body"]').fill('Contenu Playwright admin');
  await this.page.locator('select[formcontrolname="visibility"]').selectOption('PRIVE');
  await this.page.locator('select[formcontrolname="status"]').selectOption('PUBLIE');
  await this.page.getByRole('button', { name: /^enregistrer$/i }).click();
});

Then('le contenu administrateur apparaît dans le tableau de gestion', async function (
  this: CustomWorld,
) {
  await expect(
    this.page.locator('tr', { hasText: this.newAdminContentTitle }),
  ).toBeVisible({ timeout: 30_000 });
});

When('je modifie le titre du contenu administrateur', async function (this: CustomWorld) {
  this.updatedAdminContentTitle = `${this.newAdminContentTitle} mod`;
  await this.page
    .locator('tr', { hasText: this.newAdminContentTitle })
    .first()
    .locator('button')
    .first()
    .click();
  await this.page.locator('input[formcontrolname="title"]').fill(this.updatedAdminContentTitle);
  await this.page.getByRole('button', { name: /^enregistrer$/i }).click();
});

Then('le titre modifié du contenu administrateur apparaît dans le tableau', async function (
  this: CustomWorld,
) {
  await expect(
    this.page.locator('tr', { hasText: this.updatedAdminContentTitle }),
  ).toBeVisible({ timeout: 30_000 });
});

When('je supprime le contenu administrateur', async function (this: CustomWorld) {
  await this.page
    .locator('tr', { hasText: this.updatedAdminContentTitle })
    .first()
    .locator('button')
    .nth(1)
    .click();
});

Then('le contenu administrateur ne figure plus dans le tableau', async function (
  this: CustomWorld,
) {
  await expect(
    this.page.locator('tr', { hasText: this.updatedAdminContentTitle }),
  ).toHaveCount(0, { timeout: 30_000 });
});
