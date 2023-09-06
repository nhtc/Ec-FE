import route from "../../../fixtures/route.json";
import { nextToStep1 } from "../helper";

describe("Prediction Wizard Upload CSV tests", () => {
  beforeEach(() => {
    nextToStep1();
  });

  it("When clicking ‘select file’ in the prediction wizard step 1 the user is met with a popup that allows them to pick a file from their computer. Choosing the file leads to a loading screen and can’t move on until it’s finished.", () => {
    cy.nextAndHandleUploadCSV({
      file: "cypress/fixtures/Longevity_Multiclass_Classification.csv",
      onSuccess: () => {
        cy.get("button").contains("Uploading file").should("not.exist");
        cy.get('button[aria-label="next-btn"]').should("not.be.disabled");
      },
    });
  });

  it("When I choose a CSV file in the 'Prediction Wizard', a should get an error if the there are less than 625 rows in the CSV file", () => {
    cy.nextAndHandleUploadCSV({
      file: "cypress/fixtures/Longevity_Binary_Classification_Test_Less_625_rows.csv",
      onError: () => {
        cy.contains(
          "Error: Data validation issues were found, make sure your dataset conforms to the following: Minimum of 625 rows"
        ).should("exist");
      },
    });
  });

  it("When I choose a CSV file in the Prediction Wizard, if there are fewer than 3 columns and I chose a regression or classification model, I should get an error", () => {
    cy.nextAndHandleUploadCSV({
      file: "cypress/fixtures/Longevity_Regression_Test_Fewer_2_Columns.csv",
      onError: () => {
        cy.contains(
          "Unable to auto-detect delimiting character; defaulted to ','"
        ).should("exist");
      },
    });
  });

  it("When I choose a CSV file in the 'Prediction Wizard, if there are equal or more than 625 rows I should be met with a success message and allowed to continue.", () => {
    cy.nextAndHandleUploadCSV({
      file: "cypress/fixtures/Longevity_Multiclass_Classification.csv",
      onSuccess: () => {
        cy.contains("File uploaded successfully").should("exist");
        cy.get('button[aria-label="next-btn"]').should("not.be.disabled");
        cy.get('button:visible[aria-label="next-btn"]')
          .should("contain", "Step 2")
          .should("be.enabled")
          .click();
        cy.url().should("include", route.createPredictionStep2);
      },
    });
  });

  it("When the CSV upload is successful, the user gets a green success status bar", () => {
    cy.nextAndHandleUploadCSV({
      file: "cypress/fixtures/Longevity_Multiclass_Classification.csv",
      onSuccess: () => {
        cy.contains("File uploaded successfully").should("exist");
        cy.get('button[aria-label="next-btn"]').should("not.be.disabled");
        cy.get('div[aria-label="success-status-bar"]')
          .children()
          .should("have.css", "background-color")
          .and("eq", "rgb(187, 247, 208)");
      },
    });
  });

  it("Test time that it takes for the dataset to be uploaded. What is the maximum time it takes for the CSV upload to take place", () => {
    const start = Date.now();
    const maxUploadTime = 10000;

    cy.nextAndHandleUploadCSV({
      file: "cypress/fixtures/Longevity_Multiclass_Classification.csv",
      measureUploadStartTime: () => start,
      onSuccess: () => {
        cy.measureUploadTime(maxUploadTime, start).then(uploadTime => {
          if (uploadTime < maxUploadTime) {
            expect(uploadTime).to.be.lessThan(maxUploadTime);
          } else if (uploadTime > maxUploadTime) {
            expect(uploadTime).to.be.greaterThan(maxUploadTime);
          } else {
            expect(uploadTime).to.be.eq(maxUploadTime);
          }

          cy.log(`Dataset upload took ${uploadTime} ms`);
        });
      },
    });
  });
});
