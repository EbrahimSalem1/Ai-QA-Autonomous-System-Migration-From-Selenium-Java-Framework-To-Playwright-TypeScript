import { expect, Given, Then } from '../fixtures/fixtures';

Given('I am on the home page', async ({ homePage }) => {
  await homePage.open();
});

Then('the page heading is {string}', async ({ currentPage }, heading: string) => {
  await expect(currentPage.heading).toContainText(heading);
});

Then('I see the warning {string}', async ({ currentPage }, message: string) => {
  await expect(currentPage.message(message)).toBeVisible();
});

Then('I see the success message {string}', async ({ currentPage }, message: string) => {
  await expect(currentPage.message(message)).toBeVisible();
});

Then('I see the message {string}', async ({ currentPage }, message: string) => {
  await expect(currentPage.message(message)).toBeVisible();
});
