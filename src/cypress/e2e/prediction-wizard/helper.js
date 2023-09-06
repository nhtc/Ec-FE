import route from "../../fixtures/route.json";

export const nextToStep1 = () => {
  cy.login();
  cy.visit(route.predictions);
  cy.get(`a[href="/predictions-new"]`).contains("Add Prediction").click();
  cy.url().should("include", route.createPredictionStep1);
};

export const findFirstRow=(wrapper)=>{
      cy.wrap(wrapper)
      .find("div>div>div")
      .eq(0)
      .children()
}

export const nextToStep2 = () => {
  cy.login(undefined, "/predictions-new");

  cy.url().should("include", route.createPredictionStep1);

  cy.contains("div", "Ask a new question")
    .should("have.css", "font-size", "24px")
    .as("askNewTitle");
  cy.get("@askNewTitle")
    .parent()
    .next()
    .find("button")
    .should("exist")
    .click({ force: true });
  cy.url().should("include", route.createPredictionStep1AskNew);

  cy.contains("div", "Base dataset")
    .should("have.css", "font-size", "24px")
    .as("baseDatasetTitle");
  cy.get("@baseDatasetTitle")
    .parent()
    .next()
    .find("button")
    .should("exist")
    .click({ force: true });

  cy.contains("div", "Choose a dataset")
    .should("have.css", "font-size", "24px")
    .as("chooseDatasetTitle");

  cy.get("@chooseDatasetTitle")
    .parent()
    .parent()
    .parent()
    .parent()
    .next()
    .next()
    .as("itemsWrapper");
  cy.intercept(`${Cypress.env("apiUrl")}/metabase/collection/234/items?*`).as(
    "datasetsIntercept"
  );
  cy.wait("@datasetsIntercept").its("response.statusCode").should("eq", 200);
  cy.wait(2000);
  cy.get("@itemsWrapper").within(wrapper => {
findFirstRow(wrapper)
      .then(items => {
        if (items.length > 0) {
          cy.wrap(items).eq(0).click();
          cy.wrap(wrapper)
            .next()
            .next()
            .within(bottom => {
              cy.wrap(bottom).find("button").eq(1).as("step2Button");
              cy.get("@step2Button").contains("div", "Step 2");
              cy.get("@step2Button").should("be.enabled").click();
            });
        }
      });
  });

  cy.contains("div", "What do you want to name your prediction?")
    .should("have.css", "font-size", "24px")
    .as("title");
  cy.get('input[type="text"]').as("name");
  cy.get("textarea").as("description");
  cy.get("@title")
    .parent()
    .parent()
    .parent()
    .next()
    .next()
    .next()
    .next()
    .as("buttonWrapper");
};

export const nextToPredictionModelType = () => {
  nextToStep2();
  cy.get("@name").type("Name");
  cy.get("@description").type("Description");
  cy.get("@buttonWrapper").within(bottom => {
    cy.wrap(bottom).find("button").eq(1).as("nextButton");
    cy.get("@nextButton").contains("div", "Next");
    cy.get("@nextButton").should("be.enabled").click();
    cy.url().should("include", "/predictions-new/step-2/model-type");
  });
};

export const nextToPredictionTarget = () => {
  nextToPredictionModelType();
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
 findFirstRow(wrapper)
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
};

export const nextToPredictionLabel = () => {
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

  cy.get("@targetWrapper").within(wrapper => {
findFirstRow(wrapper)
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
              cy.url().should("include", "/predictions-new/step-2/label");
            });
        }
      });
  });
};

export const nextToPredictionFeature = () => {
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
findFirstRow(wrapper)
      .then(items => {
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
};

export const nextToPredictionReview = () => {
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
    cy.wrap(wrapper)
      .find("div>div")
      .children()
      .then(rows => {
        if (rows.length > 0) {
          cy.wrap(rows)
            .eq(0)
            .within(firstRow => {
              cy.wrap(firstRow)
                .find(">div")
                .children()
                .then(items => {
                  cy.wrap(items).eq(2).click();

                  cy.wrap(wrapper)
                    .next()
                    .next()
                    .within(bottom => {
                      cy.wrap(bottom).find("button").eq(1).as("nextButton");
                      cy.get("@nextButton").contains("div", "Next");
                      cy.get("@nextButton").should("be.enabled").click();
                      cy.url().should(
                        "include",
                        "/predictions-new/step-2/review"
                      );
                    });
                });
            });
        }
      });
  });
};

export const selectClusteringModel = () => {
  nextToPredictionModelType();
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
      .contains("div", "Clustering")
      .and("have.css", "font-size", "24px")
      .click();

    cy.wrap(wrapper)
      .next()
      .next()
      .within(bottom => {
        cy.wrap(bottom).find("button").eq(1).as("nextButton");
        cy.get("@nextButton").contains("div", "Next");
        cy.get("@nextButton").should("be.enabled").click();
        cy.url().should("include", "/predictions-new/step-2/label");
      });
  });
};

export const nextToStep3 = () => {
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

  cy.get("@reviewWrapper")
    .next()
    .next()
    .within(bottom => {
      cy.wrap(bottom).find("button").eq(1).as("step3Button");
      cy.get("@step3Button").contains("div", "Step 3");
      cy.get("@step3Button").should("be.enabled").click();
      cy.url().should("include", "/predictions-new/step-3");
    });
};
