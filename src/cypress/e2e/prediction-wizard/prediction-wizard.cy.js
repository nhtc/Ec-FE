import route from "../../fixtures/route.json";
import { findFirstRow, nextToStep1 } from "./helper";

const checkingPredictionProperty = property => {
  cy.window().then(window => {
    const prediction = JSON.parse(
      window.localStorage.getItem("@inprogressPredictionTask")
    );
    expect(prediction).to.not.null;
    expect(prediction).to.haveOwnProperty(property).to.not.null;
  });
};

const selectItemInList = (title, wrapperName, step) => {
  if (step && step === 2) {
    cy.contains("div:visible", title)
      .should("have.css", "font-size", "24px")
      .parent()
      .parent()
      .parent()
      .next()
      .next()
      .as(wrapperName);
  } else {
    cy.contains("div:visible", title)
      .should("have.css", "font-size", "24px")
      .parent()
      .parent()
      .parent()
      .parent()
      .next()
      .next()
      .as(wrapperName);
  }

  cy.get(`@${wrapperName}`).within(wrapper => {
findFirstRow(wrapper)
      .then(items => {
        if (items.length > 0) {
          cy.wrap(items).eq(0).click();
        }
      });
  });
};

describe("Prediction Wizard tests", () => {
  beforeEach(() => {
    nextToStep1();
  });

  it("When a user lands on the prediction wizard, they can choose to either create a new prediction or re-test an existing (build on existing). Clicking either moves to the next screen.", () => {
    cy.clickButtonAndContinue("Ask a new question");
    cy.url().should("include", route.createPredictionStep1AskNew);
    cy.contains("What data would you like to use?").should("exist");

    cy.get("button").contains("Back").click({ force: true });
    cy.url().should("include", route.createPredictionStep1);

    cy.clickButtonAndContinue("Build on existing");
    cy.url().should("include", route.createPredictionStep1ExistingDataset);
    cy.contains("What would you like to build on?").should("exist");
  });

  it("On any screen, the user should be able to click the back button and go to the previous screen with their choices saved", () => {
    cy.clickButtonAndContinue("Ask a new question");
    cy.url().should("include", route.createPredictionStep1AskNew);

    cy.clickButtonAndContinue("Base dataset");
    cy.url().should("include", route.createPredictionStep1NewDataset);

    cy.get("button").contains("Back").click({ force: true });
    cy.url().should("include", route.createPredictionStep1AskNew);

    cy.get("button").contains("Back").click({ force: true });
    cy.url().should("include", route.createPredictionStep1);

    cy.clickButtonAndContinue("Build on existing");
    cy.url().should("include", route.createPredictionStep1ExistingDataset);

    cy.get("button").contains("Back").click({ force: true });
    cy.url().should("include", route.createPredictionStep1);
  });

  it("User choices are stored in cache until they finish the process OR they choose a different training data set", () => {
    cy.clickButtonAndContinue("Ask a new question");
    cy.url().should("include", route.createPredictionStep1AskNew);
    cy.contains("What data would you like to use?").should("exist");
    cy.clickButtonAndContinue("Base dataset");

    cy.intercept(`${Cypress.env("apiUrl")}/metabase/collection/234/items?*`).as(
      "datasetsIntercept"
    );
    cy.wait("@datasetsIntercept").its("response.statusCode").should("eq", 200);
    cy.wait(2000);

    // Checking dataset
    selectItemInList("Choose a dataset", "datasetsWrapper");
    cy.get('button:visible[aria-label="next-btn"]')
      .should("be.enabled")
      .click();
    checkingPredictionProperty("projectId");
    checkingPredictionProperty("projectCardId");

    // Checking name and description
    cy.get('input[type="text"]').type("Name");
    cy.get("textarea").type("Description");
    cy.get('button:visible[aria-label="next-btn"]')
      .should("be.enabled")
      .click();
    checkingPredictionProperty("name");
    checkingPredictionProperty("description");

    // Checking model type
    selectItemInList("What would you like to do?", "modelTypesWrapper", 2);
    cy.get('button:visible[aria-label="next-btn"]')
      .should("be.enabled")
      .click();
    checkingPredictionProperty("modelType");

    // Checking target
    selectItemInList("What would you like to predict?", "targetWrapper", 2);
    cy.get('button:visible[aria-label="next-btn"]')
      .should("be.enabled")
      .click();
    checkingPredictionProperty("targetFeature");

    // Checking label
    selectItemInList(
      "What variables do you want to use as labels?",
      "labelWrapper",
      2
    );
    cy.get('button:visible[aria-label="next-btn"]')
      .should("be.enabled")
      .click();
    checkingPredictionProperty("dataLabel");

    // Checking feature
    cy.contains("div", "What variables do you want to use as predictors?")
      .should("have.css", "font-size", "24px")
      .parent()
      .parent()
      .parent()
      .next()
      .next()
      .next()
      .next()
      .as("featureWrapper");

    cy.get("@featureWrapper").within(wrapper => {
      cy.wrap(wrapper)
        .find("div>div")
        .children()
        .then(rows => {
          if (rows.length > 0) {
            cy.wrap(rows)
              .eq(0)
              .within(firstRow => {
                cy.wrap(firstRow)
                  .find("div>div>div")
                  .children()
                  .then(items => {
                    cy.wrap(items).eq(2).click();
                  });
              });
          }
        });
    });
    cy.get('button:visible[aria-label="next-btn"]')
      .should("be.enabled")
      .click();
    checkingPredictionProperty("listFeatures");

    cy.get('button:visible[aria-label="next-btn"]')
      .should("be.enabled")
      .click();

    // Checking new dataset from step 3
    cy.clickButtonAndContinue("Test new data");
    cy.clickButtonAndContinue("Base dataset");
    selectItemInList("Choose a dataset", "step3DatasetsWrapper");
    checkingPredictionProperty("cardId");
  });
});
