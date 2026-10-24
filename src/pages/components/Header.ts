import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

/** Store header shared by every page: search box and the My Account menu. */
export class Header extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly accountMenu: Locator;
  readonly myAccountLink: Locator;
  readonly logoutLink: Locator;
  readonly wishListLink: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('header input[name="search"]');
    this.searchButton = page.locator('header input[name="search"] + button');
    this.accountMenu = page.locator('#top').getByRole('button', { name: 'My Account' });
    this.myAccountLink = page.locator('#top .dropdown-menu').getByRole('link', { name: 'My Account' });
    this.logoutLink = page.locator('#top .dropdown-menu').getByRole('link', { name: 'Logout' });
    this.wishListLink = page.locator('#wishlist-total');
  }

  async searchFor(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
  }

  /**
   * Account pages are protected by a per-session `customer_token` in the URL; opening them directly
   * logs the customer out. The header links carry the token, so account navigation always goes through them.
   */
  async openMyAccount(): Promise<void> {
    await this.accountMenu.click();
    await this.myAccountLink.click();
  }

  async openWishList(): Promise<void> {
    await this.wishListLink.click();
  }

  async logout(): Promise<void> {
    await this.accountMenu.click();
    await this.logoutLink.click();
  }
}
