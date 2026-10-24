# OpenCart UI Automation — Playwright + TypeScript + Cucumber BDD

Migration of the Selenium/Java framework (branch [`selenium-java-framework`](../../tree/selenium-java-framework))
to Playwright + TypeScript, built and run with the **QA Autonomous System**:

```
Jira story ─▶ Claude + Atlassian MCP (analysis) ─▶ Gherkin feature ─▶ Playwright planner agent (test plan)
          ─▶ generator agent + skills (page objects, fixtures, steps) ─▶ healer agent ─▶ GitHub Actions
          ─▶ per-module report (gh-pages) ─▶ results commented back on the Jira story
```

## Modules (epic [IB-2](https://ebrasalem93.atlassian.net/browse/IB-2))

| Module | Feature | Jira | Scenarios |
|---|---|---|---|
| Registration | `features/registration.feature` | [IB-13](https://ebrasalem93.atlassian.net/browse/IB-13) | 4 |
| Login | `features/login.feature` | [IB-14](https://ebrasalem93.atlassian.net/browse/IB-14) | 4 |
| Search | `features/search.feature` | [IB-15](https://ebrasalem93.atlassian.net/browse/IB-15) | 3 |
| Product details | `features/product-details.feature` | [IB-16](https://ebrasalem93.atlassian.net/browse/IB-16) | 3 |
| Shopping cart | `features/shopping-cart.feature` | [IB-17](https://ebrasalem93.atlassian.net/browse/IB-17) | 4 |
| Wishlist | `features/wishlist.feature` | [IB-18](https://ebrasalem93.atlassian.net/browse/IB-18) | 3 |
| Product compare | `features/product-compare.feature` | [IB-19](https://ebrasalem93.atlassian.net/browse/IB-19) | 4 |
| Checkout | `features/checkout.feature` | [IB-20](https://ebrasalem93.atlassian.net/browse/IB-20) | 4 |

The feature files are **byte-for-byte identical** to the Selenium branch — the migration changes the engine, not the behaviour.

## Stack

Playwright 1.64 · TypeScript · [playwright-bdd](https://vitalets.github.io/playwright-bdd) 9 (Cucumber/Gherkin on the
Playwright runner) · fixtures · `storageState` · Faker · ESLint (typescript-eslint + eslint-plugin-playwright) ·
Prettier · Allure · GitHub Actions · Claude Code with Playwright agents, Playwright MCP and Atlassian MCP.

## Structure

```
features/                 Gherkin (shared with the Selenium branch)
src/
├── config/env.ts         BASE_URL, language, optional shared account, storage-state path
├── data/testData.ts      unique customers / addresses (Faker)
├── pages/                Page Object Model — locators + actions, no assertions
│   ├── BasePage.ts, CurrentPage.ts, components/Header.ts
│   └── Register, Login, Account, SearchResults, Product, Cart, Wishlist, Compare, Checkout
├── fixtures/fixtures.ts  test.extend: page objects, shopper flows, customerFactory, scenario state → Given/When/Then
├── steps/*.steps.ts      one file per module + common.steps.ts (web-first expect)
└── auth/auth.setup.ts    "setup" project: login once → .auth/customer.json (storageState)
tests/seed.spec.ts        seed for the Playwright AI agents
specs/                    agent test plans; specs/jira/ = stories pulled from Jira
scripts/                  module-report.ts · jira-story.ts · jira-publish-results.ts
.claude/agents/           playwright-test-planner / generator / healer
.claude/skills/           _template + jira-story-analysis · playwright-bdd-implementation ·
                          selenium-to-playwright-migration · pipeline-and-reporting
.mcp.json                 playwright-test, playwright, atlassian MCP servers
CLAUDE.md                 rules and workflow for Claude
docs/MIGRATION_GUIDE.md   Selenium/Java → Playwright/TS mapping and lessons learned
```

## Projects

| Project | What runs | Notes |
|---|---|---|
| `setup` | `src/auth/auth.setup.ts` | registers (or uses `OPENCART_EMAIL`), logs in, saves `storageState` |
| `chromium` | every scenario **without** `@auth` | clean context per scenario, fully parallel |
| `chromium-auth` | scenarios tagged `@auth` | depends on `setup`, starts logged in |
| `firefox-smoke`, `webkit-smoke` | `@smoke` | only with `CROSS_BROWSER=1` (nightly CI) |
| `agents` | `tests/seed.spec.ts` | seed for the planner / generator / healer agents |

## Run

```bash
npm ci && npx playwright install chromium
npm test                                   # bddgen + setup + chromium + chromium-auth
npx bddgen && npx playwright test --grep @cart
npm run test:smoke
BASE_URL=http://localhost:8080 npm test    # any OpenCart 4 store
npm run report:modules                     # reports/modules/index.html
npm run verify                             # eslint + bddgen + tsc + prettier
```

### Target store

`demo.opencart.com` shows a Cloudflare bot-verification page to automated browsers coming from CI runners, so the
pipeline provisions its own OpenCart **4.1.0.4** store on the runner (`.github/scripts/start-opencart.sh`: MySQL + PHP
built-in server + demo catalogue, Terms & Conditions required at checkout like the demo site) and tests
`http://localhost:8080`. Run the workflow manually with `target=demo` to aim at the public demo.

## Reports

| Report | Location |
|---|---|
| **Per-module dashboard** (cards per module, scenario status, Jira links) | `reports/modules/index.html` · gh-pages `playwright/modules/` |
| Module summary table | GitHub Actions run summary · `reports/modules/summary.md` |
| Playwright HTML (traces, screenshots, videos) | `reports/playwright-html` |
| Cucumber HTML / JSON / JUnit | `reports/cucumber/` |
| Allure | `reports/allure-report` (CI) |
| Jira | one comment per story with its scenario results (`JIRA_EMAIL` + `JIRA_API_TOKEN` secrets) |

## CI (`.github/workflows`)

* `playwright-ci.yml` — quality gate → provision OpenCart → `setup` + `chromium` + `chromium-auth` → module report →
  Allure → gh-pages → Jira; nightly Firefox/WebKit smoke.
* `autonomous-qa.yml` — *manual*: give a Jira key, Claude (claude-code-action) pulls the story, writes/updates the
  feature, implements the steps with the agents and skills, and opens a PR.

Optional repository secrets: `OPENCART_EMAIL`, `OPENCART_PASSWORD`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `ANTHROPIC_API_KEY`.
