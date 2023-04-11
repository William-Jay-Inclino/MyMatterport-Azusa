import { faker } from "@faker-js/faker";

import { slowCypressDown } from "cypress-slow-down";
import { callWithAsyncErrorHandling } from "vue";
slowCypressDown(200);
import localForage from "localforage";

describe("Navigate Application Home", () => {
  before(() => {
    cy.clearAllLocalStorage();
    // cy.visit("/");
  });
  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
    localForage.clear();
  });

  let username = "";
  it("Visit Home", () => {
    // cy.login("admin.azusa@mailinator.com", "admin.azusa.123");
    // cy.visit("/");
    cy.visit("/space/list")
    cy.log("===========Visits Home Page===========")
  });

  // it("Visit User List", () => {
    // cy.visit("/users");
    // cy.get("td")
    //   .contains("@")
    //   .then((elem) => {
    //     console.log(elem.text());
    //     username = elem.text();
    //   });

    // cy.login(username, "password");
  //   cy.get('[data-cy="visit-user-list"]').click({ force: true });
  // });

  it("Visit User Login", () => {
    cy.visit("/space/list", { timeout: 10000 });

    // fail
    let i = 0;
    for (i = 0; i < 2; i++) {
      cy.get('[data-cy="login-input"]').clear().type(faker.internet.email());
      cy.get('[data-cy="password-input"]').clear().type(faker.internet.password());
      cy.get('[data-cy="login-button"]').click();
      cy.log("===========Unsuccessful User Login===========")
    }

    // success
    // cy.get("#username").clear().type(username);
    // cy.get("#password").clear().type("password");
    cy.login("admin.azusa@mailinator.com", "admin.azusa.123");
    cy.log("===========Successful User Login===========")
    cy.get('[data-cy="profile-setting-menu"]').click({ force: true });
    cy.get(".container").contains("Edit Profile");
  });

  // it("Visit User Profile", () => {
  //   cy.visit("/user/profile");
  //   cy.get(".container").contains("Edit Profile");
  // });

  it("Visit User List", () => {
    cy.login("admin.azusa@mailinator.com", "admin.azusa.123");
    // cy.visit("/users");
    // cy.get("td")
    //   .contains("@")
    //   .then((elem) => {
    //     console.log(elem.text());
    //     username = elem.text();
    //   });
    cy.get('[data-cy="visit-user-list"]').click({ force: true });
    cy.log("===========Successful Visit to User List===========")
  });

  it("Logout User", () => {
    cy.login("admin.azusa@mailinator.com", "admin.azusa.123");
    // cy.get(".menu-item-text").contains("Logout").parent().click();
    // cy.get(".menu-item-text").contains("Logout").click();
    cy.get('[data-cy="logout-user"]').click({ force: true })
    cy.log("===========User Successfully Logs Out===========")
  });
});
