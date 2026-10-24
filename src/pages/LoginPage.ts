import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly email: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.locator('#input-email');
    this.password = page.locator('#input-password');
    this.loginButton = page.locator('#form-login').getByRole('button', { name: 'Login' });
  }

  async open(): Promise<void> {
    await this.openRoute('account/login');
    await this.email.waitFor();
  }

  async login(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
