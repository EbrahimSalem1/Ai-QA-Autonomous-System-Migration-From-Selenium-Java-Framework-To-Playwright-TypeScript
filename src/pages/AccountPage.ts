import { BasePage } from './BasePage';
import { HomePage } from './HomePage';
import { Header } from './components/Header';

export class AccountPage extends BasePage {
  /** Opens My Account through the header menu (the link carries the customer_token). */
  async open(): Promise<void> {
    await new HomePage(this.page).open();
    await new Header(this.page).openMyAccount();
  }
}
