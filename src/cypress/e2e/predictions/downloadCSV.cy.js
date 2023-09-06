import account from "../../fixtures/account.json";

describe("Testing Download CSV Button", () => {
  const url = "/";
  let predictionComplete = [];
  let regressionTestItem = null;
  let classificationTestItem = null;
  let clusteringTestItem = null;
  let fileName = "";
  const downloadCSV = () => {
    cy.wait("@predictionInsight").then(v => {
      fileName = v.response.body.prediction.outputFileName;

      cy.get('[aria-label="predictionInsightId"]').should("exist");

      cy.get("button").contains("Download CSV").click({ force: true });

      cy.readFile(`cypress/downloads/${fileName}`);
    });
  };

  beforeEach(() => {
    cy.visit("/sign-in");
    cy.intercept(`${Cypress.env("apiUrl")}/users/authenticate`).as("login");
    cy.intercept(
      `**/tasks?pageSize=50&page=1&onlyCompleted=false&excludeNullTaskId=true`
    ).as("getTasksComplete");

    cy.get('input[type="email"]').type(account.email);

    cy.get('input[type="password"]').type(account.password, { force: true });

    cy.get('button[type="button"]').as("loginBtn");

    cy.get("@loginBtn").click();

    cy.wait("@login");

    cy.visit(url);

    cy.url().should("include", url === "/" ? "/prebuilt-ai" : url, () => {
      expect(localStorage.getItem("@currentUser")).to.exist();
    });

    cy.get("a[href='/predictions']").should("exist").click({ force: true });

    cy.wait("@getTasksComplete").then(v => {
      predictionComplete = v.response.body.items;
    });
  });

  it("[Regression] When a user → is in the predictions insight of a completed regression model → clicks the ‘Download CSV’ button on the top right → a CSV file of the predictions is downloaded to their downloads folder", () => {
    regressionTestItem = predictionComplete?.find(
      v =>
        v.targetType === "Regression" &&
        v.predictionTaskStatus === "PredictionComplete"
    );
    if (!regressionTestItem) return;

    cy.intercept(
      "GET",
      `**predict/status/${regressionTestItem.predictionId}`
    ).as("predictionInsight");

    cy.get('div[aria-label="complete"]:contains("Ready")').as("listComplete");
    cy.get("@listComplete").contains(regressionTestItem.name).click();

    cy.contains("Prediction Insights").should("exist");

    cy.intercept(
      "GET",
      `**predict/status/${regressionTestItem.predictionId}`
    ).as("predictionInsight");

    downloadCSV();
  });

  it("[Classification] When a user → is in the predictions insight of a completed regression model → clicks the ‘Download CSV’ button on the top right → a CSV file of the predictions is downloaded to their downloads folder", () => {
    classificationTestItem = predictionComplete.find(
      v =>
        ["Binary", "Multiclass"].includes(v.targetType) &&
        v.predictionTaskStatus === "PredictionComplete"
    );

    if (!classificationTestItem) return;
    cy.intercept(
      "GET",
      `**predict/status/${classificationTestItem.predictionId}`
    ).as("predictionInsight");

    cy.get('div[aria-label="complete"]:contains("Ready")').as("listComplete");
    cy.get("@listComplete").contains(classificationTestItem.name).click();
    cy.contains("Prediction Insights").should("exist");

    downloadCSV();
  });

  it("[Cluster]  When a user → is in the predictions insight of a completed clustering model → clicks the ‘Download CSV’ button on the top right → a CSV file of the predictions is downloaded to their downloads folder", () => {
    clusteringTestItem = predictionComplete.find(
      v =>
        v.targetType === "Clustering" &&
        v.predictionTaskStatus === "PredictionComplete"
    );

    if (!clusteringTestItem) return;
    cy.intercept(
      "GET",
      `**predict/status/${clusteringTestItem.predictionId}`
    ).as("predictionInsight");

    cy.get('div[aria-label="complete"]:contains("Ready")').as("listComplete");
    cy.get("@listComplete").contains(clusteringTestItem.name).click();

    cy.contains("Prediction Insights").should("exist");

    downloadCSV();
  });
});
