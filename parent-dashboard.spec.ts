import { expect, test, loginAs, openSidebarItem, expectVisibleText } from './support/fixtures';

test('parent dashboard shows seeded modules, class navigation and child form flows from the UI', async ({
  page,
  seedData,
}) => {
  await loginAs(page, seedData.parent, '/parent');

  await expectVisibleText(page, 'Tableau de bord');
  await expectVisibleText(page, seedData.privateContent.title);
  await expectVisibleText(page, seedData.announcement.title);
  await expectVisibleText(page, seedData.homework.description);
  await expectVisibleText(page, seedData.resource.title);

  await page.locator('.view-class-btn').click();
  await expectVisibleText(page, 'Apercu de la classe');
  await expectVisibleText(page, seedData.classRoom.name);

  await openSidebarItem(page, seedData.classRoom.name);
  await expect(page.locator('.class-subnav .nav-item', { hasText: 'Devoirs' })).toBeVisible();
  await openSidebarItem(page, 'Devoirs');
  await expectVisibleText(page, seedData.homework.description);

  await openSidebarItem(page, 'Fichiers');
  await expectVisibleText(page, seedData.resource.title);

  await openSidebarItem(page, 'Annonces');
  await expectVisibleText(page, seedData.announcement.title);

  await openSidebarItem(page, 'Mes enfants');
  await expectVisibleText(page, 'Mes enfants');

  const childName = `UI Enfant ${seedData.suffix}`;
  const childAddress = '45 avenue des tests';
  const updatedChildAddress = '99 avenue des tests';
  await page.locator('.child-dash-card.add-new-child-btn').click();
  await page.locator('input[formcontrolname="firstName"]').fill('UI');
  await page.locator('input[formcontrolname="lastName"]').fill(`Enfant ${seedData.suffix}`);
  await page.locator('input[formcontrolname="birthDate"]').fill('2019-03-15');
  await page.locator('input[formcontrolname="birthPlace"]').fill('Lviv');
  await page.locator('input[formcontrolname="address"]').fill(childAddress);
  await page.locator('input[formcontrolname="schoolName"]').fill('Ecole UI locale');
  await page.locator('button.btn-save').click();
  await expectVisibleText(page, childName);
  await expectVisibleText(page, childAddress);

  await page.getByRole('button', { name: /modifier/i }).click();
  await page.locator('input[formcontrolname="address"]').fill(updatedChildAddress);
  await page.locator('button.btn-save').click();
  await expectVisibleText(page, updatedChildAddress);
});
