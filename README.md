# OpenCart UI Automation — Selenium + Java + Cucumber BDD (legacy framework)

> Branch `selenium-java-framework`. This is the **source** framework of the migration.
> The migrated Playwright + TypeScript framework lives on `master`.

Automates 8 modules of [demo.opencart.com](https://demo.opencart.com), one Jira story each under epic
[IB-2](https://ebrasalem93.atlassian.net/browse/IB-2):

| Module | Feature file | Jira |
|---|---|---|
| Registration | `registration.feature` | [IB-13](https://ebrasalem93.atlassian.net/browse/IB-13) |
| Login | `login.feature` | [IB-14](https://ebrasalem93.atlassian.net/browse/IB-14) |
| Search | `search.feature` | [IB-15](https://ebrasalem93.atlassian.net/browse/IB-15) |
| Product details | `product-details.feature` | [IB-16](https://ebrasalem93.atlassian.net/browse/IB-16) |
| Shopping cart | `shopping-cart.feature` | [IB-17](https://ebrasalem93.atlassian.net/browse/IB-17) |
| Wishlist | `wishlist.feature` | [IB-18](https://ebrasalem93.atlassian.net/browse/IB-18) |
| Product compare | `product-compare.feature` | [IB-19](https://ebrasalem93.atlassian.net/browse/IB-19) |
| Checkout | `checkout.feature` | [IB-20](https://ebrasalem93.atlassian.net/browse/IB-20) |

## Stack

Java 21 · Selenium 4.51 (Selenium Manager resolves drivers) · Cucumber 7 · TestNG 7 (parallel scenarios) ·
PicoContainer DI · AssertJ · Datafaker · Allure · masterthought Cucumber reports · GitHub Actions.

## Structure

```
src/test/java/com/opencart
├── config/ConfigReader.java        # system property > env var > config.properties
├── driver/DriverFactory.java       # ThreadLocal WebDriver (chrome | firefox | edge, headless)
├── context/TestContext.java        # scenario-scoped state + lazy page objects (PicoContainer)
├── pages/                          # Page Object Model — locators + actions, no assertions
│   ├── BasePage.java               # explicit waits, safe click/type, message polling
│   ├── components/HeaderComponent  # search box, My Account menu
│   └── Register/Login/Account/SearchResults/Product/Cart/Wishlist/Compare/Checkout pages
├── stepdefinitions/                # one class per module + CommonSteps
├── hooks/Hooks.java                # driver lifecycle, @auth session reuse, failure screenshots
├── runners/TestRunner.java         # TestNG runner, parallel data provider
└── utils/                          # TestDataFactory, AuthSessionStore
src/test/resources
├── features/*.feature              # 8 modules, tagged @<module> @IB-<key>
├── config/config.properties
└── testng.xml
```

## Run

```bash
mvn verify                                             # all scenarios, 4 threads, headless Chrome
mvn verify -Dcucumber.filter.tags="@cart or @search"   # by module
mvn verify -Dcucumber.filter.tags="@smoke" -Dheadless=false -Dbrowser=firefox
BASE_URL=http://localhost:8080 mvn verify              # any OpenCart 4 instance
```

`@auth` scenarios share one logged-in session per run: the account is registered once (or the
`CUSTOMER_EMAIL` / `CUSTOMER_PASSWORD` account is used) and its cookies are injected into each
scenario — the Selenium counterpart of Playwright's `storageState`.

## Reports

| Report | Path |
|---|---|
| Per-module dashboard (features, tags, steps, failures) | `target/cucumber-html-reports/overview-features.html` |
| Cucumber HTML | `target/cucumber/cucumber.html` |
| Allure | `allure serve target/allure-results` |
| CI job summary (table by module) | GitHub Actions run summary |

CI publishes every run to the `gh-pages` branch under `selenium/`.
