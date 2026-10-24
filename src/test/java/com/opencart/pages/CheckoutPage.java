package com.opencart.pages;

import com.opencart.utils.TestDataFactory.Address;
import com.opencart.utils.TestDataFactory.Customer;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;


/**
 * OpenCart 4 one-page checkout. Sections are rendered by AJAX, so every step waits for the
 * section it depends on instead of sleeping.
 */
public class CheckoutPage extends BasePage {

    private static final By GUEST_OPTION = By.id("input-guest");
    private static final By FIRST_NAME = By.id("input-firstname");
    private static final By LAST_NAME = By.id("input-lastname");
    private static final By EMAIL = By.id("input-email");
    private static final By TELEPHONE = By.id("input-telephone");
    private static final By REGISTER_CONTINUE = By.id("button-register");
    private static final By GUEST_DETAILS_SAVED = By.xpath("//div[@id='alert']//div[contains(@class,'alert-success')][contains(., 'guest account information has been saved')]");

    private static final By SHIPPING_METHODS_BUTTON = By.id("button-shipping-methods");
    private static final String SHIPPING_MODAL = "modal-shipping";
    private static final By SHIPPING_CONTINUE = By.id("button-shipping-method");
    private static final By SELECTED_SHIPPING = By.id("input-shipping-method");

    private static final By PAYMENT_METHODS_BUTTON = By.id("button-payment-methods");
    private static final String PAYMENT_MODAL = "modal-payment";
    private static final By PAYMENT_CONTINUE = By.id("button-payment-method");
    private static final By SELECTED_PAYMENT = By.id("input-payment-method");

    private static final By AGREE_TERMS = By.id("input-checkout-agree");
    /** Rendered disabled (without an id) until shipping, payment and terms are complete, then as #button-confirm. */
    private static final By CONFIRM_ORDER = By.xpath("//div[@id='checkout-confirm']//button[normalize-space()='Confirm Order']");

    public CheckoutPage(WebDriver driver) {
        super(driver);
    }

    public CheckoutPage open() {
        openRoute("checkout/checkout");
        return this;
    }

    public boolean isGuestOptionOffered() {
        visible(PAGE_HEADING);
        return isDisplayed(GUEST_OPTION);
    }

    public void checkoutAsGuest(Customer customer, Address address) {
        click(GUEST_OPTION);
        type(FIRST_NAME, customer.firstName());
        type(LAST_NAME, customer.lastName());
        type(EMAIL, customer.email());
        if (isDisplayed(TELEPHONE)) {
            type(TELEPHONE, customer.telephone());
        }
        // Payment address is optional (store setting); shipping address is shown when the cart needs shipping.
        fillAddressIfShown("payment", customer, address);
        fillAddressIfShown("shipping", customer, address);
        click(REGISTER_CONTINUE);
        visible(GUEST_DETAILS_SAVED);
        waitForAjax();
    }

    private void fillAddressIfShown(String type, Customer customer, Address address) {
        By address1 = By.id("input-" + type + "-address-1");
        if (!isDisplayed(address1)) {
            return;
        }
        By firstName = By.id("input-" + type + "-firstname");
        if (isDisplayed(firstName)) {
            type(firstName, customer.firstName());
            type(By.id("input-" + type + "-lastname"), customer.lastName());
        }
        type(address1, address.address1());
        type(By.id("input-" + type + "-city"), address.city());
        type(By.id("input-" + type + "-postcode"), address.postcode());
        selectByVisibleText(By.id("input-" + type + "-country"), "United Kingdom");
        By zone = By.id("input-" + type + "-zone");
        // Zones are loaded by AJAX after the country changes.
        wait.until(d -> new Select(d.findElement(zone)).getOptions().size() > 1);
        new Select(visible(zone)).selectByIndex(1);
    }

    public void chooseShippingMethod(String name) {
        click(SHIPPING_METHODS_BUTTON);
        chooseOptionInModal(SHIPPING_MODAL, name, SHIPPING_CONTINUE);
        wait.until(d -> !d.findElement(SELECTED_SHIPPING).getDomProperty("value").isBlank());
    }

    public void choosePaymentMethod(String name) {
        click(PAYMENT_METHODS_BUTTON);
        chooseOptionInModal(PAYMENT_MODAL, name, PAYMENT_CONTINUE);
        wait.until(d -> !d.findElement(SELECTED_PAYMENT).getDomProperty("value").isBlank());
    }

    private void chooseOptionInModal(String modalId, String optionLabel, By continueButton) {
        By modal = By.id(modalId);
        visible(modal);
        // Markup: <input type="radio" id="..."/> <label for="...">Flat Shipping Rate - $5.00</label>
        By option = By.xpath("//div[@id='" + modalId + "']//label[contains(normalize-space(), " + xpathLiteral(optionLabel)
                + ")]/preceding-sibling::input[@type='radio']");
        visible(option);
        setChecked(option, true);
        click(continueButton);
        wait.until(ExpectedConditions.invisibilityOfElementLocated(modal));
        waitForAjax();
    }

    /** Shown only when the store assigns a Terms page to checkout (demo.opencart.com and the CI store do). */
    public void agreeToTerms() {
        setChecked(AGREE_TERMS, true);
        waitForAjax();
    }

    public void confirmOrder() {
        click(CONFIRM_ORDER);
    }

    public boolean isConfirmEnabled() {
        waitForAjax();
        return visible(CONFIRM_ORDER).isEnabled();
    }
}
