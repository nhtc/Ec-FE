export const nextToPredictionDetail = (name, type) => {
  cy.get('div[aria-label="complete"]')
    .contains(name)
    .then($item => {
      cy.wrap($item).should("exist");
      cy.wrap($item).click({ force: true });
    });

  cy.wait("@predictionDetail");

  cy.wait("@type");

  cy.wait("@predictionInsightDetail");

  cy.wait("@predictionInsight", { timeout: 30000 });

  if ((type && type === "Regression") || type === "Clustering") {
    cy.wait("@predictionEffects");
  }
};

export const interceptBinaryApi = predictionIdBinaryTest => {
  cy.intercept(`**/status/${predictionIdBinaryTest}`, {
    fixture: "classification-binary-detail",
  }).as("predictionDetail");
  cy.intercept(
    `**/binary/insights?predictionId=${predictionIdBinaryTest}&includeData=true`,
    { fixture: "classification-binary-insight-detail" }
  ).as("predictionInsightDetail");
  cy.intercept(`**/insights`, {
    fixture: "classification-binary-insight",
  }).as("predictionInsight");

  cy.intercept(`**/${predictionIdBinaryTest}/model/type`, {
    fixture: "classification-binary-type",
  }).as("type");
};

export const interceptDatasetApi = () => {
  cy.intercept("GET", "**/collection/*").as("collectionDetail");
  cy.intercept("GET", "**/collection?namespace=snippets").as(
    "collectionSnippets"
  );
  cy.intercept("GET", "**/database").as("database");
  cy.intercept("GET", "**/native-query-snippet").as("nativeQuery");

  cy.intercept("GET", "**/query_metadata").as("metadata");

  cy.intercept("GET", "**/database").as("datasetDatabase");

  cy.intercept("POST", "**/dataset").as("datasetDetail");

  cy.intercept("GET", "**/collection").as("datasetCollection");
};

export const nextToIframeDetail = () => {
  cy.wait("@collectionDetail");
  cy.wait("@collectionSnippets");
  cy.wait("@nativeQuery");
  cy.wait("@database");
};

export const getPredictionTab2 = () => {
  cy.get('div[aria-label="predictionTab-2"]').then(modelTab => {
    const wrapper = cy.wrap(modelTab);

    wrapper.should("exist");

    wrapper.click();
  });
};

export const checkValueChartChangeTab2Regression = selectedItem => {
  let currentData;

  cy.document().then(doc => {
    const firstMetricBlock = doc.querySelector('[aria-label="metricItemData"]');

    currentData = firstMetricBlock.textContent;
  });

  cy.get('select[aria-label="Choose Metric"]').then(selectOption => {
    const wrapper = cy.wrap(selectOption);

    wrapper.should("exist");

    wrapper.select(selectedItem);

    cy.get('div[aria-label="metricItemData"]')
      .eq(0)
      .invoke("text")
      .should("not.equal", currentData);
  });
};

export const checkModalType = type => {
  getPredictionTab2();

  cy.get('div[aria-label="modelTypeTab"').then(modelTypeTab => {
    const wrapper = cy.wrap(modelTypeTab);

    wrapper.should("exist");

    const criteria = wrapper.find('div[aria-label="criteria-ModelType"]');

    criteria.should("exist");

    criteria.should("contain.text", "Model Type");

    criteria.should("contain.text", type);
  });
};

