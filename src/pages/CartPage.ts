import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly rows: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('#shopping-cart tbody tr');
    this.checkoutButton = page.locator('#content').getByRole('link', { name: 'Checkout', exact: true });
  }

  async open(): Promise<void> {
    await this.openRoute('checkout/cart');
    await this.heading.waitFor();
  }

  row(product: string): Locator {
    return this.rows.filter({ has: this.page.getByRole('link', { name: product, exact: true }) });
  }

  quantityOf(product: string): Locator {
    return this.row(product).locator('input[name="quantity"]');
  }

  async updateQuantity(product: string, quantity: number): Promise<void> {
    await this.quantityOf(product).fill(String(quantity));
    await this.row(product).locator('button[title="Update"]').click();
  }

  async remove(product: string): Promise<void> {
    await this.row(product).locator('a[title="Remove"]').click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await this.page.waitForURL(/route=checkout\/checkout/);
  }
}
