import account from "../fixtures/account.json";

Cypress.Commands.add(
  "login",
  (
    user = {
      username: account.email,
      password: account.password,
    },
    url = "/"
  ) => {
    cy.visit("/sign-in");
    cy.intercept(`${Cypress.env("apiUrl")}/users/authenticate`).as("login");
    cy.intercept(
      `**/tasks?pageSize=50&page=1&onlyCompleted=false&excludeNullTaskId=true`,
      { fixture: "prediction-complete" }
    ).as("getTasksComplete");

    cy.intercept(`${Cypress.env("apiUrl")}/predict/featured`, {
      fixture: "prebuilt",
    }).as("getPredictions");

    cy.get('input[type="email"]').type(user.username);

    cy.get('input[type="password"]').type(user.password);

    cy.get('button[type="button"]').as("loginBtn");

    cy.get("@loginBtn").click();

    cy.wait("@login");

    cy.visit(url);

    cy.url().should("include", url === "/" ? "/prebuilt-ai" : url, () => {
      expect(localStorage.getItem("@currentUser")).to.exist();
    });
  }
);

Cypress.Commands.add(
  "loginByApi",
  (
    user = {
      username: account.email,
      password: account.password,
    },
    url = "/"
  ) => {
    cy.request({
      url: `${Cypress.env("apiUrl")}/users/authenticate`,
      method: "POST",
      body: user,
      log: false,
    })
      .then(response => {
        const auth = { ...response.body };

        cy.window().then(window =>
          window.localStorage.setItem("@currentUser", JSON.stringify({ auth }))
        );
      })
      .then(() => {
        cy.visit(url);
        cy.url().should("include", url === "/" ? "/predictions" : url);
      });
  }
);

Cypress.Commands.add("getUserInfo", () => {
  cy.window().then(window => {
    const currentUser = JSON.parse(window.localStorage.getItem("@currentUser"));
    if (currentUser && currentUser.auth) {
      const {
        authenticationResult: { accessToken, idToken, refreshToken },
      } = currentUser.auth;

      cy.request({
        url: `${Cypress.env("apiUrl")}/users/user/info`,
        method: "GET",
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
          Identity: !!idToken ? `${idToken}` : "",
          RefreshToken: refreshToken,
        },
        log: false,
        failOnStatusCode: false,
      });
    }
  });
});

Cypress.Commands.add("refreshToken", () => {
  cy.window().then(window => {
    const currentUser = JSON.parse(window.localStorage.getItem("@currentUser"));
    if (currentUser && currentUser.auth) {
      const {
        authenticationResult: { accessToken, idToken, refreshToken },
      } = currentUser.auth;

      cy.request({
        url: `${Cypress.env("apiUrl")}/users/refresh`,
        method: "POST",
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
          Identity: !!idToken ? `${idToken}` : "",
          RefreshToken: refreshToken,
        },
        body: {
          refreshToken: true,
        },
        log: false,
      }).then(response => {
        const auth = { ...response.body };

        cy.window().then(window => {
          window.localStorage.setItem("@currentUser", JSON.stringify({ auth }));
          cy.reload();
        });
      });
    }
  });
});
