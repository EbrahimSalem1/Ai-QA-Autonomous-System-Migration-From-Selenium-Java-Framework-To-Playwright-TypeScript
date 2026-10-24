import type { DataTable } from 'playwright-bdd';
import { expect, Given, Then, When } from '../fixtures/fixtures';

When('I add the product to the comparison', async ({ productPage }) => {
  await productPage.addToComparison();
});

Given('I have added the following products to the comparison:', async ({ shopper }, table: DataTable) => {
  for (const product of table.raw().flat()) {
    await shopper.addToComparison(product);
  }
});

When('I open the product comparison page', async ({ comparePage }) => {
  await comparePage.open();
});

Then('the product comparison contains:', async ({ comparePage }, table: DataTable) => {
  for (const product of table.raw().flat()) {
    await expect.soft(comparePage.productNames.filter({ hasText: product }).first()).toBeVisible();
  }
});

Then('the product comparison does not contain {string}', async ({ comparePage }, product: string) => {
  await expect(comparePage.productNames.getByText(product, { exact: true })).toHaveCount(0);
});

When('I remove {string} from the comparison', async ({ comparePage }, product: string) => {
  await comparePage.remove(product);
});
