import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page, Response } from '@playwright/test';
import type { DashboardSeed } from './test-data';

/**
 * CustomWorld est l'objet partagé entre toutes les étapes d'un scénario.
 * Il contient le contexte Playwright (browser, page) et les données seedées,
 * ainsi que l'état éphémère généré pendant le scénario (noms dynamiques, etc.).
 */
export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  seedData!: DashboardSeed;

  // État éphémère partagé entre les étapes d'un même scénario
  quickNoteTitle?: string;
  newClassName?: string;
  updatedClassName?: string;
  newSubjectName?: string;
  newAdminContentTitle?: string;
  updatedAdminContentTitle?: string;
  newHomeworkDescription?: string;
  updatedHomeworkDescription?: string;
  newAnnouncementTitle?: string;
  newTeacherContentTitle?: string;
  updatedTeacherContentTitle?: string;
  newResourceTitle?: string;
  updatedResourceTitle?: string;
  newChildName?: string;
  newChildAddress?: string;
  updatedChildAddress?: string;
  lastDeleteResponse?: Response;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
