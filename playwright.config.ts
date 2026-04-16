/**
 * Playwright configuration for standalone use of the ecole-ua-tests repo.
 *
 * When this repo is used as a git submodule inside ecole-ua-lyon at
 * `frontend/tests/browser/`, the main project's `frontend/playwright.config.ts`
 * takes precedence and points testDir at this directory.
 *
 * To run standalone, both the backend (port 3000) and frontend (port 4200)
 * must already be running — see README for setup instructions.
 */
import { defineConfig } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: isCI ? 1 : 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: isCI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4200',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
