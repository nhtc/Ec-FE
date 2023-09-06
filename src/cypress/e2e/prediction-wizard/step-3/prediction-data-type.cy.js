import { nextToStep3 } from "../helper";

const selectItem = text => {
  cy.contains("div:visible", text)
    .should("have.css", "font-size", "24px")
    .parent()
    .next()
    .find("button")
    .should("exist")
    .click({ force: true });
};

describe("When the user chooses a data type, a check mark appears and they can press next. Depending on the data type chosen, the user gets brought to a different screen", () => {
  beforeEach(() => {
    nextToStep3();

    selectItem("Test new data");
    cy.url().should("include", "/predictions-new/step-3/ask-existing");
  });

  it("CSV upload shows a screen to click to search the users computer for a file to upload", () => {
    selectItem("Your CSV");
    cy.url().should("include", "/predictions-new/step-3/csv");
  });

  it("Datasets and previous prediction show all the available data sets for the users organization", () => {
    selectItem("Base dataset");
    cy.url().should("include", "/predictions-new/step-3/new-dataset");

    cy.contains("button:visible", "Back").click();

    selectItem("Previous prediction");
    cy.url().should("include", "/predictions-new/step-3/previous-prediction");
  });
});
