import { expect, Then, When } from '../fixtures/fixtures';

When('I search for {string}', async ({ header }, keyword: string) => {
  await header.searchFor(keyword);
});

Then('the search results contain the product {string}', async ({ searchResultsPage }, product: string) => {
  await expect(searchResultsPage.product(product)).toBeVisible();
});

Then('more than one product is found', async ({ searchResultsPage }) => {
  await expect(searchResultsPage.productNames.nth(1)).toBeVisible();
});

Then('every product name in the results contains {string}', async ({ searchResultsPage }, keyword: string) => {
  const names = await searchResultsPage.names();
  expect(names.length).toBeGreaterThan(0);
  for (const name of names) {
    expect.soft(name.toLowerCase(), `result "${name}"`).toContain(keyword.toLowerCase());
  }
});
