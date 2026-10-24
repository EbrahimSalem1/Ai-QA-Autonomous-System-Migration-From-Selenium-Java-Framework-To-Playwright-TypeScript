import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type ProductTab = 'Description' | 'Reviews';

export class ProductPage extends BasePage {
  /** The column holding the product heading; related-product cards repeat the same buttons elsewhere. */
  readonly summary: Locator;
  readonly price: Locator;
  readonly quantity: Locator;
  readonly addToCartButton: Locator;
  readonly addToWishListButton: Locator;
  readonly compareButton: Locator;

  constructor(page: Page) {
    super(page);
    this.summary = page.locator('#content .col-sm:has(> h1)');
    this.price = this.summary.locator('.price-new').first();
    this.quantity = page.locator('#input-quantity');
    this.addToCartButton = page.locator('#button-cart');
    this.addToWishListButton = this.actionButton('Add to Wish List');
    this.compareButton = this.actionButton('Compare this Product');
  }

  /** Icon-only buttons are identified by their title (tooltip) — the accessible name OpenCart provides. */
  actionButton(title: string): Locator {
    return this.summary.locator(`button[title="${title}"]`);
  }

  tab(name: ProductTab): Locator {
    const href = name === 'Description' ? '#tab-description' : '#tab-review';
    return this.page.locator(`a[href="${href}"]`);
  }

  async waitUntilLoaded(): Promise<void> {
    await this.addToCartButton.waitFor();
  }

  async addToCart(quantity?: number): Promise<void> {
    if (quantity !== undefined) {
      await this.quantity.fill(String(quantity));
    }
    await this.addToCartButton.click();
  }

  async addToWishList(): Promise<void> {
    await this.addToWishListButton.click();
  }

  async addToComparison(): Promise<void> {
    await this.compareButton.click();
  }
}
