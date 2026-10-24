package com.opencart.pages;

import org.openqa.selenium.WebDriver;

public class AccountPage extends BasePage {

    public AccountPage(WebDriver driver) {
        super(driver);
    }

    public AccountPage open() {
        openRoute("account/account");
        return this;
    }

    /** Waits until the My Account page has loaded (e.g. after a login redirect). */
    public boolean isLoaded() {
        try {
            return wait.until(d -> heading().equals("My Account"));
        } catch (org.openqa.selenium.TimeoutException e) {
            return false;
        }
    }
}
