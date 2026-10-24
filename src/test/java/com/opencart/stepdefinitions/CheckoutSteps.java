package com.opencart.stepdefinitions;

import com.opencart.context.TestContext;
import com.opencart.pages.CartPage;
import com.opencart.pages.CheckoutPage;
import com.opencart.utils.TestDataFactory;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import static org.assertj.core.api.Assertions.assertThat;

public class CheckoutSteps {

    private final TestContext context;

    public CheckoutSteps(TestContext context) {
        this.context = context;
    }

    @When("I proceed to checkout")
    public void iProceedToCheckout() {
        context.page(CartPage.class).open().proceedToCheckout();
    }

    @When("I open the checkout page")
    public void iOpenTheCheckoutPage() {
        context.page(CheckoutPage.class).open();
    }

    @When("I check out as a guest with valid personal details and address")
    public void iCheckOutAsAGuest() {
        context.page(CheckoutPage.class).checkoutAsGuest(TestDataFactory.newCustomer(), TestDataFactory.newAddress());
    }

    @When("I choose the shipping method {string}")
    public void iChooseTheShippingMethod(String method) {
        context.page(CheckoutPage.class).chooseShippingMethod(method);
    }

    @When("I agree to the terms and conditions")
    public void iAgreeToTheTermsAndConditions() {
        context.page(CheckoutPage.class).agreeToTerms();
    }

    @When("I choose the payment method {string}")
    public void iChooseThePaymentMethod(String method) {
        context.page(CheckoutPage.class).choosePaymentMethod(method);
    }

    @When("I confirm the order")
    public void iConfirmTheOrder() {
        context.page(CheckoutPage.class).confirmOrder();
    }

    @When("I try to confirm the order")
    public void iTryToConfirmTheOrder() {
        context.page(CheckoutPage.class).tryConfirmOrder();
    }

    @Then("the guest checkout option is not offered")
    public void theGuestCheckoutOptionIsNotOffered() {
        assertThat(context.page(CheckoutPage.class).isGuestOptionOffered()).as("guest checkout option").isFalse();
    }
}
