import type { DataTable } from 'playwright-bdd';
import { newCustomer } from '../data/testData';
import { expect, Given, Then, When } from '../fixtures/fixtures';
import type { RegistrationField } from '../pages/RegisterPage';

Given('I am on the Register Account page', async ({ registerPage }) => {
  await registerPage.open();
});

Given('a customer account already exists', async ({ customerFactory, scenario }) => {
  scenario.customer = await customerFactory.registerCustomer();
});

When('I register with valid details and accept the privacy policy', async ({ registerPage, scenario }) => {
  scenario.customer = newCustomer();
  await registerPage.register(scenario.customer);
});

When('I register again with the same e-mail', async ({ registerPage, scenario }) => {
  if (!scenario.customer) throw new Error('No existing customer in this scenario');
  await registerPage.register(newCustomer({ email: scenario.customer.email }));
});

When('I register with valid details without accepting the privacy policy', async ({ registerPage }) => {
  await registerPage.fillDetails(newCustomer());
  await registerPage.setPrivacyPolicyAccepted(false);
  await registerPage.submit();
});

When('I submit the registration form empty', async ({ registerPage }) => {
  await registerPage.setPrivacyPolicyAccepted(true);
  await registerPage.submit();
});

Then('I see the following registration field errors:', async ({ registerPage }, table: DataTable) => {
  for (const { field, message } of table.hashes()) {
    await expect.soft(registerPage.fieldError(field as RegistrationField), `error for ${field}`).toContainText(message);
  }
});
