import { nextToPredictionModelType } from "../helper";

describe("When a user chose new question, they are prompted to choose what type of model they want. Selecting the model type creates a check mark on the screen and the next button becomes pressable", () => {
  beforeEach(() => {
    nextToPredictionModelType();
  });

  it("When a user chose new question, they are prompted to choose what type of model they want. Selecting the model type creates a check mark on the screen and the next button becomes pressable", () => {
    cy.contains("div", "What would you like to do?")
      .should("have.css", "font-size", "24px")
      .as("modelTypeTitle");

    cy.get("@modelTypeTitle")
      .parent()
      .parent()
      .parent()
      .next()
      .next()
      .as("modelTypesWrapper");

    cy.get("@modelTypesWrapper").within(wrapper => {
      cy.wrap(wrapper)
        .find("div>div>div")
        .eq(0)
        .children()
        .then(items => {
          if (items.length > 0) {
            cy.wrap(items).eq(0).as("firstItem").click();
            cy.get("@firstItem").find("button").should("be.disabled");
            cy.wrap(wrapper)
              .next()
              .next()
              .within(bottom => {
                cy.wrap(bottom).find("button").eq(1).as("nextButton");
                cy.get("@nextButton").contains("div", "Next");
                cy.get("@nextButton").should("be.enabled").click();
                cy.url().should("include", "/predictions-new/step-2/target");
              });
          }
        });
    });
  });
});
