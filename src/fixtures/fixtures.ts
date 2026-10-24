import { expect, type Browser } from '@playwright/test';
import { createBdd, test as base } from 'playwright-bdd';
import { env } from '../config/env';
import { newCustomer, type Customer } from '../data/testData';
import { AccountPage } from '../pages/AccountPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ComparePage } from '../pages/ComparePage';
import { Header } from '../pages/components/Header';
import { CurrentPage } from '../pages/CurrentPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { RegisterPage } from '../pages/RegisterPage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { WishlistPage } from '../pages/WishlistPage';

/** Scenario-scoped state shared between steps (the counterpart of the Java TestContext). */
export interface ScenarioState {
  customer?: Customer;
}

/** Reusable business flows built from page objects. */
export interface ShopperFlows {
  openProductPage(product: string): Promise<ProductPage>;
  addToCart(product: string): Promise<void>;
  addToComparison(product: string): Promise<void>;
  addToWishList(product: string): Promise<void>;
}

/** Creates accounts in an isolated browser context so the scenario's own session is untouched. */
export interface CustomerFactory {
  registerCustomer(): Promise<Customer>;
}

interface Fixtures {
  scenario: ScenarioState;
  header: Header;
  currentPage: CurrentPage;
  homePage: HomePage;
  registerPage: RegisterPage;
  loginPage: LoginPage;
  accountPage: AccountPage;
  searchResultsPage: SearchResultsPage;
  productPage: ProductPage;
  cartPage: CartPage;
  wishlistPage: WishlistPage;
  comparePage: ComparePage;
  checkoutPage: CheckoutPage;
  shopper: ShopperFlows;
  customerFactory: CustomerFactory;
}

export const test = base.extend<Fixtures>({
  scenario: async ({}, use) => {
    await use({});
  },
  header: async ({ page }, use) => use(new Header(page)),
  currentPage: async ({ page }, use) => use(new CurrentPage(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  accountPage: async ({ page }, use) => use(new AccountPage(page)),
  searchResultsPage: async ({ page }, use) => use(new SearchResultsPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  wishlistPage: async ({ page }, use) => use(new WishlistPage(page)),
  comparePage: async ({ page }, use) => use(new ComparePage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),

  shopper: async ({ homePage, header, searchResultsPage, productPage, currentPage }, use) => {
    const openProductPage = async (product: string): Promise<ProductPage> => {
      await homePage.open();
      await header.searchFor(product);
      await searchResultsPage.openProduct(product);
      await productPage.waitUntilLoaded();
      return productPage;
    };
    await use({
      openProductPage,
      addToCart: async (product) => {
        await (await openProductPage(product)).addToCart();
        await expect(currentPage.message(`You have added ${product} to your shopping cart`)).toBeVisible();
      },
      addToComparison: async (product) => {
        await (await openProductPage(product)).addToComparison();
        await expect(currentPage.message(`You have added ${product} to your product comparison`)).toBeVisible();
      },
      addToWishList: async (product) => {
        await (await openProductPage(product)).addToWishList();
      },
    });
  },

  customerFactory: async ({ browser }, use) => {
    await use({ registerCustomer: () => registerInIsolatedContext(browser) });
  },
});

async function registerInIsolatedContext(browser: Browser): Promise<Customer> {
  const customer = newCustomer();
  const context = await browser.newContext({ baseURL: env.baseUrl, storageState: undefined });
  try {
    const page = await context.newPage();
    const registerPage = new RegisterPage(page);
    await registerPage.open();
    await registerPage.register(customer);
    await expect(registerPage.heading).toHaveText('Your Account Has Been Created!');
  } finally {
    await context.close();
  }
  return customer;
}

export { expect };
export const { Given, When, Then } = createBdd(test);
