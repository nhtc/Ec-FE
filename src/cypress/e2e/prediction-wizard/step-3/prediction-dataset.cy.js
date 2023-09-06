import { nextToStep3 } from "../helper";

const onSubmitWithDataset = () => {
  nextToStep3();

  cy.contains("div", "Test new data")
    .should("have.css", "font-size", "24px")
    .parent()
    .next()
    .find("button")
    .should("exist")
    .click({ force: true });
  cy.url().should("include", "/predictions-new/step-3/ask-existing");

  cy.contains("div:visible", "Base dataset")
    .should("exist")
    .should("have.css", "font-size", "24px")
    .as("step3BaseDatasetTitle");
  cy.get("@step3BaseDatasetTitle")
    .parent()
    .next()
    .find("button")
    .should("exist")
    .click({ force: true });
  cy.url().should("include", "/predictions-new/step-3/new-dataset");

  cy.contains("div:visible", "Choose a dataset")
    .should("have.css", "font-size", "24px")
    .as("step3ChooseDatasetTitle");

  cy.get("@step3ChooseDatasetTitle")
    .parent()
    .parent()
    .parent()
    .parent()
    .next()
    .next()
    .as("step3DatasetsWrapper");

  cy.get("@step3DatasetsWrapper").within(wrapper => {
    findFirstRow(wrapper)
      .then(items => {
        if (items.length > 0) {
          cy.wrap(items).eq(0).click();
          cy.wrap(wrapper)
            .next()
            .next()
            .within(bottom => {
              cy.wrap(bottom).find("button").eq(1).as("submitButton");
              cy.get("@submitButton").contains("div", "Submit");
              cy.get("@submitButton").should("be.enabled").click();

              cy.wait("@createTaskIntercept").then(({ response }) => {
                if (response.statusCode === 200) {
                  cy.url().should("include", "/predictions/task/");
                }
              });
            });
        }
      });
  });
};

describe("Testing Prediction With Datasets", () => {
  beforeEach(() => {
    cy.intercept(`${Cypress.env("apiUrl")}/wizard/tasks`).as(
      "createTaskIntercept"
    );
  });

  it("When the user chooses a dataset from the ‘Datasets’ section, it is successful and I can move on", () => {
    onSubmitWithDataset();
  });

  it("When chooses data, it automatically checks to make sure the columns are the same as the training dataset and the user gets and error if the columns are different", () => {
    onSubmitWithDataset();
  });
});
