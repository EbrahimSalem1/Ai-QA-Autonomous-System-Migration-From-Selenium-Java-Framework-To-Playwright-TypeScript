package com.opencart.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class CartPage extends BasePage {

    private static final By CHECKOUT_BUTTON = By.cssSelector("#content a.btn-primary[href*='checkout/checkout']");

    public CartPage(WebDriver driver) {
        super(driver);
    }

    public CartPage open() {
        openRoute("checkout/cart");
        visible(PAGE_HEADING);
        return this;
    }

    private By row(String product) {
        return By.xpath("//div[@id='shopping-cart']//tbody/tr[.//a[normalize-space()=" + xpathLiteral(product) + "]]");
    }

    private By quantityInput(String product) {
        return By.xpath("//div[@id='shopping-cart']//tbody/tr[.//a[normalize-space()=" + xpathLiteral(product) + "]]//input[@name='quantity']");
    }

    public boolean contains(String product) {
        return isDisplayed(row(product));
    }

    public int quantityOf(String product) {
        WebElement input = visible(quantityInput(product));
        return Integer.parseInt(input.getDomProperty("value").trim());
    }

    public void updateQuantity(String product, int quantity) {
        type(quantityInput(product), String.valueOf(quantity));
        click(By.xpath("//div[@id='shopping-cart']//tbody/tr[.//a[normalize-space()=" + xpathLiteral(product) + "]]//button[@title='Update']"));
    }

    public void remove(String product) {
        click(By.xpath("//div[@id='shopping-cart']//tbody/tr[.//a[normalize-space()=" + xpathLiteral(product) + "]]//a[@title='Remove']"));
    }

    public void proceedToCheckout() {
        click(CHECKOUT_BUTTON);
    }
}
