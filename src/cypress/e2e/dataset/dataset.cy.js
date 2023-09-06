import dsDatabase from "../../fixtures/dataset-database.json";
import datasetFiltered from "../../fixtures/dataset-filtered.json";
import dsSchemaDetail from "../../fixtures/dataset-schemas-detail.json";
import dsSchemas from "../../fixtures/dataset-schemas.json";
import dataset from "../../fixtures/dataset.json";
import route from "../../fixtures/route.json";

const firstDatasetId = dataset.data[0].id;
const firstDatasetName = dataset.data[0].name;
const secondDatasetName = dataset.data[1].name;
const firstDsDatabaseDisplayName = dsSchemaDetail[0].display_name;

function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function createSchemaStr(string) {
  const formattedName = string.split("_");
  for (let i = 0; i < formattedName.length; i++) {
    formattedName[i] = capitalizeFirstLetter(formattedName[i].toLowerCase());
  }

  return formattedName.join(" ");
}

function clickDatasetAndLoadMetadata(datasetId) {
  cy.wait("@dataset");
  cy.contains(firstDatasetName).should("exist");
  cy.contains(secondDatasetName).should("exist");
  cy.contains(firstDatasetName).click();
  cy.url().should("include", datasetId);
  cy.get(`iframe#dataset-${datasetId}`).as("iframe");
  cy.get("@iframe").should("exist");
  cy.frameLoaded(`#dataset-${datasetId}`);
  cy.wait("@metadata");
  cy.wait("@queryDetail");
}

function navigateToDataExplorer() {
  cy.get("@addDatasetBtn").click();
  cy.url().should("include", route.explorer);
  cy.get("iframe").as("pickDataIframe");
  cy.get("@pickDataIframe")
    .its("0.contentDocument")
    .its("body")
    .should("not.be.empty");
  cy.get("@pickDataIframe").should("exist");
  cy.frameLoaded("@pickDataIframe");

  return cy.enter(`@pickDataIframe`).then(getBody => cy.wrap(getBody));
}

function selectDatasetAndSchema(index) {
  return navigateToDataExplorer().then(getBody => {
    cy.intercept("GET", `**/${dsSchemas[0]}`, {
      fixture: "dataset-schemas-detail",
    }).as("schemaDetail");

    cy.intercept("GET", "**/query_metadata", {
      fixture: "dataset-schemas-detail-metadata",
    }).as("schemaDetailMetadata");

    cy.intercept("POST", "**/dataset", {
      fixture: "dataset-schemas-detail-ds",
    }).as("schemaDetailDataset");

    cy.wait("@dataExplorerSearch");
    cy.wait("@datasetDatabase");

    getBody().find(".List-section").should("exist");
    const selectedDatasetName = dsDatabase.data[index].name;
    getBody().contains(selectedDatasetName).click();

    cy.wait("@datasetSchema");
    dsSchemas.forEach(each => {
      const schema = createSchemaStr(each);
      getBody().find(".List-section").contains(schema).should("exist");
    });
    const schema = createSchemaStr(dsSchemas[0]);
    getBody().find(".List-section").contains(schema).click();
    cy.wait("@schemaDetail");

    return cy.wrap(getBody);
  });
}

