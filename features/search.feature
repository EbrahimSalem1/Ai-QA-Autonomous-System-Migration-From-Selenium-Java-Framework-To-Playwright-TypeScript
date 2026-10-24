@search @IB-15
Feature: Product search
  As a shopper
  I want to search the catalogue by keyword
  So that I can quickly find the products I am interested in

  Background:
    Given I am on the home page

  @smoke
  Scenario: Search for an existing product
    When I search for "iPhone"
    Then the search results contain the product "iPhone"

  Scenario: A partial keyword returns every matching product
    When I search for "mac"
    Then more than one product is found
    And every product name in the results contains "mac"

  Scenario: Search for a product that does not exist
    When I search for "NoSuchProduct12345"
    Then I see the message "There is no product that matches the search criteria."
