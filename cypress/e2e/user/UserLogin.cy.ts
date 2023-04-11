/// <reference types="Cypress" />
import { faker } from "@faker-js/faker";
import "cypress-localstorage-commands";
import localForage from "localforage";

describe("Userlist Automation", () => {
  before(() => {
    localForage.clear();
  })

  // restores the url from last saved url
  beforeEach(() => {
    cy.restoreLocalStorage();
    localForage.clear();
    // cy.visit("/user/login").viewport(1600, 900);
  });

  // saves the url after it()
  afterEach(() => {
    cy.saveLocalStorage();
  });

  it("Logs In User and Edit Profile", () => {
    cy.login("admin.azusa@mailinator.com", "admin.azusa.123");
    cy.get('[data-cy="profile-setting-menu"]').click({ force: true });

    const last_name = faker.name.lastName();
    cy.get('[data-cy="last-name-input"]').type(last_name);

    // const first_name = faker.name.firstName();
    // cy.get('[data-cy="first-name-input"]').type(first_name);

    const company_name = faker.company.companyName();
    cy.get('[data-cy="company-name-input"]').type(company_name);

    cy.get('[data-cy="update-user"]').click({ force: true });
  });
});
