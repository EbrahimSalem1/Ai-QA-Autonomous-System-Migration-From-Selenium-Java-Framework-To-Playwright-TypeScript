import type { Locator, Page } from '@playwright/test';
import type { Customer } from '../data/testData';
import { BasePage } from './BasePage';

export type RegistrationField = 'First Name' | 'Last Name' | 'E-Mail' | 'Telephone' | 'Password';

export class RegisterPage extends BasePage {
  readonly form: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly telephone: Locator;
  readonly password: Locator;
  readonly privacyPolicy: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('#form-register');
    this.firstName = page.locator('#input-firstname');
    this.lastName = page.locator('#input-lastname');
    this.email = page.locator('#input-email');
    this.telephone = page.locator('#input-telephone');
    this.password = page.locator('#input-password');
    this.privacyPolicy = this.form.locator('input[name="agree"]');
    this.continueButton = this.form.getByRole('button', { name: 'Continue' });
  }

  async open(): Promise<void> {
    await this.openRoute('account/register');
    await this.firstName.waitFor();
  }

  async fillDetails(customer: Customer): Promise<void> {
    await this.firstName.fill(customer.firstName);
    await this.lastName.fill(customer.lastName);
    await this.email.fill(customer.email);
    // Telephone is a store setting in OpenCart 4 — fill it only when the store shows it.
    if (await this.telephone.isVisible()) {
      await this.telephone.fill(customer.telephone);
    }
    await this.password.fill(customer.password);
  }

  async setPrivacyPolicyAccepted(accepted: boolean): Promise<void> {
    await this.privacyPolicy.setChecked(accepted, { force: true });
  }

  async submit(): Promise<void> {
    await this.continueButton.click();
  }

  async register(customer: Customer): Promise<void> {
    await this.fillDetails(customer);
    await this.setPrivacyPolicyAccepted(true);
    await this.submit();
  }

  fieldError(field: RegistrationField): Locator {
    const ids: Record<RegistrationField, string> = {
      'First Name': '#error-firstname',
      'Last Name': '#error-lastname',
      'E-Mail': '#error-email',
      Telephone: '#error-telephone',
      Password: '#error-password',
    };
    return this.page.locator(ids[field]);
  }
}
