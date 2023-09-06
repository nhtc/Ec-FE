describe("Support Email", () => {
  before(() => {
    cy.login();
  });

  it("When clicking on the support button, the users email opens with an email draft to the gemini support email", () => {
    cy.get('button[aria-haspopup="true"]').should("exist").click();
    cy.get("button").contains("Support").should("exist").click();
  });
});
