package com.opencart.stepdefinitions;

import com.opencart.context.TestContext;
import com.opencart.pages.CartPage;
import com.opencart.pages.CurrentPage;
import com.opencart.pages.ProductPage;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import static org.assertj.core.api.Assertions.assertThat;

public class CartSteps {

    private final TestContext context;

    public CartSteps(TestContext context) {
        this.context = context;
    }

    @Given("I have added {string} to the shopping cart")
    public void iHaveAddedToTheShoppingCart(String product) {
        ProductPage page = context.openProductPage(product);
        page.addToCart();
        assertThat(context.page(CurrentPage.class).showsText("You have added " + product + " to your shopping cart"))
                .as("precondition: %s should be added to the cart", product).isTrue();
    }

    @When("I open the shopping cart")
    public void iOpenTheShoppingCart() {
        context.page(CartPage.class).open();
    }

    @Then("the shopping cart contains {string} with quantity {int}")
    public void theShoppingCartContains(String product, int quantity) {
        CartPage cart = context.page(CartPage.class);
        assertThat(cart.contains(product)).as("%s in cart", product).isTrue();
        assertThat(cart.quantityOf(product)).as("quantity of %s", product).isEqualTo(quantity);
    }

    @When("I change the quantity of {string} to {int} and update the cart")
    public void iChangeTheQuantity(String product, int quantity) {
        context.page(CartPage.class).updateQuantity(product, quantity);
    }

    @When("I remove {string} from the shopping cart")
    public void iRemoveFromTheShoppingCart(String product) {
        context.page(CartPage.class).remove(product);
    }
}
