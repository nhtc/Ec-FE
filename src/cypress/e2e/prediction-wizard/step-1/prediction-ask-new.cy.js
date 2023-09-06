import route from "../../../fixtures/route.json";
import { nextToStep1 } from "../helper";

describe("Prediction Wizard ask new tests", () => {

  const onClickChooseDataset = () => {
    cy.intercept("GET", requestURL).as("getBaseDatasetItems");
    cy.intercept("POST", `${Cypress.env("apiUrl")}/projects`).as(
      "createProject"
    );

    cy.clickButtonAndContinue("Ask a new question");
    cy.clickButtonAndContinue("Base dataset");
  }

  beforeEach(() => {
    nextToStep1();
  });

  it("When choosing base dataset or previous prediction, the user should see a screen with all their available datasets including their name and description.", () => {
    const requestURL = `${Cypress.env(
      "apiUrl"
    )}/metabase/collection/234/items?models=card&models=dataset&sort_column=last_edited_at&sort_direction=asc&pinned_state=is_not_pinned&limit=20&offset=0`;
    cy.intercept("GET", requestURL).as("getCollectionItems");

    cy.clickButtonAndContinue("Ask a new question");
    cy.clickButtonAndContinue("Base dataset");
    cy.url().should("include", route.createPredictionStep1NewDataset);
    cy.contains("div", "Choose a dataset").should(
      "have.css",
      "font-size",
      "24px"
    );

    cy.wait("@getCollectionItems").then(intercept => {
      if (intercept.response?.statusCode === 200) {
        const items = intercept.response.body.data;

        if (items.length > 0) {
          cy.get('div[aria-label="prediction-task-dataset-item-name"]').should(
            "exist"
          );
        }
      }
    });
  });

  it("When a user selects one of the of the datasets, the card gets a check box and the user can press next", () => {
    const requestURL = `${Cypress.env(
      "apiUrl"
    )}/metabase/collection/234/items?models=card&models=dataset&sort_column=last_edited_at&sort_direction=asc&pinned_state=is_not_pinned&limit=20&offset=0`;
    onClickChooseDataset()

    cy.wait("@getBaseDatasetItems").then(intercept => {
      if (intercept.response?.statusCode === 200) {
        const items = intercept.response?.body?.data;

        if (items.length > 0) {
          cy.get('div[aria-label="prediction-task-dataset-item"]')
            .first()
            .then($item => {
              cy.wrap($item).click();
              cy.wait("@createProject").then(intercept => {
                if (intercept.response?.statusCode === 200) {
                  cy.get('button[aria-label="next-btn"]');
                  cy.get('button:visible[aria-label="next-btn"]')
                    .should("contain", "Step 2")
                    .should("be.enabled")
                    .click();
                  cy.url().should("include", route.createPredictionStep2);
                }
              });
            });
        }
      }
    });
  });

  it("Once the user chooses a model, the next button becomes clickable.", () => {
    const requestURL = `${Cypress.env(
      "apiUrl"
    )}/metabase/collection/100/items?models=card&models=dataset&sort_column=last_edited_at&sort_direction=asc&pinned_state=is_not_pinned&limit=20&offset=0`;
    onClickChooseDataset()

    cy.wait("@getPreviousPredictionItems").then(intercept => {
      if (intercept.response?.statusCode === 200) {
        const items = intercept.response?.body?.data;
        if (items.length > 0) {
          cy.get('div[aria-label="prediction-task-dataset-item"]')
            .first()
            .click();

          cy.wait("@createProject").then(intercept => {
            if (intercept.response?.statusCode === 200) {
              cy.get('button:visible[aria-label="next-btn"]')
                .should("contain", "Step 2")
                .should("be.enabled")
                .click();
              cy.url().should("include", route.createPredictionStep2);
            }
          });
        }
      }
    });
  });

  it("When the user selects create new, they are prompted to choose what data they want to start with. Choosing any brings them to a new screen.", () => {
    cy.get('button[aria-label="next-btn"]').should("be.disabled");

    cy.clickButtonAndContinue("Ask a new question");
    cy.url().should("include", route.createPredictionStep1AskNew);

    cy.clickButtonAndContinue("Base dataset");
    cy.url().should("include", route.createPredictionStep1NewDataset);

    cy.get("button").contains("Back").click({ force: true });

    cy.clickButtonAndContinue("Previous prediction");
    cy.url().should("include", route.createPredictionStep1PreviousPrediction);

    cy.get("button").contains("Back").click({ force: true });

    cy.clickButtonAndContinue("Your CSV");
    cy.url().should("include", route.createPredictionStep1Csv);
  });
});
