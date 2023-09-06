import { nextToPredictionFeature } from "../helper";

describe("Once a user chooses a label and presses next, they are prompted to choose the features", () => {
  beforeEach(() => {
    nextToPredictionFeature();

    cy.contains("div", "What variables do you want to use as predictors?")
      .should("have.css", "font-size", "24px")
      .as("featureTitle");

    cy.get("@featureTitle")
      .parent()
      .parent()
      .parent()
      .next()
      .next()
      .next()
      .next()
      .as("featureWrapper");

    cy.get("@featureWrapper").within(wrapper => {
      cy.wrap(wrapper).find("div>div").children().as("items");
    });
  });

  it("The variables chosen as the target and label are greyed out and unclickable", () => {
    cy.get("@featureWrapper").then(items => {
      if (items.length > 1) {
        cy.wrap(items).within(item => {
          cy.wrap(item).contains("div", "Target Variable").should("exist");

          cy.wrap(item).contains("div", "Label Variable").should("exist");
        });
      }
    });
  });

  it("Users can select only as many variables as they want. Select all chooses all available variables", () => {
    // Select many variables
    cy.get("@items").then(rows => {
      if (rows.length > 0) {
        cy.wrap(rows)
          .eq(0)
          .within(firstRow => {
            cy.wrap(firstRow)
              .find(">div")
              .children()
              .then(items => {
                cy.wrap(items).eq(2).click();
              });
          });

        if (rows.length > 1) {
          cy.wrap(rows)
            .eq(1)
            .within(firstRow => {
              cy.wrap(firstRow)
                .find(">div")
                .children()
                .then(items => {
                  cy.wrap(items).eq(0).click();
                });
            });
        }
      }
    });

    // Select all available variables
    cy.get("@featureWrapper").prev().prev().as("selectAllButton");
    cy.get("@selectAllButton")
      .contains("div", "Select All")
      .should("exist")
      .click({ force: true });
    cy.get("@selectAllButton").contains("div", "Unselect All").should("exist");
  });

  it("Once a choice is made, the check mark appears on that choice and the next button becomes clickable", () => {
    cy.get("@items").then(items => {
      if (items.length > 2) {
        cy.wrap(items).eq(2).click();
        cy.get("@featureWrapper")
          .next()
          .next()
          .within(bottom => {
            cy.wrap(bottom).find("button").eq(1).as("nextButton");
            cy.get("@nextButton").contains("div", "Next");
            cy.get("@nextButton").should("be.enabled").click();
            cy.url().should("include", "/predictions-new/step-2/review");
          });
      }
    });
  });
});
