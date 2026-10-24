@cart @IB-17
Feature: Shopping cart
  As a shopper
  I want to review and adjust the products in my shopping cart
  So that I buy exactly what I need

  @smoke
  Scenario: An added product appears in the cart
    Given I have added "iPhone" to the shopping cart
    When I open the shopping cart
    Then the shopping cart contains "iPhone" with quantity 1

  Scenario: Update the quantity of a product in the cart
    Given I have added "iPhone" to the shopping cart
    And I open the shopping cart
    When I change the quantity of "iPhone" to 3 and update the cart
    Then I see the success message "Success: You have modified your shopping cart!"
    And the shopping cart contains "iPhone" with quantity 3

  Scenario: Remove a product from the cart
    Given I have added "iPhone" to the shopping cart
    And I open the shopping cart
    When I remove "iPhone" from the shopping cart
    Then I see the message "Your shopping cart is empty!"

  Scenario: An empty cart shows an empty message
    When I open the shopping cart
    Then I see the message "Your shopping cart is empty!"
