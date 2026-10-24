package com.opencart.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class ComparePage extends BasePage {

    /** Product names sit in the first data row; one column per product. */
    private static final By PRODUCT_NAMES = By.cssSelector("#product-compare table tbody tr td a strong");
    private static final By REMOVE_BUTTONS = By.cssSelector("#product-compare a.btn-danger");

    public ComparePage(WebDriver driver) {
        super(driver);
    }

    public ComparePage open() {
        openRoute("product/compare");
        visible(PAGE_HEADING);
        return this;
    }

    public List<String> productNames() {
        return driver.findElements(PRODUCT_NAMES).stream().map(WebElement::getText).map(String::trim).toList();
    }

    public void remove(String product) {
        int column = productNames().indexOf(product);
        if (column < 0) {
            throw new IllegalArgumentException(product + " is not in the comparison: " + productNames());
        }
        WebElement removeButton = driver.findElements(REMOVE_BUTTONS).get(column);
        scrollIntoView(removeButton);
        removeButton.click();
    }
}
