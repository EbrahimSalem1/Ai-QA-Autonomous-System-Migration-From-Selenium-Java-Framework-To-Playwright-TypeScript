import { expect, test as setup, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { env, STORAGE_STATE } from '../config/env';
import { newCustomer, type Customer } from '../data/testData';
import { AccountPage } from '../pages/AccountPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

/**
 * Runs once per test run (project "setup"): signs in the shared @auth customer and saves the
 * authenticated cookies to storageState. Every @auth scenario starts already logged in.
 */
setup('authenticate the shared customer', async ({ page }) => {
  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });

  const customer: Pick<Customer, 'email' | 'password'> =
    env.customerEmail && env.customerPassword
      ? { email: env.customerEmail, password: env.customerPassword }
      : await registerNewCustomer(page);

  // OpenCart keeps sessions in the database without locking: a background request that started before the
  // registration finished can write the session back without the login. So we always finish with an
  // explicit login and verify the account page before saving the state.
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(customer.email, customer.password);
  await expect(loginPage.heading).toHaveText('My Account');

  const accountPage = new AccountPage(page);
  await accountPage.open();
  await expect(accountPage.heading).toHaveText('My Account');

  await page.context().storageState({ path: STORAGE_STATE });
});

async function registerNewCustomer(page: Page): Promise<Customer> {
  const customer = newCustomer();
  const registerPage = new RegisterPage(page);
  await registerPage.open();
  await registerPage.register(customer);
  await expect(registerPage.heading).toHaveText('Your Account Has Been Created!');
  await page.context().clearCookies();
  return customer;
}
