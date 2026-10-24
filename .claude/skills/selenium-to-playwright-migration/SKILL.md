---
name: selenium-to-playwright-migration
description: Migrate classes from the legacy Selenium/Java Cucumber framework (branch selenium-java-framework) to this Playwright/TypeScript framework, keeping the Gherkin identical.
---

# Selenium/Java → Playwright/TypeScript migration

## When to use
- Porting a page object, step class, hook or utility from `selenium-java-framework`.
- Checking behavioural parity between the two frameworks.

## Inputs
| Input | Where it comes from |
|---|---|
| Java source | `git show selenium-java-framework:src/test/java/com/opencart/<path>.java` |
| Feature files | identical in both branches (`src/test/resources/features` ↔ `features`) |

## Mapping
| Selenium / Java | Playwright / TypeScript |
|---|---|
| `DriverFactory` (ThreadLocal WebDriver) | built-in `page` / `context` fixtures, one per test |
| `ConfigReader` + `config.properties` | `src/config/env.ts` + `.env` / CI env vars |
| `BasePage` + `WebDriverWait` / `ExpectedConditions` | `BasePage` + auto-waiting locators; web-first `expect` |
| `By.id / By.xpath` constants | `readonly` `Locator` properties (`#id`, `getByRole`, `getByLabel`, `filter({ has })`) |
| JS click fallback for intercepted clicks | actionability checks; `{ force: true }` only for styled checkboxes |
| `TestContext` + PicoContainer DI | `test.extend` fixtures (`scenario`, page objects, `shopper`, `customerFactory`) |
| Cucumber `@Before/@After` hooks | fixtures setup/teardown; screenshots, video, trace via `use` config |
| `@Before("@auth")` + cookie injection (`AuthSessionStore`) | `setup` project + `storageState` + `chromium-auth` project (`grep: /@auth/`) |
| TestNG parallel `DataProvider` | `fullyParallel` + `workers` |
| AssertJ / SoftAssertions | `expect` / `expect.soft` |
| `jQuery.active` wait | `waitForResponse` / `waitForLoadState` |
| masterthought + Allure reports | Playwright HTML, cucumber HTML/JSON/JUnit, Allure, `scripts/module-report.ts` |

## Steps
1. Read the Java class and its feature scenarios.
2. Translate by the mapping table; keep public method names (`openProductPage`, `addToCart`, …) so steps read the same.
3. Delete waits that Playwright makes redundant; keep the ones that encode real app behaviour (AJAX/session).
4. Run the module on both branches against the same `BASE_URL`; results must match scenario-for-scenario.
5. Record anything non-obvious in `docs/MIGRATION_GUIDE.md`.

## Rules
- Never change Gherkin during migration; behaviour changes are a separate story.
