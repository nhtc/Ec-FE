import completePrediction from "../../fixtures/prediction-complete.json";
import inprogressPrediction from "../../fixtures/prediction-inprogress.json";

const { items: completeItems } = completePrediction;
const { items: inprogressItems } = inprogressPrediction;
describe("Testing the predictions page", () => {
  beforeEach(() => {
    cy.login();
    cy.get("a[href='/predictions']").should("exist").click({ force: true });
    cy.wait("@getTasksComplete");
  });

  it.skip("When the user lands on predictions, they see two tabs: one for completed and one for in-progress ", () => {
    cy.wait("@getTasksComplete");

    cy.get('div[aria-label="predictionTab-0"]').as("completed");

    cy.get('div[aria-label="predictionTab-1"]').as("inProgress");

    cy.get("@completed").should("exist");

    cy.get("@inProgress").should("exist");
  });

  it("When the user proceeds to the predictions tab, they can see the name and description of all predictions their organization has created", () => {
    cy.wait("@getTasksComplete");

    cy.contains(completeItems[0].name).should("exist");

    cy.contains(inprogressItems[0].name).should("exist");
  });

  it("When clicking on a prediction that’s running, the user is shown the prediction status", function () {
    cy.contains(inprogressItems[0].name).click();

    cy.wait(5000);

    cy.contains("Task Created").should("exist");

    cy.contains("Autopilot Init").should("exist");

    cy.contains("Autopilot Start").should("exist");

    cy.contains("Autopilot Complete").should("exist");

    cy.contains("Modeling Start").should("exist");

    cy.contains("Modeling Complete").should("exist");

    cy.contains("Prediction Start").should("exist");

    cy.contains("Prediction Complete").should("exist");
  });

  it("When clicking on a completed prediction, the user is shown the prediction insights page", () => {
    // this is an test item have lowest load
    cy.contains(completeItems[0].name).click();

    cy.contains("Prediction Insights").should("exist");
  });

  it("The user is able to delete predictions from the page", () => {
    const deleteItem = completeItems.find(el => el.name === "NFL REG 1");

    const listItemAfterDelete = completeItems.filter(
      el => el.predictionTaskId !== deleteItem.predictionTaskId
    );

    cy.intercept("DELETE", `**/${deleteItem.predictionTaskId}`).as(
      "deleteSuccess"
    );

    cy.intercept(
      "GET",
      `**/tasks?pageSize=50&page=1&onlyCompleted=false&excludeNullTaskId=true`,
      { ...completePrediction, items: listItemAfterDelete }
    ).as("tasksCompleteAfterDelete");

    cy.get('div[aria-label="complete"]')
      .contains(deleteItem.name)
      .then($item => {
        const wrapper = cy.wrap($item);

        wrapper.should("exist");

        cy.wrap($item).find('button[aria-haspopup="true"]').click();
      });

    cy.get('div[aria-label="Item Options"]').should("exist");

    cy.get("button").contains("Delete").should("exist");

    cy.get("button").contains("Delete").click();

    cy.get('div[role="alert"]').then($item => {
      const wrapper = cy.wrap($item);

      wrapper.should("exist");
    });

    cy.get('button[aria-label="deletePredictionBtn"').then($item => {
      const wrapper = cy.wrap($item);

      wrapper.should("exist");

      wrapper.click();
    });

    cy.wait("@deleteSuccess");

    cy.wait("@tasksCompleteAfterDelete");

    cy.get('div[aria-label="complete"]')
      .contains(deleteItem.name)
      .should("not.exist");
  });
});
