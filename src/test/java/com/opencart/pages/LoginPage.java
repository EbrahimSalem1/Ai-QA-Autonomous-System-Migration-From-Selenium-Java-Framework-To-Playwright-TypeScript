package com.opencart.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {

    private static final By EMAIL = By.id("input-email");
    private static final By PASSWORD = By.id("input-password");
    private static final By LOGIN = By.cssSelector("#form-login button[type='submit']");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public LoginPage open() {
        openRoute("account/login");
        visible(EMAIL);
        return this;
    }

    public void login(String email, String password) {
        type(EMAIL, email);
        type(PASSWORD, password);
        click(LOGIN);
    }
}
