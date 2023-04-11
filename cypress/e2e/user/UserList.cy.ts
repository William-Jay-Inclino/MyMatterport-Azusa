/// <reference types="Cypress" />
import { faker } from "@faker-js/faker";
import "cypress-localstorage-commands";
import localForage from "localforage";

describe("Userlist Automation", () => {
  const randomNum = Math.floor(Math.random() * 10) + 1;
  let selectedUser = "";
  
  before(() => {
    localForage.clear();
  })

  // restores the url from last saved url
  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.login("admin.azusa@mailinator.com", "admin.azusa.123");
    // cy.login("admin.azusa@mailinator.com", "admin.azusa.123");
  });

  // saves the url after it()
  afterEach(() => {
    cy.saveLocalStorage();
    localForage.clear();
  });

  it("Adds User", () => {
    cy.log("===========Adding Admin Users===========")
    cy.get('[data-cy="visit-user-list"]', { timeout: 10000 }).click({ force: true });

    for (let i = 0; i < randomNum; i++) {
      cy.get('[data-cy="add-admin-user"]').click();
      cy.get(".admin-modal").should("be.visible");
      const email = faker.internet.email();
      cy.get('[data-cy="admin-email-input"]').type(email);
      cy.get('[data-cy="add-admin"]').click();
      cy.get('[data-cy="confirm-add-admin"]').click();
      cy.log("Successfully Added User with email of ", email)
    }
  });

  it("Add Incorrect Admin Email", () => {
    cy.visit("/space/list");
    cy.log("===========Attempt to add User with Incorrect Email Format===========")
    cy.get('[data-cy="visit-user-list"]', { timeout: 10000 }).click({ force: true });
    cy.get('[data-cy="add-admin-user"]').click();
    cy.get(".admin-modal").should("be.visible");
    for (let i = 0; i < randomNum; i++) {
      const input_email = faker.name.firstName();
      cy.get('[data-cy="admin-email-input"]').type(input_email);
      cy.get(".modal-card-head").click();
      cy.log("Incorrect Input Email", input_email)
      cy.get('[data-cy="admin-email-input"]').clear();
    }
    cy.get('[data-cy="cancel-add-admin"]').click({ force: true });
  });

  it("Deletes Users", () => {
    cy.visit("/space/list", { timeout: 10000 });
    cy.log("===========Deletes selected Users===========")
    cy.get('[data-cy="visit-user-list"]').click({ force: true });
      for (let i = 0; i < 3; i++){
        cy.get('[data-cy="table-user-name"]').then((user) => {
          cy.get('.b-checkbox > .check')
            .eq(Math.floor(Math.random() * user.length) + 2)
            .check()
            .then((checkedUser) => {
              selectedUser = checkedUser.text();
              cy.log("Selected User to delete", selectedUser);
            })
        })
        cy.get('[data-cy="table-user-name"]').then((user) => {
          cy.get('.b-checkbox > .check')
            .eq(Math.floor(Math.random() * user.length) + 3)
            .check()
            .then((checkedUser) => {
              selectedUser = checkedUser.text();
              cy.log("Selected User to delete", selectedUser);
            })
        })
        cy.get('[data-cy="table-user-name"]').then((user) => {
          cy.get('.b-checkbox > .check')
            .eq(Math.floor(Math.random() * user.length) + 4)
            .check()
            .then((checkedUser) => {
              selectedUser = checkedUser.text();
              cy.log("Selected User to delete", selectedUser);
            })
        })
        cy.get('[data-cy="delete-users"]').click()
      }
  });

  it("Searches User by Name Unsuccessfully", () => {
    cy.visit("/space/list", { timeout: 10000 });
    cy.get('[data-cy="visit-user-list"]').click({ force: true });
    for (let i = 0; i < randomNum; i++){
      const searchUser = faker.name.firstName();
      cy.log("===========Searches User by Name===========")
      cy.get('[data-cy="select-search-user"]').should('be.visible').select("Name")
      cy.log("===========Input User to be Searched from List===========")
      cy.get('[data-cy="input-search-user"]').type(searchUser)
      cy.log("===========User Not Found==========")
      cy.get('[data-cy="input-search-user"]').clear
    }
  })

  it("Searches User by Name Successfully", () => {
    cy.visit("/space/list", { timeout: 10000 });
    cy.get('[data-cy="visit-user-list"]').click({ force: true });
    cy.log("===========Searches User by Name===========")
    cy.get('[data-cy="select-search-user"]').should('be.visible').select("Name")
    cy.log("===========Input User to be Searched from List===========")
    cy.get('[data-cy="input-search-user"]').type("admin")
    cy.log("===========User Found==========")
  })

  // it("Searches User by Company", () => {
  //   cy.visit("/space/list", { timeout: 10000 });
  //   cy.get('[data-cy="visit-user-list"]').click({ force: true });
  //   cy.log("===========Searches User by Name===========")
  //   cy.get('[data-cy="select-search-user"]').should('be.visible').select("Company")
  //   cy.log("===========Input User to be Searched from List===========")
  //   cy.get('[data-cy="input-search-user"]').type("RoK")
  //   cy.log("===========User Found==========")
  // })
});
