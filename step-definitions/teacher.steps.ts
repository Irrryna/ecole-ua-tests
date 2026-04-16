import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

/**
 * Étapes spécifiques au tableau de bord enseignant.
 */

// ── Assertions dashboard ───────────────────────────────────────────────────────

Then("je vois le nom de la classe assignée à l'enseignant", async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.seedData.classRoom.name, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je clique sur la ligne de ma classe', async function (this: CustomWorld) {
  await this.page
    .locator('.class-row', { hasText: this.seedData.classRoom.name })
    .first()
    .click();
});

Then('je vois le composant des devoirs partagés', async function (this: CustomWorld) {
  await expect(this.page.locator('app-shared-homework')).toBeVisible({ timeout: 30_000 });
});

Then('je vois la description du devoir de test', async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.seedData.homework.description, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

Then('je vois le titre de la ressource de test', async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.seedData.resource.title, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

// ── Devoirs ────────────────────────────────────────────────────────────────────

When('je crée un nouveau devoir', async function (this: CustomWorld) {
  this.newHomeworkDescription = `UI devoir ${this.seedData.suffix}`;
  await this.page.locator('app-shared-homework button.btn-new').click();
  const dialog = this.page.locator('mat-dialog-container');
  await dialog.locator('input[type="date"]').fill(nextSaturdayInputValue());
  await dialog.locator('select[formcontrolname="subject"]').selectOption('Musique');
  await dialog.locator('textarea[formcontrolname="description"]').fill(this.newHomeworkDescription);
  await dialog.getByRole('button', { name: /publier ces devoirs/i }).click();
});

Then('le devoir créé apparaît dans la liste', async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.newHomeworkDescription!, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je modifie la description du devoir créé', async function (this: CustomWorld) {
  this.updatedHomeworkDescription = `${this.newHomeworkDescription} mod`;
  await this.page
    .locator('.homework-group-card', { hasText: this.newHomeworkDescription })
    .first()
    .locator('button.btn-action.edit')
    .click();
  const dialog = this.page.locator('mat-dialog-container');
  await dialog
    .locator('textarea[formcontrolname="description"]')
    .fill(this.updatedHomeworkDescription);
  await dialog.getByRole('button', { name: /mettre a jour|mettre à jour/i }).click();
});

Then('la description modifiée apparaît dans la liste', async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.updatedHomeworkDescription!, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je supprime le devoir modifié', async function (this: CustomWorld) {
  await this.page
    .locator('.homework-group-card', { hasText: this.updatedHomeworkDescription })
    .first()
    .locator('button.btn-action.delete')
    .click();
});

Then('le devoir ne figure plus dans la liste', async function (this: CustomWorld) {
  await expect(
    this.page.locator('.homework-group-card', { hasText: this.updatedHomeworkDescription }),
  ).toHaveCount(0, { timeout: 30_000 });
});

// ── Annonces rapides ───────────────────────────────────────────────────────────

When('je clique sur la carte d\'action {string}', async function (this: CustomWorld, cardText: string) {
  await this.page.locator('.action-card', { hasText: cardText }).click();
});

When('je publie une annonce rapide', async function (this: CustomWorld) {
  this.newAnnouncementTitle = `UI annonce ${this.seedData.suffix}`;
  await this.page
    .locator('input[formcontrolname="title"]')
    .fill(this.newAnnouncementTitle);
  await this.page
    .locator('textarea[formcontrolname="content"]')
    .fill(`Contenu UI annonce ${this.seedData.suffix}`);
  await this.page.getByRole('button', { name: /publier/i }).click();
});

