package com.opencart.pages;

import com.opencart.pages.components.HeaderComponent;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;

public class AccountPage extends BasePage {

    public AccountPage(WebDriver driver) {
        super(driver);
    }

    /** Opens My Account through the header menu (the link carries the customer_token). */
    public AccountPage open() {
        new HomePage(driver).open();
        new HeaderComponent(driver).openMyAccount();
        return this;
    }

    /** Waits until the My Account page has loaded (e.g. after a login redirect). */
    public boolean isLoaded() {
        try {
            return wait.until(d -> !d.findElements(PAGE_HEADING).isEmpty() && heading().equals("My Account"));
        } catch (TimeoutException e) {
            return false;
        }
    }
}
