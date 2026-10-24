import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchResultsPage extends BasePage {
  readonly searchCriteria: Locator;
  readonly productNames: Locator;

  constructor(page: Page) {
    super(page);
    this.searchCriteria = page.locator('#input-search');
    this.productNames = page.locator('#product-list .product-thumb h4 a');
  }

  product(name: string): Locator {
    return this.productNames.filter({ hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`) });
  }

  async openProduct(name: string): Promise<void> {
    await this.product(name).click();
  }

  /** Waits for the results page, then returns the product names (empty when nothing matched). */
  async names(): Promise<string[]> {
    await this.searchCriteria.waitFor();
    return (await this.productNames.allInnerTexts()).map((n) => n.trim());
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