Then("l'annonce publiée apparaît dans la liste", async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.newAnnouncementTitle!, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

// ── Contenus enseignant ────────────────────────────────────────────────────────

When('je crée un contenu enseignant privé publié', async function (this: CustomWorld) {
  this.newTeacherContentTitle = `UI contenu prof ${this.seedData.suffix}`;
  await this.page.getByRole('button', { name: /nouveau contenu/i }).click();
  await this.page.locator('input[formcontrolname="title"]').fill(this.newTeacherContentTitle);
  await this.page.locator('textarea[formcontrolname="summary"]').fill('Resume UI prof');
  await this.page.locator('textarea[formcontrolname="body"]').fill('Corps contenu UI prof');
  await this.page.locator('select[formcontrolname="visibility"]').selectOption('PRIVE');
  await this.page.locator('select[formcontrolname="status"]').selectOption('PUBLIE');
  await this.page.getByRole('button', { name: /^enregistrer$/i }).click();
});

Then("le contenu enseignant apparaît dans la liste des contenus", async function (
  this: CustomWorld,
) {
  await expect(
    this.page.getByText(this.newTeacherContentTitle!, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je modifie le titre du contenu enseignant', async function (this: CustomWorld) {
  this.updatedTeacherContentTitle = `${this.newTeacherContentTitle} mod`;
  await this.page
    .locator('.content-card', { hasText: this.newTeacherContentTitle })
    .first()
    .locator('.content-actions button')
    .first()
    .click();
  await this.page.locator('input[formcontrolname="title"]').fill(this.updatedTeacherContentTitle);
  await this.page.getByRole('button', { name: /^enregistrer$/i }).click();
});

Then('le titre modifié du contenu enseignant apparaît dans la liste', async function (
  this: CustomWorld,
) {
  await expect(
    this.page.getByText(this.updatedTeacherContentTitle!, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je supprime le contenu enseignant', async function (this: CustomWorld) {
  await this.page
    .locator('.content-card', { hasText: this.updatedTeacherContentTitle })
    .first()
    .locator('.content-actions button')
    .nth(1)
    .click();
});

Then('le contenu enseignant ne figure plus dans la liste', async function (this: CustomWorld) {
  await expect(
    this.page.locator('.content-card', { hasText: this.updatedTeacherContentTitle }),
  ).toHaveCount(0, { timeout: 30_000 });
});

// ── Ressources pédagogiques ────────────────────────────────────────────────────

When('je crée une ressource pédagogique de type lien externe', async function (
  this: CustomWorld,
) {
  this.newResourceTitle = `UI ressource ${this.seedData.suffix}`;
  await this.page.locator('.resources-section .btn-add-gold').click();
  const dialog = this.page.locator('mat-dialog-container');
  await dialog.locator('.type-btn', { hasText: 'Lien externe' }).click();
  await dialog.locator('input[formcontrolname="title"]').fill(this.newResourceTitle);
  await dialog.locator('textarea[formcontrolname="description"]').fill('Description ressource UI');
  await dialog.locator('select[formcontrolname="classId"]').selectOption(this.seedData.classRoom.id);
  await dialog
    .locator('input[formcontrolname="url"]')
    .fill(`https://example.com/ui-resource-${this.seedData.suffix}`);
  await dialog.getByRole('button', { name: /publier la ressource/i }).click();
});

Then('la ressource créée apparaît dans la liste', async function (this: CustomWorld) {
  await expect(
    this.page.getByText(this.newResourceTitle!, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je modifie le titre de la ressource créée', async function (this: CustomWorld) {
  this.updatedResourceTitle = `${this.newResourceTitle} mod`;
  await this.page
    .locator('.resource-card', { hasText: this.newResourceTitle })
    .first()
    .locator('.btn-icon.edit')
    .click();
  const dialog = this.page.locator('mat-dialog-container');
  await dialog.locator('input[formcontrolname="title"]').fill(this.updatedResourceTitle);
  await dialog.getByRole('button', { name: /^enregistrer$/i }).click();
});

Then('le titre modifié de la ressource apparaît dans la liste', async function (
  this: CustomWorld,
) {
  await expect(
    this.page.getByText(this.updatedResourceTitle!, { exact: false }).first(),
  ).toBeVisible({ timeout: 30_000 });
});

When('je supprime la ressource modifiée', async function (this: CustomWorld) {
  await this.page
    .locator('.resource-card', { hasText: this.updatedResourceTitle })
    .first()
    .locator('.btn-icon.delete')
    .click();
});

Then('la ressource ne figure plus dans la liste', async function (this: CustomWorld) {
  await expect(
    this.page.locator('.resource-card', { hasText: this.updatedResourceTitle }),
  ).toHaveCount(0, { timeout: 30_000 });
});

// ── Helpers internes ──────────────────────────────────────────────────────────

function nextSaturdayInputValue(): string {
  const now = new Date();
  const day = now.getDay();
  const target = new Date(now);
  if (day === 6 && now.getHours() >= 16) {
    target.setDate(now.getDate() + 7);
  } else {
    const diff = (6 - day + 7) % 7;
    target.setDate(now.getDate() + diff);
  }
  const year  = target.getFullYear();
  const month = `${target.getMonth() + 1}`.padStart(2, '0');
  const date  = `${target.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${date}`;
}
