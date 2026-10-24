import { newAddress, newCustomer } from '../data/testData';
import { expect, Then, When } from '../fixtures/fixtures';

When('I proceed to checkout', async ({ cartPage }) => {
  await cartPage.open();
  await cartPage.proceedToCheckout();
});

When('I open the checkout page', async ({ checkoutPage }) => {
  await checkoutPage.open();
});

When('I check out as a guest with valid personal details and address', async ({ checkoutPage }) => {
  await checkoutPage.checkoutAsGuest(newCustomer(), newAddress());
});

When('I choose the shipping method {string}', async ({ checkoutPage }, method: string) => {
  await checkoutPage.chooseShippingMethod(method);
});

When('I agree to the terms and conditions', async ({ checkoutPage }) => {
  await checkoutPage.agreeToTerms();
});

When('I choose the payment method {string}', async ({ checkoutPage }, method: string) => {
  await checkoutPage.choosePaymentMethod(method);
});

When('I confirm the order', async ({ checkoutPage }) => {
  await checkoutPage.confirmOrder();
});

Then('the order cannot be confirmed', async ({ checkoutPage }) => {
  await expect(checkoutPage.confirmButton).toBeDisabled();
});

Then('the order can be confirmed', async ({ checkoutPage }) => {
  await expect(checkoutPage.confirmButton).toBeEnabled();
});

Then('the guest checkout option is not offered', async ({ checkoutPage }) => {
  await expect(checkoutPage.heading).toHaveText('Checkout');
  await expect(checkoutPage.guestOption).toHaveCount(0);
});
