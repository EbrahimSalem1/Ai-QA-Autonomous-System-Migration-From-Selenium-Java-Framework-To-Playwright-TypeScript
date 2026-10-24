package com.opencart.stepdefinitions;

import com.opencart.context.TestContext;
import com.opencart.pages.AccountPage;
import com.opencart.pages.HomePage;
import com.opencart.pages.WishlistPage;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import static org.assertj.core.api.Assertions.assertThat;

public class WishlistSteps {

    private final TestContext context;

    public WishlistSteps(TestContext context) {
        this.context = context;
    }

    /** The session itself is injected by the @auth hook; this step verifies it is valid. */
    @Given("I am logged in")
    public void iAmLoggedIn() {
        assertThat(context.page(AccountPage.class).open().isLoaded())
                .as("the @auth session should open My Account (is the scenario tagged @auth?)").isTrue();
    }

    @Given("I am not logged in")
    public void iAmNotLoggedIn() {
        context.driver().manage().deleteAllCookies();
        context.page(HomePage.class).open();
    }

    @When("I add {string} to my wish list")
    public void iAddToMyWishList(String product) {
        context.openProductPage(product).addToWishList();
    }

    @Given("{string} is in my wish list")
    public void isInMyWishList(String product) {
        iAddToMyWishList(product);
        assertThat(context.page(WishlistPage.class).open().contains(product))
                .as("precondition: %s in wish list", product).isTrue();
    }

    @Then("my wish list contains {string}")
    public void myWishListContains(String product) {
        assertThat(context.page(WishlistPage.class).open().contains(product)).as("%s in wish list", product).isTrue();
    }

    @When("I remove {string} from my wish list")
    public void iRemoveFromMyWishList(String product) {
        context.page(WishlistPage.class).open().remove(product);
    }

    @Then("my wish list does not contain {string}")
    public void myWishListDoesNotContain(String product) {
        assertThat(context.page(WishlistPage.class).open().contains(product)).as("%s in wish list", product).isFalse();
    }
}
