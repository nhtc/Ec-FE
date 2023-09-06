import { nextToStep3 } from "../helper";

const nextToUploadFile = () => {
  nextToStep3();

  cy.contains("div", "Test new data")
    .should("have.css", "font-size", "24px")
    .parent()
    .next()
    .find("button")
    .should("exist")
    .click({ force: true });
  cy.url().should("include", "/predictions-new/step-3/ask-existing");

  cy.contains("div:visible", "Your CSV")
    .should("exist")
    .should("have.css", "font-size", "24px")
    .as("step3YourCSVTitle");
  cy.get("@step3YourCSVTitle")
    .parent()
    .next()
    .find("button")
    .should("exist")
    .click({ force: true });
  cy.url().should("include", "/predictions-new/step-3/csv");

  cy.contains("div:visible", "Upload your CSV").should(
    "have.css",
    "font-size",
    "24px"
  );

  cy.get('button[aria-label="next-btn"]').should("be.disabled");
  cy.get("button").contains("Select File").click();

  cy.intercept(`${Cypress.env("apiUrl")}/wizard/tasks`).as(
    "createTaskIntercept"
  );
};

describe("When the user uploads a valid test CSV it is process and they are able to move on", () => {
  before(() => {
    nextToUploadFile();
  });

  it("When the user uploads a valid test CSV it is process and they are able to move on", () => {
    cy.get("input[type=file]")
      .last()
      .then(input => {
        cy.wrap(input).selectFile(
          "cypress/fixtures/Longevity_Multiclass_Classification.csv",
          { force: true }
        );
      });

    cy.get("button").contains("Uploading file").should("be.visible");

    cy.intercept(
      `${Cypress.env(
        "apiUrl"
      )}/projects/signed-url/dev-gemini-sports-ai-temp-uploads/*`
    ).as("uploadingFile");
    cy.wait("@uploadingFile").its("response.statusCode").should("eq", 200);

    cy.contains("button:visible", "Submit")
      .should("exist")
      .and("be.enabled")
      .click();

    cy.wait("@createTaskIntercept").then(({ response }) => {
      if (response.statusCode === 200) {
        cy.url().should("include", "/predictions/task/");
      }
    });
  });
});

describe("If the user uploads an invalid CSV file or fails to select a valid test dataset, then they are unable to proceed", () => {
  before(() => {
    nextToUploadFile();
  });

  it("If the user uploads an invalid CSV file or fails to select a valid test dataset, then they are unable to proceed", () => {
    cy.get("input[type=file]")
      .last()
      .then(input => {
        cy.wrap(input).selectFile(
          "cypress/fixtures/Longevity_Regression_Test_Fewer_2_Columns.csv",
          { force: true }
        );
      });

    cy.get("button").contains("Uploading file").should("be.visible");

    cy.contains("div", "Invalid File").should("exist");
    cy.contains("button:visible", "Submit").should("exist").and("be.disabled");
  });
});
