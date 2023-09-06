import classificationBinaryInsightDetail from "../../fixtures/classification-binary-insight-detail.json";
import classificationBinaryInsight from "../../fixtures/classification-binary-insight.json";

import classificationDetail from "../../fixtures/classification-detail.json";
import classificationInsight from "../../fixtures/classification-insight.json";
import completePrediction from "../../fixtures/prediction-complete.json";
import {
  checkModalType,
  getPredictionTab2,
  handleClickDataPlayer,
  interceptBinaryApi,
  interceptDatasetApi,
  nextToPredictionDetail,
  testNameDataSet,
} from "./helper";

describe("Testing the classification item", () => {
  const predictionIdTest = "1a8cba9b-7d05-4269-9d78-e340551cedf1";

  const testClassificationItem = completePrediction.items.find(
    i => i.modelType === "Classification" && i.predictionId === predictionIdTest
  );
  const predictionIdBinaryTest = "193e4c98-ff9b-4bdf-878a-2ae63dc4b81e";

  const testClassificationBinaryItem = completePrediction.items.find(
    i =>
      i.modelType === "Classification" &&
      i.predictionId === predictionIdBinaryTest
  );
  beforeEach(() => {
    cy.login();
    cy.get("a[href='/predictions']").should("exist").click({ force: true });
    cy.wait("@getTasksComplete");

    cy.intercept(`**/status/${predictionIdTest}`, {
      fixture: "classification-detail",
    }).as("predictionDetail");

    cy.intercept(
      `**/multiclass/data?predictionId=${predictionIdTest}&includeData=true`,
      { fixture: "classification-insight-detail" }
    ).as("predictionInsightDetail");

    cy.intercept(`**/insights`, { fixture: "classification-insight" }).as(
      "predictionInsight"
    );

    cy.intercept("**/info", { fixture: "classification-info" }).as("info");

    cy.intercept("**/type", { fixture: "classification-type" }).as("type");

    interceptDatasetApi();
  });

  it("When a user clicks on a completed classification model, they see the predictions insights page and can see the data and predictions populated on the chart", () => {
    nextToPredictionDetail(testClassificationItem.name, "Classification");

    cy.get('div[aria-label="predictionInsightId"]').then($wrapper => {
      cy.wrap($wrapper).should("exist");

      cy.wrap($wrapper)
        .find("div")
        .contains(testClassificationItem.name)
        .should("exist");
    });

    cy.get('div[aria-label="Predictions"]').then($wrapper => {
      cy.wrap($wrapper).should("exist");

      cy.wrap($wrapper).within(() => {
        cy.get('select[aria-label="Select Feature"]')
          .eq(0)
          .select("CLASS_1_EXPLANATION_3_STRENGTH")
          .invoke("val")
          .should("eq", "CLASS_1_EXPLANATION_3_STRENGTH");

        cy.get('select[aria-label="Select Feature"]')
          .eq(1)
          .select("CLASS_1_EXPLANATION_2_STRENGTH")
          .invoke("val")
          .should("eq", "CLASS_1_EXPLANATION_2_STRENGTH");

        cy.get('select[aria-label="Select Feature"]')
          .eq(2)
          .select("CLASS_1_EXPLANATION_1_STRENGTH")
          .invoke("val")
          .should("eq", "CLASS_1_EXPLANATION_1_STRENGTH");

        cy.wait(200);

        cy.get("iframe").as("predictionsChartIframe");

        cy.get("@predictionsChartIframe")
          .its("0.contentDocument")
          .its("body")
          .should("not.be.empty");

        cy.frameLoaded(`@predictionsChartIframe`);

        cy.enter(`@predictionsChartIframe`).then(iframe => {
          iframe().find("canvas").should("exist");
        });
      });
    });
  });

  it("[Classification] When a user → is in the model insights page of a completed binary classification model → The ‘model type’ in the bottom left box is labeled as binary", () => {
    interceptBinaryApi(predictionIdBinaryTest);

    nextToPredictionDetail(testClassificationBinaryItem.name, "Classification");

    checkModalType("Binary");
  });

  it("[Classification]  When a user → is in the predictions insight of a completed classification model  → The X axis of the predictions chart at the top is labeled with the target variable", () => {
    interceptBinaryApi(predictionIdBinaryTest);

    nextToPredictionDetail(testClassificationBinaryItem.name, "Classification");

    cy.get('div[aria-label="predictionInsightId"]').within(() => {
      cy.get("iframe").eq(0).as("firstIframe");

      cy.get("@firstIframe").should("exist");

      cy.frameLoaded(`@firstIframe`);

      cy.enter(`@firstIframe`).then(iframe => {
        iframe()
          .contains(classificationBinaryInsight.modelInfo.target)
          .should("exist");
      });
    });
  });

  it("When the user is in model insights for a classification prediction and chooses cross validation, the values on the charts change accordingly", () => {
    nextToPredictionDetail(testClassificationItem.name, "Classification");

    getPredictionTab2();

    cy.get('div[aria-label="metricItemData"]').first().as("metricItemData");
    cy.contains("Lift Chart").parent().next().next().as("liftChartIframe");

    cy.get("@metricItemData")
      .invoke("text")
      .then(text => {
        expect(text).to.equal(
          classificationInsight.metrics[0].validation.toFixed(2)
        );
      });

    cy.get('select[aria-label="Choose Metric"]')
      .select("Cross Validation")
      .invoke("val")
      .should("eq", "Cross Validation");

    cy.wait(10000);

    cy.get("@metricItemData")
      .invoke("text")
      .then(updatedText => {
        expect(updatedText).to.equal(
          classificationInsight.metrics[0].crossValidation.toFixed(2)
        );
      });

    cy.get("@liftChartIframe")
      .its("0.contentDocument.body")
      .should("not.be.empty");

    cy.frameLoaded(`@liftChartIframe`).then(iframe => {
      const chartWrapper =
        iframe[0].contentDocument.body.querySelector("#main");
      expect(chartWrapper).to.be.exist;

      cy.document().then(doc => {
        const wrapper = doc.querySelector('div[aria-label="Lift Chart"]');
        const iframeElement = wrapper.querySelector("iframe#view");
        const iframeDocument =
          iframeElement.contentDocument || iframeElement.contentWindow.document;

        expect(iframeDocument).to.not.be.null;

        const body = iframeDocument.body;
        if (body) {
          const main = body.querySelector("#main");
          const instance =
            iframeElement.contentWindow.echarts.getInstanceByDom(main);

          const option = instance.getOption();
          const series = option?.series;
          const crossValidationClasses = [
            "0-5",
            "1-5",
            "2-5",
            "3-5",
            "4-5",
            "5-5",
          ];

          const crossValidationData =
            classificationInsight.multiclassLiftChart.filter(
              x => x.sourceName === "crossValidation"
            );

          crossValidationClasses.forEach(className => {
            const crossValidation = crossValidationData.find(
              x => x.className === className
            );

            expect(
              series[crossValidationData.indexOf(crossValidation)].data[0][1]
            ).to.eq(crossValidation.predicted);
          });
        }
      });
    });
  });

  it("[Classification]  When the user → creates a classification prediction → goes to the prediction that they made → clicks on datasets → the dataset is displayed → explore results → save datasets → choose name as ‘test classification dataset’ → save question to personal collection → go to data explorer → saved questions → personal collection → ‘test classification dataset’ should exist ", () => {
    nextToPredictionDetail(testClassificationItem.name, "Classification");

    testNameDataSet(
      "test classification dataset",
      classificationDetail.prediction.metabaseQuestionId
    );
  });

  it("[Classification] When a user → is in the predictions insight of a completed classification model → clicks on a player/players from the bottom right box → the spider chart on the right dynamically changes to include the statistics of the selected player/players ", () => {
    interceptBinaryApi(predictionIdBinaryTest);

    nextToPredictionDetail(testClassificationBinaryItem.name, "Classification");

    handleClickDataPlayer(classificationBinaryInsightDetail, true);
  });

  it("When the user is in model insights for a classification prediction and chooses ‘hold out’, the chart and graph values change accordingly", () => {
    nextToPredictionDetail(testClassificationItem.name, "Classification");

    getPredictionTab2();

    cy.get('select[aria-label="Choose Metric"]')
      .should("exist")
      .select("Holdout");
    cy.wait(10000);

    cy.get('div[aria-label="metricItemData"]').each((metricItem, idx) => {
      cy.wrap(metricItem)
        .next()
        .next()
        .then(iframeElm => {
          cy.wrap(iframeElm)
            .as("iframe")
            .its("0.contentDocument.body")
            .should("not.be.empty");

          cy.frameLoaded("@iframe").then(iframe => {
            cy.wrap(iframe)
              .its("0.contentWindow")
              .then(contentWindow => {
                expect(contentWindow).to.not.null;
                const echarts = contentWindow.echarts;
                const chartWrapper =
                  iframeElm[0].contentDocument.body.querySelector("#main");
                if (echarts && chartWrapper) {
                  const chartProps = echarts.getInstanceByDom(chartWrapper);
                  expect(classificationInsight.metrics[idx].holdout).to.eq(
                    chartProps.getOption().series[1].data[0].value
                  );
                }
              });
          });
        });
    });

    cy.contains("div", "Lift Chart")
      .parent()
      .next()
      .next()
      .then(iframeElm => {
        cy.wrap(iframeElm)
          .as("liftChartIframe")
          .its("0.contentDocument.body")
          .should("not.be.empty");

        cy.frameLoaded("@liftChartIframe").then(iframe => {
          cy.wrap(iframe)
            .its("0.contentWindow")
            .then(contentWindow => {
              expect(contentWindow).to.not.null;
              const echarts = contentWindow.echarts;
              console.log("echarts", echarts);
              const chartWrapper =
                iframeElm[0].contentDocument.body.querySelector("#main");
              if (echarts && chartWrapper) {
                const chartProps = echarts.getInstanceByDom(chartWrapper);
                const liftCharts =
                  classificationInsight.multiclassLiftChart.filter(
                    liftChart => liftChart.sourceName === "holdout"
                  );
                chartProps.getOption().series.forEach((it, idx) => {
                  expect(it.name).to.eq(liftCharts[idx].className);
                  expect(it.data[0]).to.includes(liftCharts[idx].predicted);
                });
              }
            });
        });
      });
  });
});
