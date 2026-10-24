package com.opencart.hooks;

import com.opencart.config.ConfigReader;
import com.opencart.context.TestContext;
import com.opencart.driver.DriverFactory;
import com.opencart.pages.AccountPage;
import com.opencart.pages.CurrentPage;
import com.opencart.pages.LoginPage;
import com.opencart.pages.RegisterPage;
import com.opencart.utils.AuthSessionStore;
import com.opencart.utils.TestDataFactory;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Set;

public class Hooks {

    private static final Logger LOG = LoggerFactory.getLogger(Hooks.class);
    private final TestContext context;

    public Hooks(TestContext context) {
        this.context = context;
    }

    @Before(order = 0)
    public void startBrowser(Scenario scenario) {
        LOG.info("Starting scenario: {} {}", scenario.getName(), scenario.getSourceTagNames());
        DriverFactory.startDriver();
    }

    /**
     * @auth scenarios reuse one authenticated session per run (the Selenium counterpart of
     * Playwright's storageState). The account is created or logged in once, then its cookies are injected.
     */
    @Before(value = "@auth", order = 10)
    public void authenticate() {
        WebDriver driver = context.driver();
        if (AuthSessionStore.cookies().isEmpty()) {
            synchronized (AuthSessionStore.class) {
                if (AuthSessionStore.cookies().isEmpty()) {
                    createAuthenticatedSession(driver);
                }
            }
        }
        driver.get(ConfigReader.baseUrl() + "/index.php?route=common/home&language=" + ConfigReader.language());
        driver.manage().deleteAllCookies();
        for (Cookie cookie : AuthSessionStore.cookies().orElseThrow()) {
            driver.manage().addCookie(cookie);
        }
        driver.navigate().refresh();
        context.setCustomer(AuthSessionStore.customer());
    }

    private void createAuthenticatedSession(WebDriver driver) {
        TestDataFactory.Customer customer = AuthSessionStore.configuredCustomer().orElse(null);
        if (customer != null) {
            context.page(LoginPage.class).open().login(customer.email(), customer.password());
            if (!context.page(AccountPage.class).isLoaded()) {
                throw new IllegalStateException("Login with the configured customer failed: " + context.page(CurrentPage.class).currentMessages());
            }
        } else {
            customer = TestDataFactory.newCustomer();
            context.page(RegisterPage.class).open().register(customer);
            if (!context.page(CurrentPage.class).showsText("Your Account Has Been Created!")) {
                throw new IllegalStateException("Registering the shared @auth customer failed: " + context.page(CurrentPage.class).currentMessages());
            }
        }
        Set<Cookie> cookies = driver.manage().getCookies();
        AuthSessionStore.save(customer, cookies);
        LOG.info("Saved authenticated session for {}", customer.email());
    }

    @After(order = 10)
    public void attachEvidence(Scenario scenario) {
        if (scenario.isFailed()) {
            try {
                WebDriver driver = context.driver();
                scenario.attach(((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES), "image/png", "failure-screenshot");
                scenario.attach(driver.getCurrentUrl(), "text/plain", "failure-url");
            } catch (RuntimeException e) {
                LOG.warn("Could not capture failure evidence", e);
            }
        }
    }

    @After(order = 0)
    public void closeBrowser() {
        DriverFactory.quitDriver();
    }
}
