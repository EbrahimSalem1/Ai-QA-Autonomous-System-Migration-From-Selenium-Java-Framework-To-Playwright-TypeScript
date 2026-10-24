import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { HomePage } from './HomePage';
import { Header } from './components/Header';

export class WishlistPage extends BasePage {
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('#wishlist tbody tr');
  }

  /** Opens My Wishlist through the header link (the link carries the customer_token). */
  async open(): Promise<void> {
    await new HomePage(this.page).open();
    await new Header(this.page).openWishList();
    await this.heading.waitFor();
  }

  row(product: string): Locator {
    return this.rows.filter({ has: this.page.getByRole('link', { name: product, exact: true }) });
  }

  async remove(product: string): Promise<void> {
    await this.row(product).getByRole('link', { name: 'Remove' }).click();
  }
}
