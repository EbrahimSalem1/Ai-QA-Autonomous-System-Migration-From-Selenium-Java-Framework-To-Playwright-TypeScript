@compare @IB-19
Feature: Product compare
  As a shopper
  I want to compare products side by side
  So that I can choose the one that suits me best

  @smoke
  Scenario: Add a product to the comparison
    Given I am on the product page of "iPhone"
    When I add the product to the comparison
    Then I see the success message "Success: You have added iPhone to your product comparison!"

  Scenario: Compare two products side by side
    Given I have added the following products to the comparison:
      | iPhone  |
      | MacBook |
    When I open the product comparison page
    Then the product comparison contains:
      | iPhone  |
      | MacBook |

  Scenario: Remove a product from the comparison
    Given I have added the following products to the comparison:
      | iPhone  |
      | MacBook |
    And I open the product comparison page
    When I remove "iPhone" from the comparison
    Then I see the success message "Success: You have modified your product comparison!"
    And the product comparison contains:
      | MacBook |
    And the product comparison does not contain "iPhone"

  Scenario: An empty comparison shows an empty message
    When I open the product comparison page
    Then I see the message "You have not chosen any products to compare."
