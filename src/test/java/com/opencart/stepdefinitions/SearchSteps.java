package com.opencart.stepdefinitions;

import com.opencart.context.TestContext;
import com.opencart.pages.SearchResultsPage;
import com.opencart.pages.components.HeaderComponent;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import java.util.List;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;

public class SearchSteps {

    private final TestContext context;

    public SearchSteps(TestContext context) {
        this.context = context;
    }

    @When("I search for {string}")
    public void iSearchFor(String keyword) {
        context.page(HeaderComponent.class).searchFor(keyword);
    }

    @Then("the search results contain the product {string}")
    public void theSearchResultsContainTheProduct(String product) {
        assertThat(context.page(SearchResultsPage.class).productNames()).contains(product);
    }

    @Then("more than one product is found")
    public void moreThanOneProductIsFound() {
        assertThat(context.page(SearchResultsPage.class).productNames()).hasSizeGreaterThan(1);
    }

    @Then("every product name in the results contains {string}")
    public void everyProductNameContains(String keyword) {
        List<String> names = context.page(SearchResultsPage.class).productNames();
        assertThat(names).isNotEmpty()
                .allSatisfy(name -> assertThat(name.toLowerCase(Locale.ROOT)).contains(keyword.toLowerCase(Locale.ROOT)));
    }
}
