import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ComparePage extends BasePage {
  /** One column per product; the names are in the first row of the comparison table. */
  readonly productNames: Locator;
  readonly removeButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.productNames = page.locator('#product-compare tbody tr td a strong');
    this.removeButtons = page.locator('#product-compare a.btn-danger');
  }

  async open(): Promise<void> {
    await this.openRoute('product/compare');
    await this.heading.waitFor();
  }

  async names(): Promise<string[]> {
    return (await this.productNames.allInnerTexts()).map((n) => n.trim());
  }

  async remove(product: string): Promise<void> {
    const column = (await this.names()).indexOf(product);
    if (column < 0) {
      throw new Error(`${product} is not in the comparison: ${(await this.names()).join(', ')}`);
    }
    await this.removeButtons.nth(column).click();
  }
}
