package com.opencart.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class WishlistPage extends BasePage {

    public WishlistPage(WebDriver driver) {
        super(driver);
    }

    public WishlistPage open() {
        openRoute("account/wishlist");
        visible(PAGE_HEADING);
        return this;
    }

    private By row(String product) {
        return By.xpath("//div[@id='wishlist']//tbody/tr[.//a[normalize-space()=" + xpathLiteral(product) + "]]");
    }

    public boolean contains(String product) {
        return isDisplayed(row(product));
    }

    public void remove(String product) {
        click(By.xpath("//div[@id='wishlist']//tbody/tr[.//a[normalize-space()=" + xpathLiteral(product) + "]]//a[contains(@class,'btn-danger')]"));
        wait.until(d -> !contains(product));
    }
}
