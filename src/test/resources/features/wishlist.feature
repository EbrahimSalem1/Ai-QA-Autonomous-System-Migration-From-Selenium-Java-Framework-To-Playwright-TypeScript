@wishlist @IB-18
Feature: Wish list
  As a registered customer
  I want to save products to my wish list
  So that I can come back and buy them later

  @auth @smoke
  Scenario: Add a product to the wish list
    Given I am logged in
    When I add "MacBook" to my wish list
    Then I see the success message "Success: You have added MacBook to your wish list!"
    And my wish list contains "MacBook"

  @auth
  Scenario: Remove a product from the wish list
    Given I am logged in
    And "HTC Touch HD" is in my wish list
    When I remove "HTC Touch HD" from my wish list
    Then my wish list does not contain "HTC Touch HD"

  Scenario: A guest is asked to log in before saving to the wish list
    Given I am not logged in
    When I add "iPhone" to my wish list
    Then I see the message "You must login or create an account to save iPhone to your wish list!"
