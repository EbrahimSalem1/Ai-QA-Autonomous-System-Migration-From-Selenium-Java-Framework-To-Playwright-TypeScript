package com.opencart.pages;

import com.opencart.utils.TestDataFactory.Customer;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

import java.util.Map;

public class RegisterPage extends BasePage {

    private static final By FIRST_NAME = By.id("input-firstname");
    private static final By LAST_NAME = By.id("input-lastname");
    private static final By EMAIL = By.id("input-email");
    private static final By TELEPHONE = By.id("input-telephone");
    private static final By PASSWORD = By.id("input-password");
    private static final By AGREE = By.cssSelector("#form-register input[name='agree']");
    private static final By CONTINUE = By.cssSelector("#form-register button[type='submit']");

    private static final Map<String, By> FIELD_ERRORS = Map.of(
            "First Name", By.id("error-firstname"),
            "Last Name", By.id("error-lastname"),
            "E-Mail", By.id("error-email"),
            "Telephone", By.id("error-telephone"),
            "Password", By.id("error-password"));

    public RegisterPage(WebDriver driver) {
        super(driver);
    }

    public RegisterPage open() {
        openRoute("account/register");
        visible(FIRST_NAME);
        return this;
    }

    public RegisterPage fillDetails(Customer customer) {
        type(FIRST_NAME, customer.firstName());
        type(LAST_NAME, customer.lastName());
        type(EMAIL, customer.email());
        if (isDisplayed(TELEPHONE)) { // telephone is a store setting in OpenCart 4
            type(TELEPHONE, customer.telephone());
        }
        type(PASSWORD, customer.password());
        return this;
    }

    public RegisterPage setPrivacyPolicyAccepted(boolean accepted) {
        setChecked(AGREE, accepted);
        return this;
    }

    public void submit() {
        click(CONTINUE);
    }

    public void register(Customer customer) {
        fillDetails(customer).setPrivacyPolicyAccepted(true).submit();
    }

    public String fieldError(String field) {
        By locator = FIELD_ERRORS.get(field);
        if (locator == null) {
            throw new IllegalArgumentException("Unknown registration field: " + field);
        }
        return textOf(locator);
    }
}
