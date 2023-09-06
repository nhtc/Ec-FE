import prebuilt from "../../fixtures/prebuilt.json";

describe("Prebuilt AI tests", () => {
  beforeEach(() => {
    cy.login();
  });

  it("Should load predictions when visit Prebuilt-AI", () => {
    cy.wait("@getPredictions");

    cy.get(`a[href='/prebuilt-ai/${prebuilt[0].id}']`).should("exist");
  });

  it("When click on item at prebuilt AI's the model open with the data and the charts populated", () => {
    cy.wait("@getPredictions");

    cy.intercept(`${Cypress.env("apiUrl")}/predict/featured/*`, prebuilt[0]).as(
      "predictionDetail"
    );

    cy.get(`a[href='/prebuilt-ai/${prebuilt[0].id}']`).click();

    cy.wait("@predictionDetail");

    cy.get(`iframe#dataset-${prebuilt[0].id}`).as("iframe");

    cy.get("@iframe").should("exist");

    cy.frameLoaded(`#dataset-${prebuilt[0].id}`);

    cy.enter(`#dataset-${prebuilt[0].id}`).then(getBody => {
      getBody().find(".Dashboard").should("be.visible");
    });
  });
});
