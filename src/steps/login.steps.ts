import { DEFAULT_PASSWORD, unregisteredEmail } from '../data/testData';
import { expect, Given, When } from '../fixtures/fixtures';

/** Fresh account per scenario (never the shared @auth one), so logging out is safe. */
Given('I am a registered customer', async ({ customerFactory, scenario }) => {
  scenario.customer = await customerFactory.registerCustomer();
});

Given('I am on the Account Login page', async ({ loginPage }) => {
  await loginPage.open();
});

When('I log in with my e-mail and password', async ({ loginPage, scenario }) => {
  if (!scenario.customer) throw new Error('Add "Given I am a registered customer" first');
  await loginPage.login(scenario.customer.email, scenario.customer.password);
});

When('I log in with my e-mail and the password {string}', async ({ loginPage, scenario }, password: string) => {
  if (!scenario.customer) throw new Error('Add "Given I am a registered customer" first');
  await loginPage.login(scenario.customer.email, password);
});

When('I log in with an unregistered e-mail', async ({ loginPage }) => {
  await loginPage.login(unregisteredEmail(), DEFAULT_PASSWORD);
});

When('I log out', async ({ header, currentPage }) => {
  await expect(currentPage.heading).toHaveText('My Account');
  await header.logout();
});
