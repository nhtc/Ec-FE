import { nextToStep2 } from "../helper";

const text151 =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum has been the industry standard dummy text ever since the 1500s Lo";
const text501 =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum has been the industry standard dummy text ever since the 1500s when an unknown printer took a galley of type and scrambled it to make a type specimen book It has survived not only five centuries but also the leap into electronic typesetting remaining essentially unchanged It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages and more recently with desktop Lorem Lorem";

describe("When a user lands on step two, they are prompted to enter a name and description", () => {
  beforeEach(() => {
    nextToStep2();
  });

  it("If the user chooses a name or description with a special character or preceding space, they should see an error and not be able to proceed", () => {
    cy.get("@name").type("!"); // Typing special character
    cy.get("@description").type("!"); // Typing special character
    cy.get("@name").should("have.attr", "aria-invalid", "true");
    cy.get("@description").should("have.attr", "aria-invalid", "true");
    cy.get("@name").parent().parent().as("nameWrapper");
    cy.get("@nameWrapper")
      .contains("div", "Can only contain letters, numbers and spaces.")
      .should("exist");
    cy.get("@description").parent().parent().as("descriptionWrapper");
    cy.get("@descriptionWrapper")
      .contains("div", "Can only contain letters, numbers and spaces.")
      .should("exist");

    cy.get("@buttonWrapper").within(bottom => {
      cy.wrap(bottom).find("button").eq(1).as("nextButton");
      cy.get("@nextButton").contains("div", "Next");
      cy.get("@nextButton").should("be.disabled");
    });
  });

  it("Character limit for name (150 characters) and description (500 characters) should be enforced and displayed", () => {
    cy.get("@name")
      .type(text151)
      .invoke("val")
      .should("have.length.lt", text151.length);
    cy.get("@description")
      .type(text501)
      .invoke("val")
      .should("have.length.lt", text501.length);
  });

  it("The Next button becomes available once a valid name and description are input", () => {
    cy.get("@name").type("Name");
    cy.get("@description").type("Description");
    cy.get("@buttonWrapper").within(bottom => {
      cy.wrap(bottom).find("button").eq(1).as("nextButton");
      cy.get("@nextButton").contains("div", "Next");
      cy.get("@nextButton").should("be.enabled").click();
      cy.url().should("include", "/predictions-new/step-2/model-type");
    });
  });
});
