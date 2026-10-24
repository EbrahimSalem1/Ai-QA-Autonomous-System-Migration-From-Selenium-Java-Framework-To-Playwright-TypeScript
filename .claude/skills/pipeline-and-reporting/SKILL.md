---
name: pipeline-and-reporting
description: Run the quality gate, push, watch the GitHub Actions pipeline, read the per-module report and publish results back to the Jira stories.
---

# Pipeline → report → Jira

## When to use
- After implementing or healing scenarios; when the user asks for the report or CI status.

## Steps
1. Local gate: `npm run verify` (eslint, `bddgen` + `tsc`, prettier). Fix everything before pushing.
2. Push to `master`. Workflow `Playwright BDD` runs: quality → provision OpenCart 4.1 on the runner →
   `setup` + `chromium` + `chromium-auth` → module report → gh-pages → Jira comments; a nightly job adds
   Firefox/WebKit `@smoke`.
3. Watch the run (`gh run watch` or the Actions tab). On failure open the Playwright HTML report / trace from
   gh-pages `playwright/` and hand the failing step + `aiFix` prompt attachment to the `playwright-test-healer` agent.
4. Read `reports/modules/summary.md` (also in the run summary) — one row per module with its Jira key.
5. Results reach Jira through `scripts/jira-publish-results.ts` when `JIRA_EMAIL` / `JIRA_API_TOKEN` secrets exist; locally
   use the Atlassian MCP to comment on the story and transition it (e.g. to Done) when every scenario passes.

## Output
- Green pipeline, `reports/modules/index.html`, one comment per story with scenario results.

## Rules
- Never mark a story Done with failing or skipped scenarios.
- A red build caused by the environment (store down, bot check) is reported as such, not "fixed" in tests.
