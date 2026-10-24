package com.opencart.pages.components;

import com.opencart.pages.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;

/** Store header shared by every page: search box and the My Account menu. */
public class HeaderComponent extends BasePage {

    private static final By SEARCH_INPUT = By.cssSelector("header input[name='search']");
    private static final By SEARCH_BUTTON = By.cssSelector("header input[name='search'] + button");
    private static final By ACCOUNT_MENU = By.cssSelector("#top .dropdown .dropdown-toggle");
    private static final By LOGOUT_LINK = By.cssSelector("#top .dropdown-menu a[href*='account/logout']");

    public HeaderComponent(WebDriver driver) {
        super(driver);
    }

    public void searchFor(String keyword) {
        type(SEARCH_INPUT, keyword);
        click(SEARCH_BUTTON);
    }

    public void searchWithEnter(String keyword) {
        type(SEARCH_INPUT, keyword);
        visible(SEARCH_INPUT).sendKeys(Keys.ENTER);
    }

    public void logout() {
        click(ACCOUNT_MENU);
        click(LOGOUT_LINK);
    }
}
