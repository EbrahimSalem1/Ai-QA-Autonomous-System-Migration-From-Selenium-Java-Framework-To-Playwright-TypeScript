@product @IB-16
Feature: Product details page
  As a shopper
  I want to open a product and see its details
  So that I can decide whether to buy it, save it or compare it

  @smoke
  Scenario: Product information is shown
    Given I am on the home page
    When I search for "MacBook"
    And I open the product "MacBook"
    Then the product heading is "MacBook"
    And the product price is displayed
    And the quantity field and the Add to Cart button are displayed
    And the product tabs "Description" and "Reviews" are available

  Scenario: Add a product to the cart with a chosen quantity
    Given I am on the product page of "iPhone"
    When I set the quantity to 2 and add the product to the cart
    Then I see the success message "Success: You have added iPhone to your shopping cart!"

  Scenario: Wish list and compare actions are available
    Given I am on the product page of "iPhone"
    Then the "Add to Wish List" and "Compare this Product" buttons are displayed
