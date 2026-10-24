@checkout @IB-20
Feature: Checkout
  As a shopper
  I want to check out the products in my cart
  So that I can place an order

  @smoke @e2e
  Scenario: Guest checkout places an order
    Given I have added "iPhone" to the shopping cart
    When I proceed to checkout
    And I check out as a guest with valid personal details and address
    And I choose the shipping method "Flat Shipping Rate"
    And I agree to the terms and conditions
    And I choose the payment method "Cash On Delivery"
    And I confirm the order
    Then the page heading is "Your order has been placed!"

  @auth
  Scenario: A logged-in customer reaches checkout without the account step
    Given I am logged in
    And I have added "MacBook" to the shopping cart
    When I proceed to checkout
    Then the page heading is "Checkout"
    And the guest checkout option is not offered

  Scenario: Checkout with an empty cart returns to the shopping cart
    When I open the checkout page
    Then the page heading is "Shopping Cart"
    And I see the message "Your shopping cart is empty!"

  Scenario: Terms and conditions must be accepted
    Given I have added "iPhone" to the shopping cart
    When I proceed to checkout
    And I check out as a guest with valid personal details and address
    And I choose the shipping method "Flat Shipping Rate"
    And I choose the payment method "Cash On Delivery"
    And I try to confirm the order
    Then I see the warning "Warning: You must agree to the Terms & Conditions!"
