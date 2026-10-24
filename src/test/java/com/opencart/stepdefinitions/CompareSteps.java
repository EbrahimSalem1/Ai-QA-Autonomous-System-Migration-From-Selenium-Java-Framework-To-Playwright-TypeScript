package com.opencart.stepdefinitions;

import com.opencart.context.TestContext;
import com.opencart.pages.ComparePage;
import com.opencart.pages.CurrentPage;
import com.opencart.pages.ProductPage;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class CompareSteps {

    private final TestContext context;

    public CompareSteps(TestContext context) {
        this.context = context;
    }

    @When("I add the product to the comparison")
    public void iAddTheProductToTheComparison() {
        context.page(ProductPage.class).addToComparison();
    }

    @Given("I have added the following products to the comparison:")
    public void iHaveAddedProductsToTheComparison(List<String> products) {
        for (String product : products) {
            context.openProductPage(product).addToComparison();
            assertThat(context.page(CurrentPage.class).showsText("You have added " + product + " to your product comparison"))
                    .as("precondition: %s added to comparison", product).isTrue();
        }
    }

    @When("I open the product comparison page")
    public void iOpenTheProductComparisonPage() {
        context.page(ComparePage.class).open();
    }

    @Then("the product comparison contains:")
    public void theProductComparisonContains(List<String> products) {
        assertThat(context.page(ComparePage.class).productNames()).containsAll(products);
    }

    @Then("the product comparison does not contain {string}")
    public void theProductComparisonDoesNotContain(String product) {
        assertThat(context.page(ComparePage.class).productNames()).doesNotContain(product);
    }

    @When("I remove {string} from the comparison")
    public void iRemoveFromTheComparison(String product) {
        context.page(ComparePage.class).remove(product);
    }
}
