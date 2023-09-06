import clusterDataInsight from "../../fixtures/clustering-data-insight-detail.json";
import clusteringDetail from "../../fixtures/clustering-detail.json";
import clusterInsight from "../../fixtures/clustering-insight.json";
import completePrediction from "../../fixtures/prediction-complete.json";
import route from "../../fixtures/route.json";
import {
  checkModalType,
  getPredictionTab2,
  interceptDatasetApi,
  nextToIframeDetail,
  nextToPredictionDetail,
  testNameDataSet,
} from "./helper";

describe("Testing the clustering item", () => {
  const predictionIdTest = "7d83e907-a337-4083-b009-cb2ecf0f7c98";

  const clustering = completePrediction.items.filter(i => {
    return i.modelType === "Clustering";
  });

  const testClusteringItem = clustering.find(
    i => (i.predictionId = predictionIdTest)
  );

  beforeEach(() => {
    cy.login();
    cy.get("a[href='/predictions']").should("exist").click({ force: true });
    cy.wait("@getTasksComplete");
    cy.intercept(`**/status/${predictionIdTest}`, {
      fixture: "clustering-detail",
    }).as("predictionDetail");

    cy.intercept(`**/insights?predictionId=${predictionIdTest}`, {
      fixture: "clustering-insight-detail",
    }).as("predictionInsightDetail");

    cy.intercept(`**/insights`, { fixture: "clustering-insight" }).as(
      "predictionInsight"
    );

    cy.intercept(`**/effects*`, { fixture: "clustering-effects" }).as(
      "predictionEffects"
    );

    cy.intercept(`**/data?predictionId=${predictionIdTest}&includeData=true`, {
      fixture: "clustering-data-insight-detail",
    }).as("predictionDataInsight");

    cy.intercept("**/type", { fixture: "clustering-type" }).as("type");

    cy.intercept("**/info", { fixture: "clustering-info" }).as("info");

    interceptDatasetApi();
  });

  it("When a user → is in the predictions insight of a completed clustering model → they should view a cluster graph on the right and a list chart on the left of the screen", () => {
    nextToPredictionDetail(testClusteringItem.name, "Clustering");

    cy.get('div[aria-label="predictionInsightId"]').then($wrapper => {
      cy.wrap($wrapper).should("exist");

      cy.wrap($wrapper).within(() => {
        cy.contains(testClusteringItem.name).should(
          "have.css",
          "font-size",
          "20px"
        );

        cy.contains(testClusteringItem.description).should(
          "have.css",
          "font-size",
          "14px"
        );

        cy.get('div[aria-label="list-chart"]').should("exist");
        cy.get('div[aria-label="cluster-graph"]')
          .find('iframe[id="view"]')
          .as("clusterGraph");

        cy.get("@clusterGraph")
          .its("0.contentDocument")
          .its("body")
          .should("not.be.undefined");
        cy.get("@clusterGraph").should("exist");
      });
    });
  });

  it("When a user → is in the model insights page of a completed clustering model  → Clicks on features → the user is displayed a partial dependence chart for all the clusters", () => {
    nextToPredictionDetail(testClusteringItem.name, "Clustering");

    getPredictionTab2();

    cy.url().should(
      "include",
      route.predictions + "/" + predictionIdTest + "?tab=2"
    );

    cy.get('div[aria-label="modelTypeTab"]').within(() => {
      cy.get("div[aria-label='select an option']")
        .first()
        .then($wrapper => {
          cy.wrap($wrapper).should("exist");

          cy.wrap($wrapper)
            .get(
              `div[aria-label="Select ${clusterInsight.featureImpacts[1].featureName}"]`
            )
            .first()
            .click({ force: true });

          cy.wrap($wrapper)
            .find(
              `input[value="${clusterInsight.featureImpacts[1].featureName}"]`
            )
            .should("be.checked");
          cy.wait(200);

          cy.wrap($wrapper)
            .get(
              `div[aria-label="Select ${clusterInsight.featureImpacts[0].featureName}"]`
            )
            .first()
            .click({ force: true });

          cy.wrap($wrapper)
            .find(
              `input[value="${clusterInsight.featureImpacts[0].featureName}"]`
            )
            .should("be.checked");

          cy.wait("@predictionEffects");

          cy.contains("Partial Dependence")
            .parent()
            .next()
            .next()
            .as("partialDependenceChart");

          cy.get("@partialDependenceChart")
            .its("0.contentDocument.body")
            .should("not.be.empty");

          cy.get("@partialDependenceChart").should("exist");

          cy.frameLoaded(`@partialDependenceChart`).then(iframe => {
            const chartWrapper =
              iframe[0].contentDocument.body.querySelector("#main");
            expect(chartWrapper).to.be.exist;
          });
        });
    });
  });

  it("When the user → creates a cluster prediction → goes to the prediction that they made → clicks on datasets → the dataset from the prediction shows up in the iframe", () => {
    nextToPredictionDetail(testClusteringItem.name, "Clustering");

    cy.get('div[aria-label="predictionTab-0"]').last().click();

    cy.contains("Prediction Dataset").should("have.css", "font-size", "20px");

    cy.get(
      `iframe#dataset-${clusteringDetail.prediction.metabaseQuestionId}`
    ).as("metabaseDataset");

    cy.get("@metabaseDataset")
      .its("0.contentDocument.body")
      .should("not.be.empty");

    cy.get("@metabaseDataset").should("exist");

    cy.frameLoaded(`@metabaseDataset`);

    cy.enter(`@metabaseDataset`).then(iframe => {
      nextToIframeDetail();

      iframe().find("canvas").should("exist");
      iframe()
        .find('textarea[data-testid="saved-question-header-title"]')
        .should("have.css", "font-size", "20px");
    });
  });

  it("[Gemini][Cluster] When a user → is in the model insights page of a completed clustering model → The ‘model type’ in the bottom left box is labeled as cluster", () => {
    nextToPredictionDetail(testClusteringItem.name, "Clustering");

    checkModalType("Clustering");
  });

  it("[Cluster] When the user → creates a clustering prediction → goes to the prediction that they made → clicks on datasets → the dataset is displayed → explore results → save datasets → choose name as ‘test cluster dataset’ → save question to personal collection → go to data explorer → saved questions → personal collection → ‘test cluster dataset’ should exist", () => {
    nextToPredictionDetail(testClusteringItem.name, "Clustering");

    testNameDataSet(
      "test cluster dataset",
      clusteringDetail.prediction.metabaseQuestionId
    );
  });

  it("When a user → is in the model insights page of a completed clustering model → Clicks on clusters → chooses random features from the list on the left → the spider chart dynamically changes to include the selected features", () => {
    nextToPredictionDetail(testClusteringItem.name, "Clustering");

    getPredictionTab2();
    cy.get("div[aria-label='select an option']").last().as("container");
    cy.get("@container")
      .children()
      .children()
      .children()
      .should("have.length.gt", 2)
      .as("items");

    cy.get("@items").each((item, idx, arr) => {
      const valid = () => idx > 0 && idx < 4;
      if (valid()) {
        const featureNames = [];

        cy.wrap(item).find("label").click();

        cy.contains("div", "Top Impactful Features")
          .should("exist")
          .as("chartCardTitle");

        cy.get("@chartCardTitle")
          .parent()
          .next()
          .next("iframe")
          .should("exist")
          .as("iframe");

        cy.get("@container")
          .children()
          .children()
          .within(elements => {
            cy.wrap(elements)
              .get("label svg")
              .should("have.length.gt", 0)
              .then(svgs => {
                svgs.each(idx => {
                  cy.wrap(svgs)
                    .eq(idx)
                    .parent()
                    .invoke("attr", "aria-label")
                    .then(name => {
                      featureNames.push(name.substring(7));
                    });
                });
              })
              .then(() => {
                const clusterInsights = [];
                featureNames.forEach(name => {
                  const item = clusterInsight.clusterInsights.find(
                    it => it.featureName === name
                  );
                  clusterInsights.push(item);
                });

                cy.get("@iframe")
                  .its("0.contentDocument.body")
                  .should("not.be.empty");

                cy.frameLoaded("@iframe").then(iframe => {
                  cy.wrap(iframe)
                    .its("0.contentWindow")
                    .then(contentWindow => {
                      expect(contentWindow).to.not.null;
                      const echarts = contentWindow.echarts;
                      const chartWrapper =
                        iframe[0].contentDocument.body.querySelector("#main");

                      const chartProps =
                        echarts?.getInstanceByDom(chartWrapper);
                      chartProps
                        ?.getOption()
                        .series[0].data.forEach(cluster => {
                          const item = clusterInsights.find(it =>
                            cluster.value.includes(it.statistic)
                          );
                          if (item)
                            expect(cluster.value).to.includes(item.statistic);
                        });
                    });
                });
              });
          });
      }
    });
  });

  it("[Gemini][Cluster]  When a user → is in the predictions insight of a completed clustering model → hovers over the likelihood bar on the right hand side of the prediction list → The likelihood estimation of each cluster opens up", () => {
    const clusterDataTest = clusterDataInsight.items[0];

    nextToPredictionDetail(testClusteringItem.name, "Clustering");

    cy.get('div[aria-label="predictionInsightId"]').then($wrapper => {
      cy.wrap($wrapper).should("exist");

      cy.wrap($wrapper).within(() => {
        cy.get('div[aria-label="list-chart"]').should("exist");
        cy.get('div[aria-label="cluster-graph"]')
          .find('iframe[id="view"]')
          .as("clusterGraph");

        cy.get(
          `div[aria-label=cluster-item-${clusterDataTest.clusterInsightId}]`
        ).as("firstItem");

        cy.get("@firstItem")
          .contains(clusterDataTest.jsonData.TOTAL_FIELD_GOALS_MADE)
          .should("exist");
        cy.get("@firstItem")
          .contains(clusterDataTest.jsonData.PREDICTION)
          .should("exist");

        cy.get("@firstItem").within(() => {
          cy.get("div[aria-label='cluster-point-1']")
            .should("exist")
            .click({ force: true });
        });
      });
      cy.get('div[aria-label="Details"]').should("exist");
      cy.get('div[aria-label="Details"]')
        .contains(
          (clusterDataTest.jsonData.Cluster_1_PREDICTION * 100).toFixed(0)
        )
        .should("exist");
      cy.get('div[aria-label="Details"]')
        .contains(
          (clusterDataTest.jsonData.Cluster_2_PREDICTION * 100).toFixed(0)
        )
        .should("exist");
      cy.get('div[aria-label="Details"]')
        .contains(
          (clusterDataTest.jsonData.Cluster_3_PREDICTION * 100).toFixed(0)
        )
        .should("exist");
    });
  });
});
