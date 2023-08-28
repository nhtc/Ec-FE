export const nextToPredictionDetail = (name, type) => {
  cy.get('div[aria-label="complete"]')
    .contains(name)
    .then($item => {
      cy.wrap($item).should("exist");
      cy.wrap($item).click({ force: true });
    });

  cy.wait("@getTasksComplete");

  cy.wait("@predictionDetail");

  cy.wait("@type");

  cy.wait("@info");

  cy.wait("@predictionInsightDetail");

  cy.wait("@predictionInsight", { timeout: 30000 });

  if ((type && type === "Regression") || type === "Clustering") {
    cy.wait("@predictionEffects");
  }
};

export const interceptDatasetApi = () => {
  cy.intercept("GET", "**/collection/*").as("collectionDetail");
  cy.intercept("GET", "**/collection?namespace=snippets").as(
    "collectionSnippets"
  );
  cy.intercept("GET", "**/database").as("database");
  cy.intercept("GET", "**/native-query-snippet").as("nativeQuery");
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

    wrapper.click({ force: true });
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
  // dataset apis
  cy.intercept("GET", "**/query_metadata").as("metadata");

  cy.intercept("GET", "**/database").as("datasetDatabase");

  cy.intercept("POST", "**/dataset").as("datasetDetail");

  cy.intercept("GET", "**/collection").as("datasetCollection");

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

      // explorer step
      cy.get(`a[href="/explorer"]`).click();

      cy.get("iframe").eq(0).as("iframe");

      cy.get("@iframe").should("exist");

      cy.frameLoaded("@iframe");

      cy.enter(`@iframe`).then(getBody => {
        cy.intercept("GET", "**/search*").as("datasetSearch");

        cy.intercept("GET", "**/database?saved=true").as("datasetDB");

        cy.intercept("GET", "**/schema/**").as("datasetSchemaList");

        cy.wait("@datasetSearch");

        cy.wait("@datasetDB");

        getBody().find(".List-section").should("exist");

        getBody().find(".List-section").contains("Saved Questions").click();

        cy.wait("@datasetSchemaList");
        getBody()
          .find('div[data-testid="option-text"]')
          .contains(name)
          .should("exist");
      });
    });
  });
};

