package com.opencart.pages;

import com.opencart.config.ConfigReader;
import org.openqa.selenium.By;
import org.openqa.selenium.ElementClickInterceptedException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

/**
 * Base for all page and component objects. Page objects expose intent-revealing actions and queries;
 * they never assert (assertions live in the step definitions).
 */
public abstract class BasePage {

    protected static final By PAGE_HEADING = By.cssSelector("#content h1");
    /** Where OpenCart prints messages: the AJAX alert container, the main content and page-level alerts. */
    protected static final By MESSAGE_AREAS = By.cssSelector("#alert, #content, .alert");

    protected final WebDriver driver;
    protected final WebDriverWait wait;

    protected BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(ConfigReader.getInt("explicit.wait.seconds")));
        this.wait.ignoring(StaleElementReferenceException.class);
    }

    protected void openRoute(String route) {
        driver.get(ConfigReader.baseUrl() + "/index.php?route=" + route + "&language=" + ConfigReader.language());
    }

    protected WebElement visible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    protected List<WebElement> allVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator));
    }

    protected void click(By locator) {
        WebElement element = wait.until(ExpectedConditions.elementToBeClickable(locator));
        scrollIntoView(element);
        try {
            element.click();
        } catch (ElementClickInterceptedException e) {
            // Sticky headers / toasts can overlap the target; fall back to a DOM click.
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
        }
    }

    protected void type(By locator, String text) {
        WebElement element = visible(locator);
        element.sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.DELETE);
        element.clear();
        element.sendKeys(text);
    }

    protected void selectByVisibleText(By locator, String text) {
        new Select(visible(locator)).selectByVisibleText(text);
    }

    protected void setChecked(By locator, boolean checked) {
        WebElement checkbox = wait.until(ExpectedConditions.presenceOfElementLocated(locator));
        if (checkbox.isSelected() != checked) {
            scrollIntoView(checkbox);
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", checkbox);
        }
    }

    protected String textOf(By locator) {
        return visible(locator).getText().trim();
    }

    protected boolean isDisplayed(By locator) {
        return driver.findElements(locator).stream().anyMatch(WebElement::isDisplayed);
    }

    protected boolean isDisplayedWithin(By locator, Duration timeout) {
        try {
            new WebDriverWait(driver, timeout).until(ExpectedConditions.visibilityOfElementLocated(locator));
            return true;
        } catch (TimeoutException e) {
            return false;
        }
    }

    /**
     * OpenCart reloads other page sections by jQuery AJAX after each save and its database session is not
     * locked, so the next action must wait until those requests have finished (Selenium has no network-idle).
     */
    protected void waitForAjax() {
        wait.until(d -> (Boolean) ((JavascriptExecutor) d)
                .executeScript("return !window.jQuery || window.jQuery.active === 0;"));
    }

    protected void scrollIntoView(WebElement element) {
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
    }

    /** Escapes a value for use inside an XPath string literal. */
    protected static String xpathLiteral(String value) {
        if (!value.contains("'")) {
            return "'" + value + "'";
        }
        return "concat('" + value.replace("'", "', \"'\", '") + "')";
    }

    public String heading() {
        return textOf(PAGE_HEADING);
    }

    /** True once the alert toast area or the main content shows the given text (polls until the explicit wait expires). */
    public boolean showsText(String text) {
        try {
            return wait.until(d -> d.findElements(MESSAGE_AREAS).stream()
                    .anyMatch(area -> area.getText().replaceAll("\\s+", " ").contains(text)));
        } catch (TimeoutException e) {
            return false;
        }
    }

    public String currentMessages() {
        return driver.findElements(MESSAGE_AREAS).stream()
                .map(WebElement::getText)
                .reduce("", (a, b) -> a + " | " + b);
    }
}
