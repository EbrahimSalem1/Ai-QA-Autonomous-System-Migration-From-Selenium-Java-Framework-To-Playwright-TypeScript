---
name: jira-story-analysis
description: Read a Jira user story (e.g. "IB-17", "automate the cart story") with the Atlassian MCP, analyse it, and turn its acceptance criteria into a Gherkin feature file for this OpenCart framework.
---

# Jira story → analysis → Gherkin

## When to use
- The user gives a Jira key (`IB-13` … `IB-20`) or asks to automate / analyse a story or epic (`IB-2`).
- A feature file must be created or updated from acceptance criteria.

## Inputs
| Input | Where it comes from |
|---|---|
| Story key | User message, or JQL `parent = IB-2 ORDER BY key` via the Atlassian MCP |
| Story text | Atlassian MCP `getJiraIssue` (fallback: `npm run jira:story -- <KEY>` → `specs/jira/<KEY>.md`) |
| Existing steps | `npx bddgen export` (lists every step phrase already implemented) |

## Steps
1. Fetch the story with the Atlassian MCP (`cloudId` = `ebrasalem93.atlassian.net`). Read summary, description, labels, parent epic.
2. Produce an analysis in the chat (not a file):
   - each AC restated as *Given / When / Then* with its data,
   - ambiguities and questions for the PO,
   - risks (shared data, auth, async UI), test data needed, explicit out-of-scope.
3. Map every AC to one scenario. Reuse existing step phrases from `npx bddgen export`; add new phrases only when the
   behaviour is new.
4. Write/extend `features/<module>.feature`:
   - feature tags: `@<module> @<KEY>`; add `@smoke` to the main happy path; `@auth` when the user must be logged in,
   - user-facing language, no selectors or URLs, one behaviour per scenario, `Background` only for shared navigation.
5. Run `npx bddgen` — new phrases are reported as missing steps; hand them to the `playwright-bdd-implementation` skill.
6. If an AC does not match the real application behaviour, keep the scenario truthful to the product, then comment on
   the story (Atlassian MCP comment tool) describing the difference and update the AC with the PO.

## Output
- `features/<module>.feature` (and the same file on branch `selenium-java-framework` when parity is required).
- A short analysis + list of new step phrases.

## Rules
- Feature files are shared with the Selenium framework: never put Playwright-specific wording in Gherkin.
- One story key per feature; scenario names describe behaviour, not implementation.

## Example
`IB-17` AC2 "change quantity to 3 and click Update" →
```gherkin
Scenario: Update the quantity of a product in the cart
  Given I have added "iPhone" to the shopping cart
  And I open the shopping cart
  When I change the quantity of "iPhone" to 3 and update the cart
  Then I see the success message "Success: You have modified your shopping cart!"
  And the shopping cart contains "iPhone" with quantity 3
```
