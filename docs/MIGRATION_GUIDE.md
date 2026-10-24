# Migration guide — Selenium/Java → Playwright/TypeScript

Source: branch `selenium-java-framework` · Target: `master` · Gherkin: unchanged (29 scenarios, 8 modules).

## Concept mapping

| Concern | Selenium + Java (before) | Playwright + TypeScript (after) |
|---|---|---|
| Runner | TestNG `AbstractTestNGCucumberTests`, parallel `@DataProvider` | Playwright Test via playwright-bdd, `fullyParallel` |
| Gherkin binding | Cucumber-JVM annotations (`@Given`) | `createBdd(test)` → `Given/When/Then` with fixtures |
| Browser lifecycle | `DriverFactory` ThreadLocal + `@Before/@After` hooks | built-in `browser/context/page` fixtures |
| Configuration | `ConfigReader` (system prop > env > properties) | `src/config/env.ts` (env / `.env`) + `playwright.config.ts` |
| Dependency injection | PicoContainer `TestContext` | `test.extend` fixtures (`scenario`, page objects, `shopper`, `customerFactory`) |
| Page objects | `By` constants + `WebDriverWait` helpers | `readonly Locator` + auto-waiting actions |
| Waiting | `ExpectedConditions`, JS click fallback, `jQuery.active` | actionability checks, web-first `expect`, `waitForResponse` |
| Assertions | AssertJ, `SoftAssertions` | `expect`, `expect.soft` (auto-retrying) |
| Logged-in state | `@Before("@auth")` cookie injection (`AuthSessionStore`) | `setup` project + `storageState` + `chromium-auth` project |
| Account creation for a scenario | UI registration in the same driver, then delete cookies | `customerFactory` in an isolated browser context |
| Failure evidence | screenshot + URL attached in `@After` | trace, screenshot, video (`retain-on-failure`) + AI-fix prompt |
| Reports | Cucumber HTML/JSON, masterthought per-feature, Allure | Playwright HTML, Cucumber HTML/JSON/JUnit, Allure, module dashboard |
| Cross-browser | `-Dbrowser=firefox` (one browser per run) | projects (`firefox-smoke`, `webkit-smoke`) in one run |

## What disappeared

* `DriverFactory`, `ConfigReader` boilerplate, `ThreadLocal`, implicit/explicit wait plumbing.
* JavaScript click fallbacks and `scrollIntoView` (Playwright scrolls and checks actionability).
* Per-scenario cookie injection — replaced by one `storageState` file.

## What stayed on purpose

These waits encode real OpenCart behaviour, so both frameworks keep them:

1. **customer_token** — account pages need the token from the header links; opening `route=account/...` directly
   logs the customer out. Both frameworks navigate via `Header.openMyAccount()` / `openWishList()`.
2. **Unlocked DB sessions** — concurrent AJAX writes can drop session data, so checkout settles between steps
   (`jQuery.active` in Java, `waitForResponse` + network quiet in TS) and the shared login is always re-done after
   registration before saving cookies / storage state.
3. **Repeated widgets** — related-product cards repeat "Add to Wish List / Compare" buttons; both frameworks scope the
   actions to the product summary column.

## Findings raised during migration

* `IB-20` AC4: OpenCart 4.1 disables **Confirm Order** until the terms are accepted instead of showing a warning.
  The scenario now checks the real behaviour; the story was updated and commented.
* `demo.opencart.com` blocks CI browsers with a Cloudflare challenge; CI uses a provisioned OpenCart 4.1.0.4 store.

## Parity check

Run both branches against the same store and compare the module summaries:

```bash
# Selenium branch
BASE_URL=http://localhost:8080 mvn verify && python3 .github/scripts/cucumber_summary.py target/cucumber/cucumber.json
# Playwright (master)
BASE_URL=http://localhost:8080 npm test && npm run report:modules
```
