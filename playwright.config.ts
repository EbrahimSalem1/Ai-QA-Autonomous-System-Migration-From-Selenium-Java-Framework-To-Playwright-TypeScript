import { defineConfig, devices, type Project } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';
import { env, STORAGE_STATE } from './src/config/env';

const isCI = !!process.env.CI;
/** Optional: use a locally installed Chromium/Chrome instead of the Playwright-managed build. */
const chromiumExecutable = process.env.PW_CHROMIUM_EXECUTABLE || undefined;

/** Gherkin features → generated Playwright specs (.features-gen). */
const bddTestDir = defineBddConfig({
  features: 'features/*.feature',
  steps: ['src/steps/**/*.ts', 'src/fixtures/fixtures.ts'],
  outputDir: '.features-gen',
  missingSteps: 'fail-on-gen',
  // Attaches a ready-made "fix this failing step" prompt to failed tests for the healer / Claude.
  aiFix: { promptAttachment: true },
});

/** Cross-browser smoke projects are opt-in: CROSS_BROWSER=1 (used by the nightly CI job). */
const crossBrowserProjects: Project[] = process.env.CROSS_BROWSER
  ? [
      {
        name: 'firefox-smoke',
        testDir: bddTestDir,
        grep: /@smoke/,
        grepInvert: /@auth/,
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit-smoke',
        testDir: bddTestDir,
        grep: /@smoke/,
        grepInvert: /@auth/,
        use: { ...devices['Desktop Safari'] },
      },
    ]
  : [];

export default defineConfig({
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 4 : undefined,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  outputDir: 'test-results',
  reporter: [
    [isCI ? 'github' : 'list'],
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    cucumberReporter('html', { outputFile: 'reports/cucumber/cucumber-report.html' }),
    cucumberReporter('json', { outputFile: 'reports/cucumber/cucumber-report.json' }),
    cucumberReporter('junit', { outputFile: 'reports/cucumber/junit.xml', suiteName: 'OpenCart Playwright BDD' }),
    ['allure-playwright', { resultsDir: 'reports/allure-results', detail: true, suiteTitle: false }],
  ],
  use: {
    baseURL: env.baseUrl,
    locale: 'en-GB',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: chromiumExecutable ? { executablePath: chromiumExecutable } : {},
  },
  projects: [
    // 1. Logs in once and saves storageState for every @auth scenario.
    { name: 'setup', testDir: './src/auth', testMatch: /.*\.setup\.ts/ },
    // 2. Guest scenarios — clean context, fully parallel.
    {
      name: 'chromium',
      testDir: bddTestDir,
      grepInvert: /@auth/,
      use: { ...devices['Desktop Chrome'] },
    },
    // 3. Authenticated scenarios reuse the saved session.
    {
      name: 'chromium-auth',
      testDir: bddTestDir,
      grep: /@auth/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },
    ...crossBrowserProjects,
    // Seed for the Playwright AI agents (planner / generator / healer). Run explicitly with --project=agents.
    { name: 'agents', testDir: './tests', testMatch: /seed\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
  ],
});