export const testNameDataSet = (name, metabaseQuestionId) => {
  // save dataset spy
  cy.intercept("POST", "**/card").as("saveCardDataset");

  cy.get('div[aria-label="predictionTab-0"]').then(modelTab => {
    const wrapper = cy.wrap(modelTab);

    wrapper.should("exist");

    wrapper.contains("Dataset").click();

    cy.get(`iframe#dataset-${metabaseQuestionId}`).as("iframe");

    cy.get("@iframe").should("exist");

    cy.frameLoaded("@iframe");

    cy.enter("@iframe").then(getBody => {
      // wait for api response
      nextToIframeDetail();

      getBody()
        .find("button")
        .contains("Explore results")
        .then($btn => {
          cy.wrap($btn).should("exist");

          cy.wrap($btn).click();
        });

      cy.wait("@metadata");

      cy.wait("@datasetDatabase");

      cy.wait("@datasetDetail");

      getBody()
        .find("a")
        .contains("Save")
        .then($btn => {
          cy.wrap($btn).should("exist");

          cy.wrap($btn).click();

          cy.wait("@datasetCollection");
        });

      getBody()
        .find(".ModalContainer")
        .then($modalWrapper => {
          cy.wrap($modalWrapper).should("exist");

          cy.wrap($modalWrapper).find('input[name="name"]').clear().type(name);

          cy.wrap($modalWrapper)
            .find('button[type="submit"]')
            .contains("Save")
            .click();

          cy.wait("@saveCardDataset");

          cy.wrap($modalWrapper).find("button").contains("Not now").click();
        });
    });
  });

  // explorer step
  cy.get(`a[href="/datasets"]`).click({ force: true });
  cy.get(`button`).contains("Add Dataset").click({ force: true });
  cy.get("iframe[sandbox='allow-same-origin allow-scripts allow-forms']")
    .eq(0)
    .as("iframe");
  cy.enter(`@iframe`).then(getBody => {
    cy.intercept("GET", "**/search*").as("datasetSearch");

    cy.intercept("GET", "**/database?saved=true").as("datasetDB");

    cy.intercept("GET", "**/schema/**").as("datasetSchemaList");

    cy.wait("@datasetSearch");

    cy.wait("@datasetDB");

    getBody()
      .find("div.List-section")
      .should("exist")
      .contains("Saved Questions")
      .click();

    cy.wait("@datasetSchemaList");
    getBody()
      .find('div[data-testid="option-text"]')
      .contains(name)
      .should("exist");
  });
};

export const handleClickDataPlayer = (dataInsightDetail, isBinary = false) => {
  cy.get('div[aria-label="predictionInsightId"]').within(() => {
    cy.get('div[aria-label="select an option"]').as("tableData");
    const defaultChecked = dataInsightDetail.items[0].dataLabel;
    const playerName = dataInsightDetail.items[1].dataLabel;
    const targetVar = dataInsightDetail.items[1].targetVariable;
    const predictionLabel = isBinary
      ? dataInsightDetail.items[1].trueProb?.toString()?.substring(0, 3)
      : dataInsightDetail.items[1].predictionLabel?.substring(0, 3);
    const playerStatistic = [
      dataInsightDetail.items[1].jsonData.EXPLANATION_1_ACTUAL_VALUE,
      dataInsightDetail.items[1].jsonData.EXPLANATION_2_ACTUAL_VALUE,
      dataInsightDetail.items[1].jsonData.EXPLANATION_3_ACTUAL_VALUE,
      dataInsightDetail.items[1].jsonData.EXPLANATION_4_ACTUAL_VALUE,
      dataInsightDetail.items[1].jsonData.EXPLANATION_5_ACTUAL_VALUE,
    ];
    cy.get("@tableData").then(element => {
      cy.wrap(element).should("exist");
      cy.wrap(element)
        .get(`div[aria-label="Select ${defaultChecked}"]`)
        .should("exist");
      cy.wrap(element)
        .get(`div[aria-label='Select ${defaultChecked}']`)
        .click(); // uncheck default

      cy.wrap(element)
        .get(`div[aria-label='Select ${playerName}']`)
        .should("exist");
      cy.wrap(element).get(`div[aria-label='Select ${playerName}']`).click(); // check second player
    });

    cy.get("iframe").eq(0).as("firstIframe");
    cy.get("iframe").eq(1).as("secondIframe");

    cy.get("@firstIframe").should("exist");
    cy.get("@secondIframe").should("exist");

    // Get the iframe element
    cy.get("@firstIframe")
      .its("0.contentDocument")
      .its("body")
      .find('circle[r="8"]')
      .should("have.length", 1) //one big circle for checked  player
      .click();

    cy.get("@firstIframe")
      .its("0.contentDocument")
      .its("body")
      .find("div#tooltip")
      .contains(targetVar)
      .contains(predictionLabel);

    cy.frameLoaded(`@secondIframe`);
    cy.enter(`@secondIframe`).then(iframe => {
      iframe().find("canvas").should("exist");
      cy.document().then(doc => {
        const wrapper = doc.querySelector(
          'div[aria-label="predictionInsightId"]'
        );
        const a = wrapper.querySelector("iframe#view");
        const iframeDocument = a.contentDocument || a.contentWindow.document;
        expect(iframeDocument).to.not.null;
        const body = iframeDocument.body;
        if (body) {
          const main = body.querySelector("#main");

          const instance = a.contentWindow.echarts.getInstanceByDom(main);
          const option = instance.getOption();
          const series = option?.series[0];
          const idx = isBinary ? 0 : 1;
          const data = series.data[idx];
          expect(data.name).to.eq(playerName);
          data.value?.forEach(v => {
            if (v) {
              cy.wrap(playerStatistic).should("include", v)
            }
          })
        }
      });
    });
  });
};
