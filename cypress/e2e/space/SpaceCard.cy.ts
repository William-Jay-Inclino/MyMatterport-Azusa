/// <reference types="Cypress" />
import { faker } from "@faker-js/faker";
import localForage from "localforage";

describe("Space Card", () => {
  beforeEach(() => {
    localForage.clear()
  });

  it("Visits SpaceCard View", () => {
    let cardName = "";
    let cardType = "";

    for (let i = 0; i < 3; i++) {
      cy.login("admin.azusa@mailinator.com", "admin.azusa.123");
      cy.log("===========Navigating via Card View===========");

      cy.get('[data-cy="space-title"]', { timeout: 6000 });
      // Sets to Card View
      cy.get('[data-cy="card-view"]').click({ force: true });
      cy.log("===========SpaceList in Card View===========");

      cy.get('[data-cy="card-item"]').then((card) => {
        cy.get('[data-cy="card-item"]')
          .eq(Math.floor(Math.random() * card.length))
          .click()
          .then((card) => {
            cardName = card.text();
            cardType = card.text().split("-").pop() || "";
          });
        localForage.clear();
      });
    }
  });
});
