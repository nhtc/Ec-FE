import { nextToPredictionReview } from "../helper";

describe("When a user finishes their selections, they see a screen describing all of their choices so they can review. The button changes to say “step 3”", () => {
  before(() => {
    nextToPredictionReview();

    cy.contains("div", "Review configuration")
      .should("have.css", "font-size", "24px")
      .as("reviewTitle");

    cy.get("@reviewTitle")
      .parent()
      .parent()
      .parent()
      .next()
      .next()
      .as("reviewWrapper");
  });

  it("When a user finishes their selections, they see a screen describing all of their choices so they can review. The button changes to say “step 3”", () => {
    cy.window().then(window => {
      const predictionTask = JSON.parse(
        window.localStorage.getItem("@inprogressPredictionTask")
      );
      if (predictionTask) {
        cy.get("@reviewWrapper")
          .contains("div", predictionTask.targetFeature)
          .should("exist");
        cy.get("@reviewWrapper")
          .contains("div", predictionTask.dataLabel)
          .should("exist");

        if (predictionTask.listFeatures.length) {
          predictionTask.listFeatures.forEach(feature => {
            cy.get("@reviewWrapper").contains("div", feature).should("exist");
          });
        }
      }
    });

    cy.get("@reviewWrapper")
      .next()
      .next()
      .within(bottom => {
        cy.wrap(bottom).find("button").eq(1).as("step3Button");
        cy.get("@step3Button").contains("div", "Step 3");
        cy.get("@step3Button").should("be.enabled").click();
        cy.url().should("include", "/predictions-new/step-3");
      });
  });
});
