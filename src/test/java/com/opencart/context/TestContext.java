package com.opencart.context;

import com.opencart.driver.DriverFactory;
import com.opencart.pages.BasePage;
import com.opencart.pages.HomePage;
import com.opencart.pages.ProductPage;
import com.opencart.pages.SearchResultsPage;
import com.opencart.pages.components.HeaderComponent;
import com.opencart.utils.TestDataFactory.Customer;
import org.openqa.selenium.WebDriver;

import java.util.HashMap;
import java.util.Map;

/**
 * Scenario-scoped state shared between step definition classes through PicoContainer.
 * A new instance is created for every scenario, so no state leaks between parallel scenarios.
 */
public class TestContext {

    private final Map<Class<? extends BasePage>, BasePage> pages = new HashMap<>();
    private Customer customer;

    public WebDriver driver() {
        return DriverFactory.getDriver();
    }

    /** Lazily creates one instance of each page object per scenario. */
    public <T extends BasePage> T page(Class<T> type) {
        return type.cast(pages.computeIfAbsent(type, this::instantiate));
    }

    private BasePage instantiate(Class<? extends BasePage> type) {
        try {
            return type.getConstructor(WebDriver.class).newInstance(driver());
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("Page object " + type.getSimpleName() + " needs a public (WebDriver) constructor", e);
        }
    }

    /** Navigates to a product the way a shopper does: home page, header search, result link. */
    public ProductPage openProductPage(String productName) {
        page(HomePage.class).open();
        page(HeaderComponent.class).searchFor(productName);
        page(SearchResultsPage.class).openProduct(productName);
        return page(ProductPage.class).waitUntilLoaded();
    }

    public Customer customer() {
        if (customer == null) {
            throw new IllegalStateException("No customer in this scenario. Add a 'Given I am a registered customer' step first.");
        }
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
}
