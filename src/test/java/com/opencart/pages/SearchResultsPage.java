package com.opencart.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.time.Duration;
import java.util.List;

public class SearchResultsPage extends BasePage {

    private static final By PRODUCT_NAMES = By.cssSelector("#product-list .product-thumb h4 a");
    private static final By SEARCH_CRITERIA = By.id("input-search");

    public SearchResultsPage(WebDriver driver) {
        super(driver);
    }

    public SearchResultsPage waitUntilLoaded() {
        visible(SEARCH_CRITERIA);
        return this;
    }

    public List<String> productNames() {
        waitUntilLoaded();
        if (!isDisplayedWithin(PRODUCT_NAMES, Duration.ofSeconds(3))) {
            return List.of();
        }
        return driver.findElements(PRODUCT_NAMES).stream().map(WebElement::getText).map(String::trim).toList();
    }

    public void openProduct(String name) {
        waitUntilLoaded();
        click(By.xpath("//div[@id='product-list']//h4/a[normalize-space()=" + xpathLiteral(name) + "]"));
    }
}
