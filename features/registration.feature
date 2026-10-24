@registration @IB-13
Feature: Customer registration
  As a new visitor of the OpenCart store
  I want to create a customer account
  So that I can log in, save a wish list and check out faster

  @smoke
  Scenario: Register a new account with valid details
    Given I am on the Register Account page
    When I register with valid details and accept the privacy policy
    Then the page heading is "Your Account Has Been Created!"

  Scenario: Registration is rejected for an e-mail that is already registered
    Given a customer account already exists
    And I am on the Register Account page
    When I register again with the same e-mail
    Then I see the warning "Warning: E-Mail Address is already registered!"

  Scenario: Registration requires accepting the privacy policy
    Given I am on the Register Account page
    When I register with valid details without accepting the privacy policy
    Then I see the warning "Warning: You must agree to the Privacy Policy!"

  Scenario: Mandatory registration fields are validated
    Given I am on the Register Account page
    When I submit the registration form empty
    Then I see the following registration field errors:
      | field      | message                                         |
      | First Name | First Name must be between 1 and 32 characters! |
      | Last Name  | Last Name must be between 1 and 32 characters!  |
      | E-Mail     | E-Mail Address does not appear to be valid!     |
      | Password   | Password must                                   |
