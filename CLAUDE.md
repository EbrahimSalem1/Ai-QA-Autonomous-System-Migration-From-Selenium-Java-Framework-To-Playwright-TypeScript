# QA Autonomous System — OpenCart Playwright BDD

This repository is driven by Claude Code + MCP. Read this file before changing anything.

## What lives here

| Path | Purpose |
|---|---|
| `features/*.feature` | Gherkin, one file per module, tagged `@<module> @IB-<key>`. **Identical** to the legacy Selenium branch. |
| `src/pages/` | Page Object Model. Locators + actions only, never `expect`. |
| `src/fixtures/fixtures.ts` | Playwright fixtures: page objects, `shopper` flows, `customerFactory`, `scenario` state. Exports `Given/When/Then`. |
| `src/steps/*.steps.ts` | Step definitions — the only place assertions live (web-first `expect`). |
| `src/auth/auth.setup.ts` | `setup` project: logs the shared customer in once and saves `storageState` to `.auth/customer.json`. |
| `tests/seed.spec.ts` | Seed for the Playwright AI agents (`--project=agents`). |
| `specs/` | Test plans written by the planner agent; `specs/jira/<KEY>.md` holds pulled stories. |
| `scripts/` | Per-module report, Jira story pull, Jira result publishing. |
| `.claude/agents/` | Playwright planner / generator / healer agents (`npx playwright init-agents --loop=claude`). |
| `.claude/skills/` | The QA Autonomous System workflow as `SKILL.md` files (start from `_template/SKILL.md`). |
| `.github/workflows/` | CI: quality gate → provision OpenCart → BDD run → module report → gh-pages → Jira. |

## MCP servers (`.mcp.json`)

* `atlassian` — read stories / epics, comment results (Jira site `ebrasalem93.atlassian.net`, project `IB`, epic `IB-2`).
* `playwright-test` — used by the planner/generator/healer agents (runs against the seed test).
* `playwright` — free exploration of the live store to confirm locators.

## End-to-end workflow (story → pipeline)

1. **Analyse the story** — skill `jira-story-analysis`: read the Jira story with the Atlassian MCP, list ACs, risks, test data, out-of-scope.
2. **Write Gherkin** — same skill: add/extend `features/<module>.feature`, reuse existing step phrases (see `npx bddgen export`).
3. **Plan** — `playwright-test-planner` agent explores the store from the seed and writes `specs/<module>.plan.md`.
4. **Implement** — skill `playwright-bdd-implementation`: page objects + fixtures + steps; use `playwright-test-generator` to confirm locators live.
5. **Run & heal** — `npm test -- --grep @<module>`; failures go to the `playwright-test-healer` agent (playwright-bdd attaches an AI-fix prompt to each failure).
6. **Ship** — skill `pipeline-and-reporting`: `npm run verify`, push, watch CI, read `reports/modules/index.html`, publish results to Jira.
7. **Migrating legacy code** — skill `selenium-to-playwright-migration` maps every Java class to its TypeScript counterpart.

## Conventions (enforced in review)

* Locators: `#id` / role / label first; scope repeated widgets (related products duplicate product buttons).
* No `waitForTimeout`, no hard sleeps. Wait for an element, a response, or a value. The single allowed `networkidle`
  is `CheckoutPage.settle()` (OpenCart's unlocked DB session — see below).
* Scenarios are independent and parallel-safe: unique data from `src/data/testData.ts`, never depend on order.
* `@auth` scenarios run in project `chromium-auth` with the saved storage state; never log that session out.
* Every scenario carries `@<module>` and the story key; `@smoke` marks the cross-browser subset.

## OpenCart 4 facts that shape the code

* Account pages need a per-session `customer_token` in the URL; opening `route=account/...` directly **logs the
  customer out**. Reach My Account / My Wishlist through `Header.openMyAccount()` / `openWishList()`.
* Sessions are stored in MySQL without locking. Concurrent AJAX calls can overwrite each other's session writes,
  so checkout waits for responses and settles between steps, and the auth setup always ends with a fresh login.
* `demo.opencart.com` shows a Cloudflare bot check to automated browsers from CI. CI provisions its own store
  (`.github/scripts/start-opencart.sh`, OpenCart 4.1.0.4, Terms & Conditions required at checkout like the demo).

## Commands

```bash
npm test                       # bddgen + all projects (setup → chromium + chromium-auth)
npm run test:smoke             # @smoke only
npx playwright test --grep @cart
BASE_URL=http://localhost:8080 npm test
npm run report:modules         # build reports/modules/index.html from the last run
npm run verify                 # lint + typecheck + prettier
```
