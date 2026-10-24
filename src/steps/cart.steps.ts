import { expect, Given, Then, When } from '../fixtures/fixtures';

Given('I have added {string} to the shopping cart', async ({ shopper }, product: string) => {
  await shopper.addToCart(product);
});

When('I open the shopping cart', async ({ cartPage }) => {
  await cartPage.open();
});

Then(
  'the shopping cart contains {string} with quantity {int}',
  async ({ cartPage }, product: string, quantity: number) => {
    await expect(cartPage.row(product)).toBeVisible();
    await expect(cartPage.quantityOf(product)).toHaveValue(String(quantity));
  },
);

When(
  'I change the quantity of {string} to {int} and update the cart',
  async ({ cartPage }, product: string, quantity: number) => {
    await cartPage.updateQuantity(product, quantity);
  },
);

When('I remove {string} from the shopping cart', async ({ cartPage }, product: string) => {
  await cartPage.remove(product);
});
