package com.opencart.stepdefinitions;

import com.opencart.context.TestContext;
import com.opencart.pages.ProductPage;
import com.opencart.pages.SearchResultsPage;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.assertj.core.api.SoftAssertions;

import static org.assertj.core.api.Assertions.assertThat;

public class ProductSteps {

    private final TestContext context;

    public ProductSteps(TestContext context) {
        this.context = context;
    }

    @Given("I am on the product page of {string}")
    public void iAmOnTheProductPageOf(String product) {
        context.openProductPage(product);
    }

    @When("I open the product {string}")
    public void iOpenTheProduct(String product) {
        context.page(SearchResultsPage.class).openProduct(product);
        context.page(ProductPage.class).waitUntilLoaded();
    }

    @Then("the product heading is {string}")
    public void theProductHeadingIs(String expected) {
        assertThat(context.page(ProductPage.class).heading()).isEqualTo(expected);
    }

    @Then("the product price is displayed")
    public void theProductPriceIsDisplayed() {
        assertThat(context.page(ProductPage.class).isPriceDisplayed()).as("price displayed").isTrue();
    }

    @Then("the quantity field and the Add to Cart button are displayed")
    public void theQuantityAndAddToCartAreDisplayed() {
        ProductPage page = context.page(ProductPage.class);
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(page.isQuantityFieldDisplayed()).as("quantity field").isTrue();
        softly.assertThat(page.isAddToCartDisplayed()).as("Add to Cart button").isTrue();
        softly.assertAll();
    }

    @Then("the product tabs {string} and {string} are available")
    public void theProductTabsAreAvailable(String first, String second) {
        ProductPage page = context.page(ProductPage.class);
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(page.tabLabel(first)).startsWith(first);
        softly.assertThat(page.tabLabel(second)).startsWith(second);
        softly.assertAll();
    }

    @When("I set the quantity to {int} and add the product to the cart")
    public void iSetTheQuantityAndAddToCart(int quantity) {
        ProductPage page = context.page(ProductPage.class);
        page.setQuantity(quantity);
        page.addToCart();
    }

    @Then("the {string} and {string} buttons are displayed")
    public void theButtonsAreDisplayed(String first, String second) {
        ProductPage page = context.page(ProductPage.class);
        SoftAssertions softly = new SoftAssertions();
        softly.assertThat(page.isActionDisplayed(first)).as(first).isTrue();
        softly.assertThat(page.isActionDisplayed(second)).as(second).isTrue();
        softly.assertAll();
    }
}