describe("Testing dataset", () => {
  beforeEach(() => {
    cy.login();
    cy.get(`a[href="/datasets"]`).click();
    cy.intercept("GET", "**/items*", { fixture: "dataset" }).as("dataset");
    cy.intercept("GET", "**/query_metadata", { fixture: "query-metadata" }).as(
      "metadata"
    );
    cy.intercept("POST", "**/query", { fixture: "ds-query-detail" }).as(
      "queryDetail"
    );
    cy.intercept("GET", "**/search*", { fixture: "dataset-search" }).as(
      "dataExplorerSearch"
    );
    cy.intercept("GET", "**/database?saved=true", {
      fixture: "dataset-database",
    }).as("datasetDatabase");
    cy.intercept("GET", "**/schemas", { fixture: "dataset-schemas" }).as(
      "datasetSchema"
    );

    cy.get("h1")
      .contains("Datasets")
      .parent()
      .next()
      .find("button")
      .as("addDatasetBtn");
    cy.get("@addDatasetBtn").should("exist");
  });

  it("When a user clicks on a dataset that is functioning, the data explorer opens and the dataset is displayed", () => {
    clickDatasetAndLoadMetadata(firstDatasetId);
    cy.enter(`#dataset-${firstDatasetId}`).then(getBody => {
      getBody().contains(firstDatasetName).should("exist");

      // 1552 is total rows from spy api, it have transformation so I have to hard code here
      getBody().contains("Showing 1,552 rows").should("exist");
    });
  });

  it("When the user clicks on the + button on the top right, data explorer is opened to a search bar with a drop down of different options to create a dataset", () => {
    navigateToDataExplorer().then(getBody => {
      cy.wait("@dataExplorerSearch");
      cy.wait("@datasetDatabase");
      getBody().find(".List-section").should("exist");
      dsDatabase.data.forEach(each => {
        getBody().contains(each.name).should("exist");
      });
    });
  });

  it("If the user applies a filter to the dataset in data explorer, the table only show’s the filtered elements", () => {
    cy.intercept("POST", "**/dataset", { fixture: "dataset-filtered" }).as(
      "filteredCall"
    );

    clickDatasetAndLoadMetadata(firstDatasetId);

    cy.enter(`#dataset-${firstDatasetId}`).then(getBody => {
      getBody().contains(firstDatasetName).should("exist");

      // 1552 is total rows from spy api, it have transformation so I have to hard code here
      getBody().contains("Showing 1,552 rows").should("exist");

      getBody().find("button").contains("Filter").click();

      getBody().find(".ModalContainer").as("modalContainer");

      cy.get("@modalContainer").should("exist");

      // apply filter for DS
      cy.get("@modalContainer")
        .find('div[data-testId="filter-field-Spot Fifteen Corner Left"]')
        .contains("0-5", { timeout: 10000 })
        .as("checkbox");

      cy.get("@modalContainer")
        .find('button[data-testid="apply-filters"]')
        .as("applyFilterBtn");

      cy.get("@checkbox").click({ timeout: 10000 });

      cy.get("@applyFilterBtn").click();

      cy.get("@modalContainer").should("not.exist");

      cy.wait("@filteredCall");

      // apply filter and check the result
      getBody()
        .contains(`Showing ${datasetFiltered.row_count} rows`)
        .should("exist");
    });
  });

  it("When the user clicks → datasets → + on the top right → chooses a dataset from the list → the dataset is displayed", () => {
    selectDatasetAndSchema(0).then(getBody => {
      const datasetDisplayName = firstDsDatabaseDisplayName;

      getBody().contains(datasetDisplayName).should("exist");
      getBody().find(".List-section").contains(datasetDisplayName).click();

      cy.wait("@schemaDetailMetadata");
      cy.wait("@schemaDetailDataset");

      getBody().contains(datasetDisplayName).should("exist");
      getBody().contains(`Showing first 2,000 rows`).should("exist");
    });
  });

  it("When the user clicks → datasets → + on the top right → chooses a dataset from the list → the dataset is displayed → save datasets → choose name as ‘test dataset’ → save question to personal collection → go to data explorer → saved questions → personal collection → ‘test dataset’ should exist", () => {
    cy.intercept("POST", "**/card").as("card");

    cy.intercept("GET", "**/items?models=dashboard", {
      fixture: "dataset-dashboard",
    }).as("dashboardFolder");

    selectDatasetAndSchema(0).then(getBody => {
      getBody()
        .find(".List-section")
        .contains(firstDsDatabaseDisplayName)
        .click();

      cy.wait("@schemaDetailMetadata");
      cy.wait("@schemaDetailDataset");

      getBody().find("a").contains("Save").click();

      getBody()
        .find(".ModalContainer")
        .then($modalWrapper => {
          cy.wrap($modalWrapper).should("exist");

          cy.wrap($modalWrapper)
            .find('input[name="name"]')
            .clear()
            .type("test dataset");

          cy.wrap($modalWrapper)
            .find('button[type="submit"]')
            .contains("Save")
            .click();

          cy.wait("@card");

          cy.wrap($modalWrapper).find("button").contains("Yes please!").click();

          cy.wrap($modalWrapper).contains("My personal collection").click();

          cy.wait("@dashboardFolder");

          cy.wrap($modalWrapper).contains("Test data set").click();
        });

      getBody().find("div").contains("Save").click();
    });

    // check create data correct
    cy.reload();
    cy.frameLoaded("@pickDataIframe");
    cy.enter(`@pickDataIframe`).then(getBody => {
      cy.intercept("GET", "**/tree*", { fixture: "dataset-saved-tree" }).as(
        "tree"
      );

      cy.intercept("GET", "**/schema/**", {
        fixture: "dataset-saved-detail",
      }).as("treeDetail");

      cy.wait("@dataExplorerSearch");

      cy.wait("@datasetDatabase");

      getBody().find(".List-section").contains("Saved Questions").click();

      cy.wait("@tree");

      cy.wait("@treeDetail");

      getBody()
        .find('div[data-testid="option-text"]')
        .contains("test dataset")
        .should("exist");
    });
  });
});
