import { faker } from "@faker-js/faker";

import { slowCypressDown } from "cypress-slow-down";
import { watchSyncEffect } from "vue";
slowCypressDown(200);
import localForage from "localforage";

describe("App Walkthrough", () => {
  before(() => {
    cy.clearAllLocalStorage();
    // cy.visit("/");
  });
  beforeEach(() => {
    cy.restoreLocalStorage();
    localForage.clear();
    cy.login("admin.azusa@mailinator.com", "admin.azusa.123");
  });

  afterEach(() => {
    cy.saveLocalStorage();
    localForage.clear();
  });

  it("Random Navigate the Space Tree", () => {
    // cy.visit("/space/list", { timeout: 10000 });
    let i = 0;
    let nodeName = "";
    let nodeType = "";
    slowCypressDown(200);

    for (i = 0; i < 5; i++) {
      cy.get("span.node-text").then((elems) => {
        if (Math.floor(Math.random() * 10) % 2 == 0) {
          cy.get("span.node-text")
            .last()
            .click({ force: true })
            .then((elem) => {
              nodeName = elem.text().split(/(-Section|-Facility|-Space])/)[0];
              nodeType = elem.text().split("-").pop() || "";
            });
        } else {
          cy.get("span.node-text")
            .eq(Math.floor(Math.random() * elems.length))
            .click({ force: true })
            .then((elem) => {
              nodeName = elem.text().split(/(-Section|-Facility|-Space])/)[0];
              nodeType = elem.text().split("-").pop() || "";
            });
        }
        cy.log("=========== Navigating Space Tree ===========")
      });
      slowCypressDown(10);
      // cy.get('[data-cy="space-table-wrapper"]').within((main) => {
        // cy.get(".tree-node-name").contains(nodeName.split("-Space")[0]);
        // cy.get(".table-space-name")
        // let buttons = Array<string>();
        // console.log(nodeType);
        // if (nodeType == "Section") {
        //   buttons = [
        //     "Add Section",
        //     "Add Facility",
        //     "Current Section Setting",
        //     "Sections and Facilities on the Section",
        //   ];
        // } else if (nodeType == "Facility") {
        //   buttons = ["Add Section", "Current Facility Setting"];
        // } else if (nodeType.trim() == "Space") {
        //   buttons = ["Enter the Space"];
        // }

        // buttons.forEach((button) => {
        //   cy.contains(button);
        // });

        // if (nodeType == "Section") {
          cy.get('[data-cy="add-facility-btn"]', { timeout: 10000 }).click({ force: true });
            cy.get('[data-cy="space-unit-modal"]').within(() => {
              cy.log("=========== Creating Facility with Users ===========")
              cy.get("input").eq(0).type(faker.company.name());

            for (i=0;i<5;i++) {
              cy.get("input").eq(1).type(faker.internet.email());
              cy.get("button").contains("Add to temporary list").click();
            }


            cy.get("button").contains("Save").click();
            cy.log("=========== Successfully Created Facility with Users ===========")
          });

          cy.get('[data-cy="add-section-btn"]', { timeout: 10000 }).click({ force: true });
            cy.log("=========== Creating Facility with Users ===========")
            cy.get('[data-cy="space-unit-modal"]').within(() => {
            cy.get("input").eq(0).type(faker.company.name());

            for (i=0;i<5;i++) {
            cy.get("input").eq(1).type(faker.internet.email());
            cy.get("button").contains("Add to temporary list").click();
            }

            cy.get("button").contains("Save").click();
            cy.log("=========== Successfully Created Section with Users ===========")
          });

         


        // }
      // });
    }
  });
});
