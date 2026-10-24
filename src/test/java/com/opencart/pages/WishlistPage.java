package com.opencart.pages;

import com.opencart.pages.components.HeaderComponent;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class WishlistPage extends BasePage {

    public WishlistPage(WebDriver driver) {
        super(driver);
    }

    /** Opens My Wishlist through the header link (the link carries the customer_token). */
    public WishlistPage open() {
        new HomePage(driver).open();
        new HeaderComponent(driver).openWishList();
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
