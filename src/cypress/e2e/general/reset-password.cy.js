import account from "../../fixtures/account.json";
import route from "../../fixtures/route.json";

describe("Reset Password", () => {
  beforeEach(() => {
    cy.visit("/sign-in");

    cy.get('a[href="/forgot-password"]').click();
    cy.intercept("POST", `${Cypress.env("apiUrl")}/users/password/forgot`).as(
      "forgotPassword"
    );
  });

  it("When the user clicks on reset password, new window opens up for password reset", () => {
    cy.url().should("include", route.forgotPassword);
  });

  it("If the user’s new password is less than 8 characters long and the user tries to submit, an alert shows up prompting them to pick more than 8 characters", () => {
    cy.url().should("include", route.forgotPassword);

    cy.get('input[type="email"]').type(account.emailForgotPassword);

    cy.get('button[type="button"]')
      .contains("Request Reset")
      .should("exist")
      .click({ force: true });

    cy.intercept("POST", `${Cypress.env("apiUrl")}/users/password/forgot`).as(
      "forgotPassword"
    );

    cy.wait("@forgotPassword");

    cy.url().should("include", route.resetPassword);

    cy.get('input[type="password"]').type("123");
    cy.contains("Is not in correct format").should("be.visible");
    cy.contains("At least seven characters").should("be.visible");
  });

  it("If any of the password requirements are not matched, the user is notified (upper case, lower case, special char, and number are required)", () => {
    cy.url().should("include", route.forgotPassword);

    cy.get('input[type="email"]').type(account.emailForgotPassword);

    cy.get('button[type="button"]')
      .contains("Request Reset")
      .should("exist")
      .click({ force: true });

    cy.wait("@forgotPassword");

    cy.url().should("include", route.resetPassword);

    cy.get('input[type="password"]').as("password");

    cy.contains("div", "At least seven characters")
      .as("sevenChars")
      .should("have.css", "color", "rgb(239, 68, 68)");
    cy.contains("div", "At least one digit")
      .as("oneDigit")
      .should("have.css", "color", "rgb(239, 68, 68)");

    cy.contains("div", "At least one lowercase character")
      .as("lowerCase")
      .should("have.css", "color", "rgb(239, 68, 68)");
    cy.contains("div", "At least one uppercase character")
      .as("upperCase")
      .should("have.css", "color", "rgb(239, 68, 68)");
    cy.contains("div", "At least one special character")
      .as("specialChars")
      .should("have.css", "color", "rgb(239, 68, 68)");

    cy.get("@password").type("1");
    cy.get("@oneDigit").should("have.css", "color", "rgb(34, 197, 94)");

    cy.get("@password").clear().type("123456a");
    cy.get("@sevenChars").should("have.css", "color", "rgb(34, 197, 94)");
    cy.get("@lowerCase").should("have.css", "color", "rgb(34, 197, 94)");

    cy.get("@password").clear().type("123456aA");
    cy.get("@upperCase").should("have.css", "color", "rgb(34, 197, 94)");

    cy.get("@password").clear().type("123456aA@");
    cy.get("@specialChars").should("have.css", "color", "rgb(34, 197, 94)");

    cy.contains("div", "Is not in correct format").should("not.exist");
  });
});
