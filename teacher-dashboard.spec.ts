import { expect, test, loginAs, openSidebarItem, expectVisibleText } from './support/fixtures';

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

  const year = target.getFullYear();
  const month = `${target.getMonth() + 1}`.padStart(2, '0');
  const date = `${target.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${date}`;
}

test('teacher dashboard supports homework, announcements, resources and content flows', async ({
  page,
  seedData,
}) => {
  await loginAs(page, seedData.teacher, '/teacher');

  await expectVisibleText(page, 'Espace professeur');
  await expectVisibleText(page, seedData.classRoom.name);
  await expectVisibleText(page, 'Mes classes');

  await page.locator('.class-row', { hasText: seedData.classRoom.name }).first().click();
  await expect(page.locator('app-shared-homework')).toBeVisible();
  await expectVisibleText(page, seedData.homework.description);
  await expectVisibleText(page, seedData.resource.title);

  const homeworkDescription = `UI devoir ${seedData.suffix}`;
  const updatedHomeworkDescription = `${homeworkDescription} mod`;
  await page.locator('app-shared-homework button.btn-new').click();

  let dialog = page.locator('mat-dialog-container');
  await dialog.locator('input[type="date"]').fill(nextSaturdayInputValue());
  await dialog.locator('select[formcontrolname="subject"]').selectOption('Musique');
  await dialog.locator('textarea[formcontrolname="description"]').fill(homeworkDescription);
  await dialog.getByRole('button', { name: /publier ces devoirs/i }).click();
  await expectVisibleText(page, homeworkDescription);

  let homeworkGroup = page.locator('.homework-group-card', { hasText: homeworkDescription }).first();
  await homeworkGroup.locator('button.btn-action.edit').click();
  dialog = page.locator('mat-dialog-container');
  await dialog.locator('textarea[formcontrolname="description"]').fill(updatedHomeworkDescription);
  await dialog.getByRole('button', { name: /mettre a jour|mettre à jour/i }).click();
  await expectVisibleText(page, updatedHomeworkDescription);

  homeworkGroup = page.locator('.homework-group-card', { hasText: updatedHomeworkDescription }).first();
  await homeworkGroup.locator('button.btn-action.delete').click();
  await expect(page.locator('.homework-group-card', { hasText: updatedHomeworkDescription })).toHaveCount(0);

  await page.locator('.breadcrumb .current').first().click({ trial: true }).catch(() => undefined);
  await openSidebarItem(page, 'Espace professeur');

  const announcementTitle = `UI annonce ${seedData.suffix}`;
  await page.locator('.action-card', { hasText: 'Rappel rapide' }).click();
  await page.locator('input[formcontrolname="title"]').fill(announcementTitle);
  await page.locator('textarea[formcontrolname="content"]').fill(`Contenu UI annonce ${seedData.suffix}`);
  await page.getByRole('button', { name: /publier/i }).click();
  await expectVisibleText(page, announcementTitle);

  await openSidebarItem(page, 'Contenus');
  await expectVisibleText(page, 'Gestion des contenus');

  const contentTitle = `UI contenu prof ${seedData.suffix}`;
  const updatedContentTitle = `${contentTitle} mod`;
  await page.getByRole('button', { name: /nouveau contenu/i }).click();
  await page.locator('input[formcontrolname="title"]').fill(contentTitle);
  await page.locator('textarea[formcontrolname="summary"]').fill('Resume UI prof');
  await page.locator('textarea[formcontrolname="body"]').fill('Corps contenu UI prof');
  await page.locator('select[formcontrolname="visibility"]').selectOption('PRIVE');
  await page.locator('select[formcontrolname="status"]').selectOption('PUBLIE');
  await page.getByRole('button', { name: /^enregistrer$/i }).click();
  await expectVisibleText(page, contentTitle);

  await page.locator('tr', { hasText: contentTitle }).first().locator('button[title="Modifier"]').click();
  await page.locator('input[formcontrolname="title"]').fill(updatedContentTitle);
  await page.getByRole('button', { name: /^enregistrer$/i }).click();
  await expectVisibleText(page, updatedContentTitle);

  await page.locator('tr', { hasText: updatedContentTitle }).first().locator('button[title="Supprimer"]').click();
  await expect(page.locator('tr', { hasText: updatedContentTitle })).toHaveCount(0);

  await openSidebarItem(page, 'Espace professeur');
  await page.locator('.action-card', { hasText: 'Mes supports' }).click();
  // Route uses query params now: /teacher?tab=resources (no component recreation)
  await expect(page).toHaveURL(/\/teacher\?tab=resources/);
  await expectVisibleText(page, 'Mes supports pedagogiques');

  const resourceTitle = `UI ressource ${seedData.suffix}`;
  const updatedResourceTitle = `${resourceTitle} mod`;
  await page.locator('.resources-section .btn-add-gold').click();
  dialog = page.locator('mat-dialog-container');
  await dialog.locator('.type-btn', { hasText: 'Lien externe' }).click();
  await dialog.locator('input[formcontrolname="title"]').fill(resourceTitle);
  await dialog.locator('textarea[formcontrolname="description"]').fill('Description ressource UI');
  await dialog.locator('select[formcontrolname="classId"]').selectOption(seedData.classRoom.id);
  await dialog.locator('input[formcontrolname="url"]').fill(`https://example.com/ui-resource-${seedData.suffix}`);
  await dialog.getByRole('button', { name: /publier la ressource/i }).click();
  await expectVisibleText(page, resourceTitle);

  let resourceCard = page.locator('.resource-card', { hasText: resourceTitle }).first();
  await resourceCard.locator('.btn-icon.edit').click();
  dialog = page.locator('mat-dialog-container');
  await dialog.locator('input[formcontrolname="title"]').fill(updatedResourceTitle);
  await dialog.getByRole('button', { name: /^enregistrer$/i }).click();
  await expectVisibleText(page, updatedResourceTitle);

  resourceCard = page.locator('.resource-card', { hasText: updatedResourceTitle }).first();
  await resourceCard.locator('.btn-icon.delete').click();
  await expect(page.locator('.resource-card', { hasText: updatedResourceTitle })).toHaveCount(0);

  // Return to dashboard — URL goes back to /teacher (no query params), component stays alive
  await openSidebarItem(page, 'Espace professeur');
  await expect(page).toHaveURL(/\/teacher(?!\?)/);
  await expectVisibleText(page, 'Espace professeur');
});

test('legacy /teacher/resources path redirects to /teacher?tab=resources', async ({
  page,
  seedData,
}) => {
  await loginAs(page, seedData.teacher, '/teacher');
  await page.goto('/teacher/resources');
  await expect(page).toHaveURL(/\/teacher\?tab=resources/);
  await expectVisibleText(page, 'Mes supports');
});
