import { expect, Given, Then, When } from '../fixtures/fixtures';
import type { ProductTab } from '../pages/ProductPage';

Given('I am on the product page of {string}', async ({ shopper }, product: string) => {
  await shopper.openProductPage(product);
});

When('I open the product {string}', async ({ searchResultsPage, productPage }, product: string) => {
  await searchResultsPage.openProduct(product);
  await productPage.waitUntilLoaded();
});

Then('the product heading is {string}', async ({ productPage }, name: string) => {
  await expect(productPage.heading).toHaveText(name);
});

Then('the product price is displayed', async ({ productPage }) => {
  await expect(productPage.price).toBeVisible();
  await expect(productPage.price).not.toBeEmpty();
});

Then('the quantity field and the Add to Cart button are displayed', async ({ productPage }) => {
  await expect.soft(productPage.quantity).toBeVisible();
  await expect.soft(productPage.addToCartButton).toBeVisible();
});

Then('the product tabs {string} and {string} are available', async ({ productPage }, first: string, second: string) => {
  for (const tab of [first, second] as ProductTab[]) {
    await expect.soft(productPage.tab(tab)).toContainText(tab);
  }
});

When('I set the quantity to {int} and add the product to the cart', async ({ productPage }, quantity: number) => {
  await productPage.addToCart(quantity);
});

Then('the {string} and {string} buttons are displayed', async ({ productPage }, first: string, second: string) => {
  await expect.soft(productPage.actionButton(first)).toBeVisible();
  await expect.soft(productPage.actionButton(second)).toBeVisible();
});
