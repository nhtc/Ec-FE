import completePrediction from "../../fixtures/prediction-complete.json";
import regressionDetail from "../../fixtures/regression-detail.json";
import regressionInsightDetail from "../../fixtures/regression-insight-detail.json";
import regressionInsight from "../../fixtures/regression-insight.json";
import {
  checkModalType,
  checkValueChartChangeTab2Regression,
  getPredictionTab2,
  handleClickDataPlayer,
  interceptDatasetApi,
  nextToPredictionDetail,
  testNameDataSet,
} from "./helper";

describe("Testing the regression item", () => {
  const predictionIdTest = "6aef30a2-06bb-4ce3-a35d-47758ca3f5c3";

  const regressions = completePrediction.items.filter(i => {
    return i.modelType === "Regression";
  });
  // this is test item from mock data
  const regressionTestItem = regressions.find(
    i => (i.predictionId = predictionIdTest)
  );

  beforeEach(() => {
    cy.login();
    cy.get("a[href='/predictions']").should("exist").click({ force: true });
    cy.wait("@getTasksComplete");

    cy.intercept(`**/status/${predictionIdTest}`, {
      fixture: "regression-detail",
    }).as("predictionDetail");

    cy.intercept(
      `**/insights?predictionId=${predictionIdTest}&includeData=true`,
      { fixture: "regression-insight-detail" }
    ).as("predictionInsightDetail");

    cy.intercept(`**/insights`, { fixture: "regression-insight" }).as(
      "predictionInsight"
    );

    cy.intercept(`**/effects*`, { fixture: "regression-effects" }).as(
      "predictionEffects"
    );

    cy.intercept("**/info", { fixture: "regression-info" }).as("info");

    cy.intercept("**/type", { fixture: "regression-type" }).as("type");

    interceptDatasetApi();
  });

  it("When a user clicks on a completed regression model, they see the predictions insights page and can see the data and predictions populated on the chart", () => {
    nextToPredictionDetail(regressionTestItem.name, "Regression");

    cy.get('div[aria-label="predictionInsightId"]').then($wrapper => {
      cy.wrap($wrapper).should("exist");

      cy.wrap($wrapper)
        .find("div")
        .contains(regressionTestItem.name)
        .should("exist");
    });
  });

  it("[Regression]  When a user → is in the predictions insight of a completed regression model → The X axis of the predictions chart at the top is labeled with the target variable", () => {
    nextToPredictionDetail(regressionTestItem.name, "Regression");

    cy.get('div[aria-label="predictionInsightId"]').within(() => {
      cy.get("iframe").eq(0).as("firstIframe");

      cy.get("@firstIframe").should("exist");

      cy.frameLoaded(`@firstIframe`);

      cy.enter(`@firstIframe`).then(iframe => {
        iframe().contains(regressionInsight.modelInfo.target).should("exist");
      });
    });
  });

  it("When a user → is in the model insights page of a completed regression model → The ‘model type’ in the bottom left box is labeled as regression", () => {
    nextToPredictionDetail(regressionTestItem.name, "Regression");

    checkModalType("Regression");
  });

  it("When the user → creates a regression prediction → goes to the prediction that they made → clicks on datasets → the dataset from the prediction shows up in the iframe", () => {
    nextToPredictionDetail(regressionTestItem.name, "Regression");

    cy.get('div[aria-label="predictionTab-0"]').then(modelTab => {
      const wrapper = cy.wrap(modelTab);

      wrapper.should("exist");

      wrapper.contains("Dataset").click();

      cy.get(
        `iframe#dataset-${regressionDetail.prediction.metabaseQuestionId}`
      ).as("iframe");

      cy.get("@iframe").should("exist");
    });
  });

  it("When the user → creates a regression prediction → goes to the prediction that they made → clicks on datasets → the dataset is displayed → explore results → save datasets → choose name as ‘test regression dataset’ → save question to personal collection → go to data explorer → saved questions → personal collection → ‘test regression dataset’ should exist ", () => {
    nextToPredictionDetail(regressionTestItem.name, "Regression");
    testNameDataSet(
      "test regression dataset",
      regressionDetail.prediction.metabaseQuestionId
    );
  });

  it("[Regression]  When a user is in the predictions insight of a completed regression model → clicks on a player/players from the bottom right box → the spider chart on the right dynamically changes to include the statistics of the selected player/players", () => {
    nextToPredictionDetail(regressionTestItem.name, "Regression");
    handleClickDataPlayer(regressionInsightDetail);
  });

  it("When the user is in model insights for a regression prediction and chooses cross validation, the values on the charts change accordingly", () => {
    nextToPredictionDetail(regressionTestItem.name, "Regression");
    getPredictionTab2();
    checkValueChartChangeTab2Regression("Cross Validation");
  });

  it("When the user is in model insights for a regression prediction and chooses ‘hold out’, the chart and graph values change accordingly", () => {
    nextToPredictionDetail(regressionTestItem.name, "Regression");

    getPredictionTab2();
    checkValueChartChangeTab2Regression("Holdout");
  });
});
