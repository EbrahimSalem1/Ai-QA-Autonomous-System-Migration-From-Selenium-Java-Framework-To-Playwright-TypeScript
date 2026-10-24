import { expect, test } from '../src/fixtures/fixtures';

/**
 * Seed test for the Playwright AI agents (`.claude/agents/playwright-test-*.md`).
 * The planner and generator start every exploration from this state: the store home page,
 * with all page-object fixtures available.
 */
test.describe('OpenCart seed', () => {
  test('seed', async ({ homePage, header }) => {
    await homePage.open();
    await expect(header.searchInput).toBeVisible();
  });
});
