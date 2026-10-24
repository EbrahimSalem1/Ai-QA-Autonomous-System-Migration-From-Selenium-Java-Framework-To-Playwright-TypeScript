import { expect, Given, Then, When } from '../fixtures/fixtures';

/** The session comes from storageState (project "chromium-auth"); this step proves it is valid. */
Given('I am logged in', async ({ accountPage }) => {
  await accountPage.open();
  await expect(accountPage.heading, 'the @auth storage state should open My Account').toHaveText('My Account');
});

Given('I am not logged in', async ({ context, homePage }) => {
  await context.clearCookies();
  await homePage.open();
});

When('I add {string} to my wish list', async ({ shopper }, product: string) => {
  await shopper.addToWishList(product);
});

Given('{string} is in my wish list', async ({ shopper, wishlistPage }, product: string) => {
  await shopper.addToWishList(product);
  await wishlistPage.open();
  await expect(wishlistPage.row(product)).toBeVisible();
});

Then('my wish list contains {string}', async ({ wishlistPage }, product: string) => {
  await wishlistPage.open();
  await expect(wishlistPage.row(product)).toBeVisible();
});

When('I remove {string} from my wish list', async ({ wishlistPage }, product: string) => {
  await wishlistPage.open();
  await wishlistPage.remove(product);
});

Then('my wish list does not contain {string}', async ({ wishlistPage }, product: string) => {
  await wishlistPage.open();
  await expect(wishlistPage.row(product)).toHaveCount(0);
});
