package com.opencart.stepdefinitions;

import com.opencart.context.TestContext;
import com.opencart.pages.CurrentPage;
import com.opencart.pages.HomePage;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;

import static org.assertj.core.api.Assertions.assertThat;

public class CommonSteps {

    private final TestContext context;

    public CommonSteps(TestContext context) {
        this.context = context;
    }

    @Given("I am on the home page")
    public void iAmOnTheHomePage() {
        context.page(HomePage.class).open();
    }

    @Then("the page heading is {string}")
    public void thePageHeadingIs(String expected) {
        CurrentPage page = context.page(CurrentPage.class);
        assertThat(page.showsText(expected)).as("page should show heading '%s'", expected).isTrue();
        assertThat(page.heading()).as("page heading").contains(expected);
    }

    @Then("I see the warning {string}")
    @Then("I see the success message {string}")
    @Then("I see the message {string}")
    public void iSeeTheMessage(String message) {
        CurrentPage page = context.page(CurrentPage.class);
        assertThat(page.showsText(message))
                .as("expected message '%s' but the page shows: %s", message, page.currentMessages())
                .isTrue();
    }
}
