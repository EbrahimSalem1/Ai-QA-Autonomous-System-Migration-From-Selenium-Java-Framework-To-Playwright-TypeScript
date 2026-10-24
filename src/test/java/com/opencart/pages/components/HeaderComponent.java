package com.opencart.pages.components;

import com.opencart.pages.BasePage;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;

/** Store header shared by every page: search box and the My Account menu. */
public class HeaderComponent extends BasePage {

    private static final By SEARCH_INPUT = By.cssSelector("header input[name='search']");
    private static final By SEARCH_BUTTON = By.cssSelector("header input[name='search'] + button");
    private static final By ACCOUNT_MENU = By.xpath("//div[@id='top']//span[contains(@class,'dropdown-toggle')][contains(normalize-space(),'My Account')]");
    private static final By MY_ACCOUNT_LINK = By.xpath("//div[@id='top']//ul[contains(@class,'dropdown-menu')]//a[normalize-space()='My Account']");
    private static final By LOGOUT_LINK = By.cssSelector("#top .dropdown-menu a[href*='account/logout']");
    private static final By WISH_LIST_LINK = By.id("wishlist-total");

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

    /**
     * Account pages are protected by a per-session customer_token in the URL; opening them directly logs the
     * customer out. The header links carry the token, so account navigation always goes through them.
     */
    public void openMyAccount() {
        click(ACCOUNT_MENU);
        click(MY_ACCOUNT_LINK);
    }

    public void openWishList() {
        click(WISH_LIST_LINK);
    }

    public void logout() {
        click(ACCOUNT_MENU);
        click(LOGOUT_LINK);
    }
}
