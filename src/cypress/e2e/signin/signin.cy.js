import account from "../../fixtures/account.json";

describe("Login page", () => {
  beforeEach(() => {
    cy.visit("./sign-in");
    cy.get('input[type="email"]').as("email");
    cy.get('input[type="password"]').as("password");
    cy.get('button[type="button"]').as("loginBtn");
    cy.intercept(`${Cypress.env("apiUrl")}/users/authenticate`).as("login");
  });

  it("When the user enters an invalid email address that doesn’t follow the conventional format (username@email.com), they are met with ‘Invalid Email Address’ error", () => {
    cy.get("@email").type(account.failEmailFormat);
    cy.contains("Must be a valid email address");
  });

  it("When the user enters the wrong email address or wrong password, login fails when they try to access the app with Incorrect username/password error message", () => {
    cy.get("@email").type(account.wrongEmail);
    cy.get("@password").type(account.wrongPassword);
    cy.get("@loginBtn").click();
    cy.wait("@login");

    cy.contains("Incorrect email/password");
  });

  it("When user doesnt  have account login fail", () => {
    cy.get("@email").type(account.wrongEmail);
    cy.get("@password").type(account.wrongEmail);
    cy.get("@email").focus().clear();
    cy.get("@password").focus().clear();
    cy.get("@loginBtn").should("be.disabled");
    cy.contains("Can't be blank");
  });

  it("When a user enters in a correct email address, password, and has an account, the login is successful and they are granted access to the app", () => {
    cy.login();
  });
});
