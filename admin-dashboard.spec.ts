import { expect, test, loginAs, openSidebarItem, expectVisibleText } from './support/fixtures';

test('admin dashboard exposes modules and supports key UI actions', async ({ page, seedData }) => {
  await loginAs(page, seedData.admin, '/admin');

  await expect(page.locator('.admin-cards-grid')).toBeVisible();
  await expect(page.locator('app-admin-schedule-grid')).toBeVisible();
  await expectVisibleText(page, seedData.classRoom.name);

  await page.locator('.admin-card').nth(1).click();
  await expectVisibleText(page, seedData.child.firstName);

  const newClassName = `UI Classe ${seedData.suffix}`;
  const updatedClassName = `${newClassName} Mod`;
  const quickNoteTitle = `UI post-it admin ${seedData.suffix}`;
  await page.locator('.admin-card').nth(0).click();
  await page.getByRole('button', { name: /nouvelle petite annonce/i }).click();
  await page.locator('input[formcontrolname="title"]').fill(quickNoteTitle);
  await page.locator('textarea[formcontrolname="content"]').fill('Contenu admin post-it');
  await page.getByRole('button', { name: /^publier$/i }).click();
  await expectVisibleText(page, quickNoteTitle);
  const quickNoteCard = page.locator('.qa-card', { hasText: quickNoteTitle }).first();
  await quickNoteCard.locator('.qa-btn-action.delete').click();
  await expect(page.locator('.qa-card', { hasText: quickNoteTitle })).toHaveCount(0);

  await page.getByRole('button', { name: /nouvelle classe/i }).click();

  let dialog = page.locator('mat-dialog-container');
  await dialog.locator('input[formcontrolname="name"]').fill(newClassName);
  await dialog.locator('input[formcontrolname="ageGroup"]').fill('10-11 ans');
  await dialog.getByRole('button', { name: /enregistrer/i }).click();
  await expect(page.locator('a.class-name-link', { hasText: newClassName }).first()).toBeVisible();

  const classRow = page.locator('tr').filter({
    has: page.locator('a.class-name-link', { hasText: newClassName }),
  }).first();
  await classRow.locator('button').first().click();
  dialog = page.locator('mat-dialog-container');
  await dialog.locator('input[formcontrolname="name"]').fill(updatedClassName);
  await dialog.locator('input[formcontrolname="ageGroup"]').fill('11-12 ans');
  await dialog.getByRole('button', { name: /enregistrer/i }).click();
  await expect(page.locator('a.class-name-link', { hasText: updatedClassName }).first()).toBeVisible();

  const updatedClassRow = page.locator('tr').filter({
    has: page.locator('a.class-name-link', { hasText: updatedClassName }),
  }).first();
  const updatedClassHref = await updatedClassRow.locator('a.class-name-link').getAttribute('href');
  const updatedClassId = updatedClassHref?.split('/').pop();
  const deleteClassResponsePromise = page.waitForResponse((response) => {
    if (!updatedClassId) {
      return false;
    }

    return (
      response.request().method() === 'DELETE' &&
      response.url().endsWith(`/users/classes/${updatedClassId}`)
    );
  });
  await updatedClassRow.locator('button').nth(1).click();
  const deleteClassResponse = await deleteClassResponsePromise;
  expect(deleteClassResponse.ok()).toBeTruthy();
  await expect(page.locator('a.class-name-link', { hasText: updatedClassName })).toHaveCount(0);

  await page.locator('.admin-card').nth(3).click();
  await expectVisibleText(page, seedData.pendingParent.email);
  const pendingRow = page.locator('tr', { hasText: seedData.pendingParent.email }).first();
  await pendingRow.getByRole('button', { name: /valider/i }).click();
  await expect(
    page.locator('tr', { hasText: seedData.pendingParent.email }).getByRole('button', { name: /valider/i }),
  ).toHaveCount(0);

  await page.locator('.admin-card').nth(2).click();
  await expectVisibleText(page, 'Liste des enseignants');
  await expectVisibleText(page, seedData.teacher.email);

  const subjectName = `UI Matiere ${seedData.suffix}`;
  await page.getByRole('button', { name: /^ajouter$/i }).click();
  dialog = page.locator('mat-dialog-container');
  await dialog.locator('input[formcontrolname="nameFr"]').fill(subjectName);
  await dialog.locator('input[formcontrolname="nameUk"]').fill(`UI Predmet ${seedData.suffix}`);
  await dialog.locator('input[formcontrolname="color"]').last().fill('#0EA5E9');
  await dialog.getByRole('button', { name: /enregistrer/i }).click();
  const subjectTag = page.locator('.subject-tag', { hasText: subjectName }).first();
  await expect(subjectTag).toBeVisible();
  await subjectTag.locator('.delete-icon').click();
  await expect(page.locator('.subject-tag', { hasText: subjectName })).toHaveCount(0);

  await openSidebarItem(page, 'Vitrine & Annonces');
  await expectVisibleText(page, 'Gestion des contenus');

  const contentTitle = `UI contenu admin ${seedData.suffix}`;
  const updatedContentTitle = `${contentTitle} mod`;
  await page.getByRole('button', { name: /nouveau contenu/i }).click();
  await page.locator('input[formcontrolname="title"]').fill(contentTitle);
  await page.locator('textarea[formcontrolname="summary"]').fill('Resume Playwright admin');
  await page.locator('textarea[formcontrolname="body"]').fill('Contenu Playwright admin');
  await page.locator('select[formcontrolname="visibility"]').selectOption('PRIVE');
  await page.locator('select[formcontrolname="status"]').selectOption('PUBLIE');
  await page.getByRole('button', { name: /^enregistrer$/i }).click();
  await expect(page.locator('tr', { hasText: contentTitle })).toBeVisible();

  const contentRow = page.locator('tr', { hasText: contentTitle }).first();
  await contentRow.locator('button').first().click();
  await page.locator('input[formcontrolname="title"]').fill(updatedContentTitle);
  await page.getByRole('button', { name: /^enregistrer$/i }).click();
  await expect(page.locator('tr', { hasText: updatedContentTitle })).toBeVisible();

  await page.locator('tr', { hasText: updatedContentTitle }).first().locator('button').nth(1).click();
  await expect(page.locator('tr', { hasText: updatedContentTitle })).toHaveCount(0);
});
