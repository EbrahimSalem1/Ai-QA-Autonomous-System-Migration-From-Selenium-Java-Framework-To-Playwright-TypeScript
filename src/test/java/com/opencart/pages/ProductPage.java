package com.opencart.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class ProductPage extends BasePage {

    private static final By PRICE = By.cssSelector("#content .price-new");
    private static final By QUANTITY = By.id("input-quantity");
    private static final By ADD_TO_CART = By.id("button-cart");
    private static final By DESCRIPTION_TAB = By.cssSelector("a[href='#tab-description']");
    private static final By REVIEWS_TAB = By.cssSelector("a[href='#tab-review']");

    public ProductPage(WebDriver driver) {
        super(driver);
    }

    private static By actionButton(String title) {
        return By.cssSelector("#content button[title=\"" + title + "\"]");
    }

    public ProductPage waitUntilLoaded() {
        visible(ADD_TO_CART);
        return this;
    }

    public boolean isPriceDisplayed() {
        return isDisplayed(PRICE) && !textOf(PRICE).isBlank();
    }

    public boolean isQuantityFieldDisplayed() {
        return isDisplayed(QUANTITY);
    }

    public boolean isAddToCartDisplayed() {
        return isDisplayed(ADD_TO_CART);
    }

    public boolean isActionDisplayed(String title) {
        return isDisplayed(actionButton(title));
    }

    public String tabLabel(String tab) {
        return switch (tab) {
            case "Description" -> textOf(DESCRIPTION_TAB);
            case "Reviews" -> textOf(REVIEWS_TAB);
            default -> throw new IllegalArgumentException("Unknown product tab: " + tab);
        };
    }

    public void setQuantity(int quantity) {
        type(QUANTITY, String.valueOf(quantity));
    }

    public void addToCart() {
        click(ADD_TO_CART);
    }

    public void addToWishList() {
        click(actionButton("Add to Wish List"));
    }

    public void addToComparison() {
        click(actionButton("Compare this Product"));
    }
}
