package com.opencart.stepdefinitions;

import com.opencart.context.TestContext;
import com.opencart.pages.CurrentPage;
import com.opencart.pages.RegisterPage;
import com.opencart.utils.TestDataFactory;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.assertj.core.api.SoftAssertions;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class RegistrationSteps {

    private final TestContext context;

    public RegistrationSteps(TestContext context) {
        this.context = context;
    }

    @Given("I am on the Register Account page")
    public void iAmOnTheRegisterAccountPage() {
        context.page(RegisterPage.class).open();
    }

    @Given("a customer account already exists")
    public void aCustomerAccountAlreadyExists() {
        TestDataFactory.Customer customer = TestDataFactory.newCustomer();
        context.page(RegisterPage.class).open().register(customer);
        assertThat(context.page(CurrentPage.class).showsText("Your Account Has Been Created!"))
                .as("precondition: account for %s should be created", customer.email()).isTrue();
        context.driver().manage().deleteAllCookies(); // log out by dropping the session
        context.setCustomer(customer);
    }

    @When("I register with valid details and accept the privacy policy")
    public void iRegisterWithValidDetails() {
        TestDataFactory.Customer customer = TestDataFactory.newCustomer();
        context.setCustomer(customer);
        context.page(RegisterPage.class).register(customer);
    }

    @When("I register again with the same e-mail")
    public void iRegisterAgainWithTheSameEmail() {
        TestDataFactory.Customer existing = context.customer();
        TestDataFactory.Customer duplicate = new TestDataFactory.Customer(
                "Duplicate", "Customer", existing.email(), existing.telephone(), existing.password());
        context.page(RegisterPage.class).register(duplicate);
    }

    @When("I register with valid details without accepting the privacy policy")
    public void iRegisterWithoutAcceptingThePrivacyPolicy() {
        context.page(RegisterPage.class)
                .fillDetails(TestDataFactory.newCustomer())
                .setPrivacyPolicyAccepted(false)
                .submit();
    }

    @When("I submit the registration form empty")
    public void iSubmitTheRegistrationFormEmpty() {
        context.page(RegisterPage.class).setPrivacyPolicyAccepted(true).submit();
    }

    @Then("I see the following registration field errors:")
    public void iSeeTheFollowingFieldErrors(DataTable table) {
        RegisterPage page = context.page(RegisterPage.class);
        SoftAssertions softly = new SoftAssertions();
        for (Map<String, String> row : table.asMaps()) {
            softly.assertThat(page.fieldError(row.get("field")))
                    .as("error for %s", row.get("field"))
                    .contains(row.get("message"));
        }
        softly.assertAll();
    }
}
