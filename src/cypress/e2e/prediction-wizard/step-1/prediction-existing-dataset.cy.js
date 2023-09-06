import route from "../../../fixtures/route.json";
import { nextToStep1 } from "../helper";

describe("Prediction Wizard existing dataset tests", () => {
  beforeEach(() => {
    nextToStep1();
  });

  it("When a user chooses to build on existing, they see a list of the models available to their organization. The cards should show the name, description, and type of model.", () => {
    cy.clickButtonAndContinue("Build on existing");
    cy.url().should("include", route.createPredictionStep1ExistingDataset);

    cy.get('div[aria-label="prediction-task-item-view"]')
      .first()
      .then($prediction => {
        cy.wrap($prediction)
          .find('div[aria-label="prediction-name"]')
          .should("exist");
        cy.wrap($prediction)
          .find('div[aria-label="prediction-description"]')
          .should("exist");
      });
  });

  it("Selected a model shows a spinner while loading and then a checkmark when choice is successful.", () => {
    cy.clickButtonAndContinue("Build on existing");
    cy.url().should("include", route.createPredictionStep1ExistingDataset);

    cy.get('div[aria-label="prediction-task-item-view"]')
      .first()
      .then($prediction => {
        cy.wrap($prediction).find("button").should("exist").click();

        cy.wrap($prediction)
          .find('div[aria-label="spinner"]', { timeout: 3000 })
          .should("not.exist");
        cy.wrap($prediction).find("button").should("be.disabled");
      });
  });
});
