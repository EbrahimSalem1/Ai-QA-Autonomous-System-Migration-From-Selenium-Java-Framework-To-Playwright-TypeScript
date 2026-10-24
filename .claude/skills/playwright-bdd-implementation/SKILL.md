---
name: playwright-bdd-implementation
description: Implement missing Gherkin steps for this OpenCart framework with Page Object Model, Playwright fixtures and storage state; use when bddgen reports missing steps or a feature needs automation.
---

# Implement steps with POM + fixtures

## When to use
- `npx bddgen` reports missing step definitions.
- A new page, component or business flow is needed.

## Inputs
| Input | Where it comes from |
|---|---|
| Missing step phrases | `npx bddgen` output |
| Live locators | `playwright-test-generator` agent or the `playwright` MCP (`browser_snapshot`) against the seed |
| Test plan | `specs/<module>.plan.md` from the `playwright-test-planner` agent |

## Steps
1. Explore the page with the generator agent / Playwright MCP starting from `tests/seed.spec.ts`; record ids, roles,
   labels. Prefer `#id`, `getByRole`, `getByLabel`; scope repeated widgets.
2. Page object in `src/pages/<Name>Page.ts` extending `BasePage`:
   - `readonly` locators set in the constructor, async action methods, **no `expect`**,
   - waits are for elements / responses / values; never `waitForTimeout`.
3. Register it in `src/fixtures/fixtures.ts` (`<name>Page: async ({ page }, use) => use(new <Name>Page(page))`).
   Multi-page journeys go into the `shopper` fixture; account creation into `customerFactory` (isolated context).
4. Steps in `src/steps/<module>.steps.ts` using `Given/When/Then` from the fixtures file; assertions with web-first
   `expect` (`toBeVisible`, `toHaveText`, `toHaveValue`, `toHaveCount`), `expect.soft` for multi-field checks.
5. Logged-in behaviour: tag the scenario `@auth` — it runs in project `chromium-auth` with `.auth/customer.json`.
   Never navigate to `route=account/...` directly (customer_token) — use the header links.
6. `npm run verify` then `npx playwright test --grep @<module> --repeat-each=2` to prove stability.

## Output
- Page objects, fixture registrations, step files; all scenarios of the module green twice in a row.

## Rules
- One page object per page/component; one steps file per module; shared steps go in `common.steps.ts`.
- Data from `src/data/testData.ts` (unique per scenario) — no hard-coded accounts.

## Example
```ts
// src/steps/cart.steps.ts
When('I remove {string} from the shopping cart', async ({ cartPage }, product: string) => {
  await cartPage.remove(product);
});
```
