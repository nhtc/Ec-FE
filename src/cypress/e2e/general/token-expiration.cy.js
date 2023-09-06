describe("Checking Token Expiration", () => {
  beforeEach(() => {
    cy.login();
  });

  it("When session tokens expire, they should be refreshed and the user should remain logged in", () => {
    cy.getUserInfo().then(response => {
      // Unauthorized
      if (response.status === 401) {
        cy.loginByApi();
      }
    });
  });

  it("When JWT tokens expire, they should be refreshed and the user should remain logged in", () => {
    cy.getUserInfo().then(response => {
      // Unauthorized
      if (response.status === 401) {
        cy.refreshToken();
      }
    });
  });
});
