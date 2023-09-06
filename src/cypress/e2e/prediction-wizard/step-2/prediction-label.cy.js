import { nextToPredictionLabel } from "../helper";

describe("Once a user chooses the target and presses next and they chose a regression or classification model type, they are prompted to choose the label variable", () => {
  beforeEach(() => {
    nextToPredictionLabel();

    cy.contains("div", "What variables do you want to use as labels?")
      .should("have.css", "font-size", "24px")
      .as("labelTitle");

    cy.get("@labelTitle")
      .parent()
      .parent()
      .parent()
      .next()
      .next()
      .as("labelWrapper");

    cy.get("@labelWrapper").within(wrapper => {
      cy.wrap(wrapper).find("div>div>div").eq(0).children().as("items");
    });
  });

  it("The variable chosen as the target is greyed out and unclickable", () => {
    cy.get("@items").then(items => {
      if (items.length > 0) {
        cy.wrap(items)
          .eq(0)
          .within(firstItem => {
            cy.wrap(firstItem)
              .contains("div", "Target Variable")
              .should("exist");
          });
      }
    });
  });

  it("Users can select only 1 variable. Choosing a second switches the choice", () => {
    cy.get("@items").then(items => {
      if (items.length > 1) {
        cy.wrap(items).eq(1).click();
        if (items.length > 2) {
          cy.wrap(items).eq(2).click();
        }
      }
    });
  });

  it("Once a choice is made, the check mark appears on that choice and the next button becomes clickable", () => {
    cy.get("@items").then(items => {
      if (items.length > 1) {
        cy.wrap(items).eq(1).click();
        cy.get("@labelWrapper")
          .next()
          .next()
          .within(bottom => {
            cy.wrap(bottom).find("button").eq(1).as("nextButton");
            cy.get("@nextButton").contains("div", "Next");
            cy.get("@nextButton").should("be.enabled").click();
            cy.url().should("include", "/predictions-new/step-2/features");
          });
      }
    });
  });
});
