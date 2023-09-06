import { nextToPredictionTarget } from "../helper";

describe("Once the user chooses a model and presses next, they are prompted to choose their target variable. When they land on the screen, the user can see all columns from their chosen dataset listed out with their data type", () => {
  beforeEach(() => {
    nextToPredictionTarget();

    cy.contains("div", "What would you like to predict?")
      .should("have.css", "font-size", "24px")
      .as("targetTitle");

    cy.get("@targetTitle")
      .parent()
      .parent()
      .parent()
      .next()
      .next()
      .as("targetWrapper");
  });

  it("Users can select only 1 variable. Choosing a second switches the choice", () => {
    cy.get("@targetWrapper").within(wrapper => {
      cy.wrap(wrapper)
        .find("div>div>div")
        .eq(0)
        .children()
        .then(items => {
          if (items.length > 0) {
            cy.wrap(items).eq(0).click();
            if (items.length > 1) {
              cy.wrap(items).eq(1).click();
            }
          }
        });
    });
  });

  it("Once a choice is made, the check mark appears on that choice and the next button becomes clickable", () => {
    cy.get("@targetWrapper").within(wrapper => {
      cy.wrap(wrapper)
        .find("div>div>div")
        .eq(0)
        .children()
        .then(items => {
          if (items.length > 0) {
            cy.wrap(items).eq(0).click();

            cy.wrap(wrapper)
              .next()
              .next()
              .within(bottom => {
                cy.wrap(bottom).find("button").eq(1).as("nextButton");
                cy.get("@nextButton").contains("div", "Next");
                cy.get("@nextButton").should("be.enabled").click();
                cy.url().should("include", "/predictions-new/step-2/label");
              });
          }
        });
    });
  });
});
