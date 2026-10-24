import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  async open(): Promise<void> {
    await this.openRoute('common/home');
  }
}
