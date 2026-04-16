import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import type { Browser } from '@playwright/test';
import { CustomWorld } from './world';
import { ensureDashboardSeed, cleanupDashboardSeed } from './test-data';

setDefaultTimeout(120_000);

let browser: Browser;

BeforeAll(async () => {
  browser = await chromium.launch({
    headless: !process.env.HEADED,
  });
});

AfterAll(async () => {
  await cleanupDashboardSeed();
  await browser?.close();
});

Before(async function (this: CustomWorld) {
  this.context = await browser.newContext({
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:4200',
  });
  this.page = await this.context.newPage();

  // Suppression des dialogues natifs du navigateur (confirm, alert)
  await this.page.addInitScript(() => {
    window.confirm = () => true;
    window.alert  = () => undefined;
  });

  this.seedData = await ensureDashboardSeed();
});

After(async function (this: CustomWorld, scenario) {
  // Capture d'écran automatique en cas d'échec
  if (scenario.result?.status === 'FAILED') {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await this.attach(screenshot, 'image/png');
  }
  await this.context?.close();
});
