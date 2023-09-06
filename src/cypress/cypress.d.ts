export { };

interface Account {
  email?: string;
  password?: string;
}

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      login(account?: Account, visit?: string): Chainable<void>;
      loginByApi(account?: Account): Chainable<void>;
      getUserInfo(): Chainable<Cypress.Response<any>>;
      refreshToken(): Chainable<void>;
    }
  }
}