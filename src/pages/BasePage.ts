import type { Locator, Page } from '@playwright/test';
import { routeUrl } from '../config/env';

/**
 * Base for all page and component objects.
 * Page objects expose locators and intent-revealing actions; they never assert —
 * assertions are written in the step definitions with Playwright's web-first `expect`.
 */
export abstract class BasePage {
  readonly heading: Locator;
  /** Where OpenCart prints messages: the AJAX alert container, the main content and page-level alerts. */
  readonly messageAreas: Locator;

  constructor(protected readonly page: Page) {
    this.heading = page.locator('#content h1');
    this.messageAreas = page.locator('#alert, #content, .alert');
  }

  protected async openRoute(route: string): Promise<void> {
    await this.page.goto(routeUrl(route));
  }

  /** First visible area (alert or content) containing the text — use with `toBeVisible()`. */
  message(text: string): Locator {
    return this.messageAreas.filter({ hasText: text }).first();
  }
}
