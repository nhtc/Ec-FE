describe("When a user chose build on existing in step 1, they should move to the final screen in step 2 once they’ve entered a valid name and description", () => {
  it("The final screen shows the details of what was chosen including the data, model type, features, label, and target chosen", () => {
    cy.login(undefined, "/predictions-new");

    cy.url().should("include", "/predictions-new/step-1");

    cy.contains("div", "Build on existing")
      .should("have.css", "font-size", "24px")
      .as("buildOnExistingTitle");
    cy.get("@buildOnExistingTitle")
      .parent()
      .next()
      .find("button")
      .should("exist")
      .click({ force: true });
    cy.url().should("include", "/predictions-new/step-1/existing-dataset");

    cy.contains("div", "What would you like to build on?")
      .should("have.css", "font-size", "24px")
      .as("existingDatasetTitle");
    cy.get("@existingDatasetTitle")
      .parent()
      .parent()
      .parent()
      .next()
      .next()
      .as("itemsWrapper");

    cy.intercept("*").as("intercept");
    cy.wait("@intercept").its("response.statusCode").should("eq", 200);
    cy.wait(2000);

    cy.get("@itemsWrapper").within(wrapper => {
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
    cy.get('input[type="text"]').type("Name");
    cy.get("textarea").type("Description");
    cy.get("@title")
      .parent()
      .parent()
      .parent()
      .next()
      .next()
      .next()
      .next()
      .within(bottom => {
        cy.wrap(bottom).find("button").eq(1).as("nextButton");
        cy.get("@nextButton").contains("div", "Next");
        cy.get("@nextButton").should("be.enabled").click();
        cy.url().should("include", "/predictions-new/step-2/review");
      });
  });
});
