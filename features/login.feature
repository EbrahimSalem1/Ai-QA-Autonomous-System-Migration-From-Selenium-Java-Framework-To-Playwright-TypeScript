@login @IB-14
Feature: Customer login and logout
  As a registered customer
  I want to log in and out of my account
  So that I can access my account features securely

  @smoke
  Scenario: Login with valid credentials
    Given I am a registered customer
    And I am on the Account Login page
    When I log in with my e-mail and password
    Then the page heading is "My Account"

  Scenario: Login is rejected for a wrong password
    Given I am a registered customer
    And I am on the Account Login page
    When I log in with my e-mail and the password "WrongPass#123"
    Then I see the warning "Warning: No match for E-Mail Address and/or Password."

  Scenario: Login is rejected for an unregistered e-mail
    Given I am on the Account Login page
    When I log in with an unregistered e-mail
    Then I see the warning "Warning: No match for E-Mail Address and/or Password."

  Scenario: Logout from the account
    Given I am a registered customer
    And I am on the Account Login page
    And I log in with my e-mail and password
    When I log out
    Then the page heading is "Account Logout"
