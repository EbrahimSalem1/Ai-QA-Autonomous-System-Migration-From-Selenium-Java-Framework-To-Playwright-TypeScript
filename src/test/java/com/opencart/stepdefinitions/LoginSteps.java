package com.opencart.stepdefinitions;

import com.opencart.context.TestContext;
import com.opencart.pages.CurrentPage;
import com.opencart.pages.LoginPage;
import com.opencart.pages.RegisterPage;
import com.opencart.pages.components.HeaderComponent;
import com.opencart.utils.TestDataFactory;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;

import static org.assertj.core.api.Assertions.assertThat;

public class LoginSteps {

    private final TestContext context;

    public LoginSteps(TestContext context) {
        this.context = context;
    }

    /** Creates a fresh account (never the shared @auth one, so logging out is safe) and ends its session. */
    @Given("I am a registered customer")
    public void iAmARegisteredCustomer() {
        TestDataFactory.Customer customer = TestDataFactory.newCustomer();
        context.page(RegisterPage.class).open().register(customer);
        assertThat(context.page(CurrentPage.class).showsText("Your Account Has Been Created!"))
                .as("precondition: account for %s should be created", customer.email()).isTrue();
        context.driver().manage().deleteAllCookies();
        context.setCustomer(customer);
    }

    @Given("I am on the Account Login page")
    public void iAmOnTheAccountLoginPage() {
        context.page(LoginPage.class).open();
    }

    @When("I log in with my e-mail and password")
    public void iLogInWithMyEmailAndPassword() {
        TestDataFactory.Customer customer = context.customer();
        context.page(LoginPage.class).login(customer.email(), customer.password());
    }

    @When("I log in with my e-mail and the password {string}")
    public void iLogInWithMyEmailAndThePassword(String password) {
        context.page(LoginPage.class).login(context.customer().email(), password);
    }

    @When("I log in with an unregistered e-mail")
    public void iLogInWithAnUnregisteredEmail() {
        context.page(LoginPage.class).login(TestDataFactory.unregisteredEmail(), TestDataFactory.DEFAULT_PASSWORD);
    }

    @When("I log out")
    public void iLogOut() {
        assertThat(context.page(CurrentPage.class).showsText("My Account")).as("should be logged in before logging out").isTrue();
        context.page(HeaderComponent.class).logout();
    }
}
