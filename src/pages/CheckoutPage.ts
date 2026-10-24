import type { Locator, Page } from '@playwright/test';
import type { Address, Customer } from '../data/testData';
import { BasePage } from './BasePage';

type AddressType = 'payment' | 'shipping';

/**
 * OpenCart 4 one-page checkout. Each section is rendered/saved by AJAX, so every action waits
 * for the response or element it depends on — never for a fixed time.
 */
export class CheckoutPage extends BasePage {
  readonly guestOption: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly telephone: Locator;
  readonly continueButton: Locator;
  readonly guestDetailsSaved: Locator;
  readonly shippingMethodsButton: Locator;
  readonly shippingModal: Locator;
  readonly selectedShippingMethod: Locator;
  readonly paymentMethodsButton: Locator;
  readonly paymentModal: Locator;
  readonly selectedPaymentMethod: Locator;
  readonly agreeTerms: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page);
    this.guestOption = page.locator('#input-guest');
    this.firstName = page.locator('#input-firstname');
    this.lastName = page.locator('#input-lastname');
    this.email = page.locator('#input-email');
    this.telephone = page.locator('#input-telephone');
    this.continueButton = page.locator('#button-register');
    this.guestDetailsSaved = page
      .locator('#alert .alert-success')
      .filter({ hasText: 'guest account information has been saved' });
    this.shippingMethodsButton = page.locator('#button-shipping-methods');
    this.shippingModal = page.locator('#modal-shipping');
    this.selectedShippingMethod = page.locator('#input-shipping-method');
    this.paymentMethodsButton = page.locator('#button-payment-methods');
    this.paymentModal = page.locator('#modal-payment');
    this.selectedPaymentMethod = page.locator('#input-payment-method');
    this.agreeTerms = page.locator('#input-checkout-agree');
    // Rendered disabled (without an id) until shipping, payment and terms are complete, then as #button-confirm.
    this.confirmButton = page.locator('#checkout-confirm').getByRole('button', { name: 'Confirm Order' });
  }

  async open(): Promise<void> {
    await this.openRoute('checkout/checkout');
  }

  async checkoutAsGuest(customer: Customer, address: Address): Promise<void> {
    await this.guestOption.check();
    await this.firstName.fill(customer.firstName);
    await this.lastName.fill(customer.lastName);
    await this.email.fill(customer.email);
    if (await this.telephone.isVisible()) {
      await this.telephone.fill(customer.telephone);
    }
    // Payment address is a store setting; shipping address appears when the cart needs shipping.
    await this.fillAddressIfShown('payment', customer, address);
    await this.fillAddressIfShown('shipping', customer, address);
    await this.continueButton.click();
    await this.guestDetailsSaved.waitFor();
    await this.settle();
  }

  /**
   * After every save OpenCart reloads the other checkout sections in parallel. Its database session is not
   * locked, so starting the next save while those reloads are in flight can lose session data. Waiting for
   * the network to go quiet is the documented exception to the "no networkidle" rule for this page.
   */
  private async settle(): Promise<void> {
    // eslint-disable-next-line playwright/no-networkidle -- see the comment above: OpenCart session race
    await this.page.waitForLoadState('networkidle');
  }

  private async fillAddressIfShown(type: AddressType, customer: Customer, address: Address): Promise<void> {
    const field = (name: string): Locator => this.page.locator(`#input-${type}-${name}`);
    if (!(await field('address-1').isVisible())) {
      return;
    }
    if (await field('firstname').isVisible()) {
      await field('firstname').fill(customer.firstName);
      await field('lastname').fill(customer.lastName);
    }
    await field('address-1').fill(address.address1);
    await field('city').fill(address.city);
    await field('postcode').fill(address.postcode);
    await field('country').selectOption({ label: address.country });
    // Regions are loaded by AJAX after the country changes: wait for real options, then pick the first.
    const zone = field('zone');
    await zone.locator('option[value]:not([value=""])').first().waitFor({ state: 'attached' });
    const firstZone = await zone.locator('option[value]:not([value=""])').first().getAttribute('value');
    await zone.selectOption(firstZone ?? '');
  }

  async chooseShippingMethod(name: string): Promise<void> {
    await this.shippingMethodsButton.click();
    await this.chooseInModal(this.shippingModal, name, '#button-shipping-method');
    await this.waitForValue('#input-shipping-method');
  }

  async choosePaymentMethod(name: string): Promise<void> {
    await this.paymentMethodsButton.click();
    await this.chooseInModal(this.paymentModal, name, '#button-payment-method');
    await this.waitForValue('#input-payment-method');
  }

  /** The chosen method is written into a read-only input by jQuery (`.val()`), so poll the DOM property. */
  private async waitForValue(selector: string): Promise<void> {
    await this.page.waitForFunction(
      (sel) => ((document.querySelector(sel) as HTMLInputElement | null)?.value ?? '') !== '',
      selector,
    );
  }

  /**
   * The options are fetched by AJAX into a Bootstrap modal: wait for the option itself, then submit and
   * wait for the save response (requests are queued by OpenCart's AJAX chain, so a click alone is not enough).
   */
  private async chooseInModal(modal: Locator, optionLabel: string, continueSelector: string): Promise<void> {
    const option = modal.getByLabel(optionLabel, { exact: false });
    await option.waitFor();
    await option.check({ force: true });
    const saveRoute = continueSelector.includes('shipping') ? 'shipping_method.save' : 'payment_method.save';
    const [response] = await Promise.all([
      this.page.waitForResponse((r) => r.url().includes(saveRoute) && r.request().method() === 'POST'),
      modal.locator(continueSelector).click(),
    ]);
    const body = (await response.json().catch(() => ({}))) as { error?: unknown };
    if (body.error) {
      throw new Error(`OpenCart rejected ${saveRoute}: ${JSON.stringify(body.error)}`);
    }
    await modal.waitFor({ state: 'hidden' });
    await this.settle();
  }

  /** Shown only when the store assigns a Terms page to checkout (demo.opencart.com and the CI store do). */
  async agreeToTerms(): Promise<void> {
    await Promise.all([
      this.page.waitForResponse((r) => r.url().includes('payment_method.agree')),
      this.agreeTerms.setChecked(true, { force: true }),
    ]);
    await this.settle();
  }

  async confirmOrder(): Promise<void> {
    await this.confirmButton.click();
  }
}
