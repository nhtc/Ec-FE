import route from "../fixtures/route.json";

Cypress.Commands.add("clickButtonAndContinue", title => {
  cy.contains(title)
    .should("exist")
    .parent()
    .next()
    .find("button")
    .click({ force: true });
});

Cypress.Commands.add(
  "nextAndHandleUploadCSV",
  ({ file, onSuccess, onError, measureUploadStartTime }) => {
    const apiUrl = Cypress.env("apiUrl");

    cy.intercept({
      method: "POST",
      url: `${apiUrl}/projects`,
    }).as("createProject");

    cy.clickButtonAndContinue("Ask a new question");
    cy.url().should("include", route.createPredictionStep1AskNew);
    cy.clickButtonAndContinue("Your CSV");
    cy.url().should("include", route.createPredictionStep1Csv);

    cy.get('button[aria-label="next-btn"]').should("be.disabled");
    cy.get("button").contains("Select File").click();

    cy.get("input[type=file]")
      .last()
      .then(input => {
        cy.wrap(input).selectFile(file, { force: true });
      });

    if (measureUploadStartTime) {
      measureUploadStartTime();
    }

    cy.get("button").contains("Uploading file").should("be.visible");

    if (onSuccess) {
      cy.wait("@createProject").then(intercept => {
        if (intercept.response && intercept.response.statusCode === 200) {
          onSuccess();
        }
      });
    } else if (onError) {
      onError();
    }
  }
);

Cypress.Commands.add("measureUploadTime", (maxTime, start) => {
  return cy
    .contains("File uploaded successfully", { timeout: maxTime })
    .then(() => {
      const end = Date.now();
      return end - start;
    });
});
