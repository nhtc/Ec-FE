import { nextToStep3 } from "../helper";

describe("When the user goes to step 3, they are given the option to upload a test data set or to skip", () => {
  beforeEach(() => {
    nextToStep3();

    cy.contains("div", "Where would you like to start?")
      .should("have.css", "font-size", "24px")
      .as("step3Title");

    cy.intercept(`${Cypress.env("apiUrl")}/wizard/tasks`).as(
      "createTaskIntercept"
    );
  });

  it("Clicking skip kicks off the prediction and opens the prediction status page", () => {
    cy.contains("div", "Skip")
      .should("have.css", "font-size", "24px")
      .parent()
      .next()
      .find("button")
      .should("exist")
      .click({ force: true });

    cy.wait("@createTaskIntercept").then(({ response }) => {
      if (response.statusCode === 200) {
        cy.url().should("include", "/predictions/task/");
      }
    });
  });

  it("Clicking upload data opens the option to choose their data", () => {
    cy.contains("div", "Test new data")
      .should("have.css", "font-size", "24px")
      .parent()
      .next()
      .find("button")
      .should("exist")
      .click({ force: true });
    cy.url().should("include", "/predictions-new/step-3/ask-existing");
  });
});

describe("When clicking create, the user is met with the prediction status page that dynamically shows the status of the prediction", () => {
  before(() => {
    nextToStep3();

    cy.contains("div", "Where would you like to start?")
      .should("have.css", "font-size", "24px")
      .as("step3Title");

    cy.intercept(`${Cypress.env("apiUrl")}/wizard/tasks`).as(
      "createTaskIntercept"
    );
  });

  it("When clicking create, the user is met with the prediction status page that dynamically shows the status of the prediction", () => {
    cy.contains("div", "Skip")
      .should("have.css", "font-size", "24px")
      .parent()
      .next()
      .find("button")
      .should("exist")
      .click({ force: true });

    cy.wait("@createTaskIntercept").then(({ response }) => {
      if (response.statusCode === 200) {
        cy.url().should("include", "/predictions/task/");

        cy.contains("div", "We are creating your prediction...").should(
          "exist"
        );
        cy.contains("div", "Task Created")
          .should("exist")
          .and("have.css", "font-size", "20px");
        cy.contains("div", "Autopilot Start")
          .should("exist")
          .and("have.css", "font-size", "20px");
        cy.contains("div", "Autopilot Complete")
          .should("exist")
          .and("have.css", "font-size", "20px");
        cy.contains("div", "Modeling Start")
          .should("exist")
          .and("have.css", "font-size", "20px");
        cy.contains("div", "Modeling Complete")
          .should("exist")
          .and("have.css", "font-size", "20px");
      }
    });
  });
});
