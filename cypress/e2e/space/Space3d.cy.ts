///<reference types="cypress-iframe" />

import localForage from "localforage";
import { FOLDER_TYPE } from "../../../src/stores/types";

import { faker } from "@faker-js/faker";
import "cypress-iframe";
import { colors } from "../../../src/stores/config";

describe("Space 3d", () => {
  let nTagsAdd = 2;
  let nTagsEdit = 2;

  beforeEach(() => {
    // cy.viewport(1560, 850)
    localForage.clear();
  });

  it.skip("Should test space 3d Japanese", () => {
    faker.setLocale("ja");

    cy.visit("/");

    spaceListNavigation();

    // inside space 3d

    cy.frameLoaded("#mp-iframe"); // check if iframe is done loading

    cy.wait(15000); // wait till the matterport space is playing

    // editTag(1)
    filterCategoryTest(addTag, nTagsAdd);
    deleteTags(editTag, nTagsEdit);
  });

  it("Should test space 3d English", () => {
    faker.setLocale("en");

    cy.visit("/");
    cy.login("admin.azusa@mailinator.com", "admin.azusa.123");

    // cy.visit({
    //   url: "/",
    //   qs: {
    //     "lang": "en"
    //  }
    // })

    spaceListNavigation();

    // inside space 3d

    cy.frameLoaded("#mp-iframe"); // check if iframe is done loading

    cy.wait(15000); // wait till the matterport space is playing

    // filterCategoryTest(addTag, nTagsAdd)
    // deleteTags(editTag, nTagsEdit)

    addTag(3);
    filterCategoryTest(addTag, nTagsAdd);
    deleteTags(editTag, nTagsEdit);
  });
});

const editTag = (nTags: number) => {
  const positions = ["top", "left", "bottom"];

  let lastPos = 0;
  let indxPos = 0;

  cy.get('[data-cy="tag-list-table"]')
    .find('[data-cy="tag-item"]')
    .then(($elems) => {
      let nItems = $elems.length;

      while (nTags--) {
        let randIndx = Math.floor(Math.random() * nItems);
        cy.get('[data-cy="tag-list-table"]')
          .find('[data-cy="edit-tag-action"]')
          .eq(randIndx)
          .click();

        // check initial state
        cy.get(`[data-cy="relocate-icon-msg"]`).should("not.be.visible");
        cy.get(`[data-cy="category-item-msg"]`).should("not.be.visible");
        cy.get(`[data-cy="subcategory-item-msg"]`).should("not.be.visible");
        cy.get(`[data-cy="tag-name-input-msg"]`).should("not.be.visible");
        cy.get(`[data-cy="tag-desc-input-msg"]`).should("not.be.visible");
        cy.get(`[data-cy="invalid-url"]`).should("not.be.visible");
        cy.get(`[data-cy="embed-media-err"]`).should("not.be.visible");

        cy.get(`[data-cy="tag-category-select"]`).should("not.be.empty");
        cy.get(`[data-cy="subcategory-select"]`).should("not.be.empty");
        cy.get(`[data-cy="tag-name-input"]`)
          .invoke("val")
          .should("not.be.empty");
        cy.get(`[data-cy="tag-desc-input"]`)
          .invoke("val")
          .should("not.be.empty");
        cy.get(`[data-cy="relocate-icon"]`)
          .realClick()
          .then(() => {
            cy.enter().then((getBody) => {
              while (true) {
                // should have different positions of the last added tag
                indxPos = Math.floor(Math.random() * positions.length);
                if (indxPos !== lastPos) break;
              }
              lastPos = indxPos;

              getBody()
                // @ts-ignore
                .realHover({ position: positions[indxPos] }) // hover different locations inside the iframe
                .realClick()
                .then(() => {
                  cy.wait(3500); // navigating to tag

                  cy.get(`[data-cy="tag-category-select"]`).should(
                    "not.be.empty"
                  ); // should have category selected already
                  cy.get(`[data-cy="tag-form"]`)
                    .get(`[data-cy="subcategory-select"]`)
                    .get(`[data-cy="subcategory-item"]`)
                    .as("subcategory-items");
                  cy.get("@subcategory-items").then(($elems) => {
                    let nItems = $elems.length;

                    // expect(nItems).to.be.greaterThan(0)

                    cy.get("@subcategory-items")
                      .eq(Math.floor(Math.random() * nItems))
                      .click({ force: true });
                    cy.get(`[data-cy="tag-name-input"]`).clear();
                    cy.get(`[data-cy="tag-name-input"]`).type(
                      faker.name.firstName()
                    );
                    cy.get(`[data-cy="tag-desc-input"]`).clear();
                    cy.get(`[data-cy="tag-desc-input"]`).type(
                      faker.name.lastName()
                    );

                    cy.get(`[data-cy="update-tag-form-btn"]`).click();
                    getBody().realHover();
                    getBody().realClick(); // click again to close the tag; it will avoid bugs
                  });
                });
            });
          });

        cy.wait(1500);
      }
    });
};

const spaceListNavigation = () => {
  let spaceUnitName = "";
  let spaceUnit = "section";
  const showcaseUrls = [
    "https://my.matterport.com/show/?m=Msfg36od5J3",
    "https://my.matterport.com/show/?m=qSGGhhjTYbN",
  ];

  for (let i = 0; i < 3; i++) {
    if (i === 1) spaceUnit = "facility";
    else if (i === 2) spaceUnit = "space";

    cy.get(`[data-cy="add-${spaceUnit}-btn"]`).should("be.visible").click();

    spaceUnitName = inputValidSpaceUnitName();

    if (spaceUnit === "space") {
      inputValidSpaceShowcaseURL(showcaseUrls);
    }

    cy.get('[data-cy="save-btn"]').click();

    cy.get('[data-cy="space-tree-wrapper"]')
      .find(`[data-cy="tree-${spaceUnitName}"]`)
      .parent()
      .parent()
      .eq(0)
      .click();

    if (spaceUnit === "facility") {
      cy.get(`[data-cy="facility-setting-btn"]`).should("be.visible").click();
      cy.get(`[data-cy="tab-tagcategory"]`).should("be.visible").click();

      for (let j = 1; j < 3; j++) {
        const randIndx = Math.floor(Math.random() * colors.length);
        const colorName = colors[randIndx].name;

        cy.get(`[data-cy="show-add-edit-category-modal"]`)
          .should("be.visible")
          .click();
        cy.get(`[data-cy="category-name-input"]`).clear();
        cy.get(`[data-cy="category-name-input"]`)
          .should("be.visible")
          .type(`Cat${j}-${spaceUnitName}`);
        cy.get(`[data-cy-id="category-color-${colorName}"]`)
          .should("be.visible")
          .click();

        for (let k = 1; k < 4; k++) {
          cy.get(`[data-cy="show-add-edit-subcategory-modal"]`)
            .click({force: true});
          cy.get(`[data-cy="subcategory-name-input"]`).clear();
          cy.get(`[data-cy="subcategory-name-input"]`)
            .should("be.visible")
            .type(`SubCat${k}-Cat${j}-${spaceUnitName}`);

            const icons = ['computer.png'] 
            cy.get('[data-cy="subcategory-icon-file-upload"]').attachFile(icons[0]);

          cy.get(`[data-cy="add-subcategory-btn"]`)
            .should("be.visible")
            .click();
        }

        cy.get(`[data-cy="add-category-btn"]`).click({force: true});
      }

      cy.get(`[data-cy="space-setting-main-modal"]`).click();
    }

    cy.get('[data-cy="space-tree-wrapper"]')
      .find(`[data-cy="tree-${spaceUnitName}"]`)
      .parent()
      .parent()
      .eq(0)
      .click();
  }

  cy.get('[data-cy="enter-space-btn"]').should("be.visible").click();
};

const addTag = (nTags: number): void => {
  const positions = ["top", "left", "bottom"];

  let lastPos = 0;
  let indxPos = 0;

  const urls = [
    "https://www.youtube.com/watch?v=sca4VG9b0NY",
    "https://www.youtube.com/watch?v=i43tkaTXtwI",
  ];

  while (nTags--) {
    const randIndx = Math.floor(Math.random() * urls.length);

    cy.get(`[data-cy="add-tag-btn"]`)
      .click()
      .then(() => {
        // check initial state

        cy.get(`[data-cy="relocate-icon-msg"]`).should("not.be.visible");
        cy.get(`[data-cy="category-item-msg"]`).should("not.be.visible");
        cy.get(`[data-cy="subcategory-item-msg"]`).should("not.be.visible");
        cy.get(`[data-cy="tag-name-input-msg"]`).should("not.be.visible");
        cy.get(`[data-cy="tag-desc-input-msg"]`).should("not.be.visible");
        cy.get(`[data-cy="invalid-url"]`).should("not.be.visible");
        cy.get(`[data-cy="embed-media-err"]`).should("not.be.visible");
        cy.get(`[data-cy="subcategory-field"]`).should("have.text", "");
        cy.get(`[data-cy="tag-name-input"]`).should("be.empty");
        cy.get(`[data-cy="tag-desc-input"]`).should("have.text", "");
        cy.get(`[data-cy="embed-media"]`).should("have.text", "");
        cy.get(`[data-cy="add-tag-form-btn"]`).should("be.visible");
        cy.get(`[data-cy="update-tag-form-btn"]`).should("not.be.visible");

        // ----------------------

        // errors: required fields
        cy.get(`[data-cy="add-tag-form-btn"]`).click();
        cy.get(`[data-cy="relocate-icon-msg"]`).should("be.visible");
        cy.get(`[data-cy="subcategory-item-msg"]`).should("be.visible");
        cy.get(`[data-cy="tag-name-input-msg"]`).should("be.visible");
        cy.get(`[data-cy="tag-desc-input-msg"]`).should("be.visible");
        // ----------------------

        // errors: embed web media
        cy.get(`[data-cy="embed-media"]`)
          .should("be.visible")
          .type(faker.lorem.word());
        cy.get(`[data-cy="add-tag-form-btn"]`).click();
        cy.get(`[data-cy="invalid-url"]`).should("be.visible");
        cy.get(`[data-cy="embed-media"]`).clear();
        cy.get(`[data-cy="embed-media"]`).type(urls[randIndx]);
        cy.get(`[data-cy="add-tag-form-btn"]`).click();
        cy.get(`[data-cy="embed-media-err"]`).should("be.visible");
        // ----------------------

        // success: embed web media
        cy.get(`[data-cy="check-btn"]`).click();
        // cy.get(`[data-cy="embedly-table"]`).should("be.visible");
        //

        //remove media
        cy.get(`[data-cy="embedly-remove-btn"]`).should("be.visible").click();
        cy.get(`[data-cy="embed-media"]`).should("have.text", "");

        cy.wait(2000);

        cy.get(`[data-cy="relocate-icon"]`)
          .realClick()
          .then(() => {
            cy.enter().then((getBody) => {
              while (true) {
                // should have different positions of the last added tag
                indxPos = Math.floor(Math.random() * positions.length);
                if (indxPos !== lastPos) break;
              }
              lastPos = indxPos;

              getBody()
                // @ts-ignore
                .realHover({ position: positions[indxPos] }) // hover different locations inside the iframe
                .realClick()
                .then(() => {
                  cy.wait(3500); // navigating to tag

                  cy.get(`[data-cy="tag-category-select"]`).should(
                    "not.be.empty"
                  ); // should have category selected already
                  cy.get(`[data-cy="tag-form"]`)
                    .get(`[data-cy="subcategory-select"]`)
                    .get(`[data-cy="subcategory-item"]`)
                    .as("subcategory-items");
                  cy.get("@subcategory-items").then(($elems) => {
                    let nItems = $elems.length;

                    expect(nItems).to.be.greaterThan(0);

                    cy.get("@subcategory-items")
                      .eq(Math.floor(Math.random() * nItems))
                      .click({ force: true });
                    cy.get(`[data-cy="tag-name-input"]`).type(
                      faker.name.firstName()
                    );
                    cy.get(`[data-cy="tag-desc-input"]`).type(
                      faker.name.lastName()
                    );

                    cy.get(`[data-cy="embed-media"]`).type(urls[randIndx]);
                    cy.get(`[data-cy="check-btn"]`).click();
                    cy.wait(2500);
                    cy.get(`[data-cy="add-tag-form-btn"]`).click();
                    getBody().realHover();
                    getBody().realClick(); // click again to close the tag; it will avoid bugs
                  });
                });
            });
          });
      });

    cy.wait(1500);
  }

  // deleteTags()
};

const filterCategoryTest = (
  addTags: (nTags: number) => void,
  nTags: number
) => {
  // cy.get('[data-cy="tag-list-table"]', { timeout: 20000 }).should('be.visible')

  cy.get('[data-cy="tag-list-table"]')
    .find('[data-cy="tag-item"]')
    .then(($elemsTagItems) => {
      interface ITagItem {
        id: string | null;
        text: string | null;
        category: string | null;
        sub_category: string | null;
      }

      const tagItems: Array<ITagItem> = [];

      // get all tag items in table
      $elemsTagItems.toArray().forEach((el, indx) => {
        const text = el.textContent;
        const id = el.getAttribute("data-cy-id");
        const category = el.getAttribute("data-cy-category");
        const sub_category = el.getAttribute("data-cy-subcategory");
        tagItems.push({ id, text, category, sub_category });
      });

      console.log("__tagItems", tagItems);

      // category selection
      cy.get('[data-cy="tag-category-select"]')
        .get('[data-cy="category-item-select"]')
        .then(($elemsCategoryItems) => {
          const categories: Array<string> = [];

          // get all tag categories
          $elemsCategoryItems.toArray().forEach((el, indx) => {
            categories.push(el.textContent!);
          });

          console.log("__categories", categories);

          console.log("__$elems.length", $elemsCategoryItems.length);
          let nCategories = $elemsCategoryItems.length;

          while (nCategories--) {
            console.log("__nCategories", nCategories);

            // click all categories in descending order
            cy.get('[data-cy="tag-category-select"]')
              .get('[data-cy="category-item-select"]')
              .eq(nCategories)
              .click({ force: true });

            const selectedCategory = categories[nCategories];

            // get tag items by category selection
            let tagItemsByCategory = [];

            if (selectedCategory === "All Categories") {
              console.log("__selectedCategory is All Categories");
              tagItemsByCategory = tagItems;
            } else {
              tagItemsByCategory = tagItems.filter(
                (i) => i.category === selectedCategory
              );
            }
            // ------------------------------------

            console.log("__selectedCategory", selectedCategory);
            console.log("__tagItemsByCategory", tagItemsByCategory);

            // table should be empty if no tag items
            if (tagItemsByCategory.length === 0) {
              console.log("__no tag items");
              // cy.get('[data-cy="tag-list-table"]').should('not.be.visible')
              console.log("__continue");
              continue;
            }
            // -------------------------------------

            // should find tag item base on category selection
            tagItemsByCategory.forEach((i) => {
              console.log("__asserting");
              cy.get(`[data-cy="tag-list-table"]`)
                .find(`[data-cy-id="${i.id}"]`)
                .should("have.text", i.text);
            });
            // -----------------------------------------------
          }
          // end while
        });

      // subcategory selection
      cy.get('[data-cy="tag-category-select"]')
        .get('[data-cy="category-item-select"]')
        .then(($elemsCategoryItems) => {
          const categories: Array<string> = [];

          // get all tag categories
          $elemsCategoryItems.toArray().forEach((el, indx) => {
            categories.push(el.textContent!);
          });

          console.log("__categories", categories);

          console.log("__$elems.length", $elemsCategoryItems.length);
          let nCategories = $elemsCategoryItems.length;

          while (nCategories--) {
            console.log("__nCategories", nCategories);

            // click all categories in descending order
            cy.get('[data-cy="tag-category-select"]')
              .get('[data-cy="category-item-select"]')
              .eq(nCategories)
              .click({ force: true });

            const selectedCategory = categories[nCategories];

            let tagItemsByCategory: Array<ITagItem> = [];

            // filtering tag items by category
            if (selectedCategory === "All Categories") {
              console.log("__selectedCategory is All Categories");
              tagItemsByCategory = tagItems;
            } else {
              tagItemsByCategory = tagItems.filter(
                (i) => i.category === selectedCategory
              );
            }

            console.log("__selectedCategory", selectedCategory);
            console.log("__tagItemsByCategory", tagItemsByCategory);

            if (tagItemsByCategory.length === 0) {
              console.log("__no tag items");
              // cy.get('[data-cy="tag-list-table"]').should('not.be.visible')
              console.log("__continue");
              continue;
            }

            tagItemsByCategory.forEach((i) => {
              console.log("__asserting");
              cy.get(`[data-cy="tag-list-table"]`)
                .find(`[data-cy-id="${i.id}"]`)
                .should("have.text", i.text);
            });

            // selecting sub categories
            cy.get('[data-cy="subcategory-select"]')
              .get('[data-cy="subcategory-item-select"]')
              .then(($elemsSubCategItems) => {
                const subCategories: Array<string> = [];

                // getting all sub categories in dropdown
                $elemsSubCategItems.toArray().forEach((el, indx) => {
                  subCategories.push(el.textContent!);
                });

                let nSubCategories = $elemsSubCategItems.length;

                // selecting sub categories in descending order
                while (nSubCategories--) {
                  cy.get('[data-cy="subcategory-select"]')
                    .get('[data-cy="subcategory-item-select"]')
                    .eq(nSubCategories)
                    .click({ force: true });

                  const selectedSubCateg = subCategories[nSubCategories];

                  let tagItemsBySubCateg = [];

                  // filtering tag items by sub category
                  if (selectedSubCateg === "All Subcategories") {
                    console.log("__selectedSubCateg is All Subcategories");
                    tagItemsBySubCateg = tagItemsByCategory;
                  } else {
                    tagItemsBySubCateg = tagItemsByCategory.filter(
                      (i) => i.sub_category === selectedSubCateg
                    );
                  }

                  // if tag items is empty then table should be empty
                  if (tagItemsBySubCateg.length === 0) {
                    console.log("__no tag items");
                    // cy.get('[data-cy="tag-list-table"]').should('not.be.visible')
                    console.log("__continue");
                    continue;
                  }

                  // asserting that tag items base by sub category is in table
                  tagItemsBySubCateg.forEach((i) => {
                    console.log("__asserting");
                    cy.get(`[data-cy="tag-list-table"]`)
                      .find(`[data-cy-id="${i.id}"]`)
                      .should("have.text", i.text);
                  });
                }
              });
          }
          // end while
        });

      addTags(nTags);
    });
};

const deleteTags = (editTag: (nTags: number) => void, nTags: number) => {
  cy.get('[data-cy="tag-list-table"]')
    .find('[data-cy="tag-item"]')
    .then(($elems) => {
      let nItems = $elems.length;
      let nDelItems = Math.round(nItems / 2); // no. of tag items to be deleted; should not be greater to nItems

      while (nDelItems--) {
        let randIndx = Math.floor(Math.random() * nItems);
        cy.get('[data-cy="tag-list-table"]')
          .find('[data-cy="delete-tag-action"]')
          .eq(randIndx)
          .click();
        nItems--;
      }
    });

  editTag(nTags);
};

const inputValidSpaceUnitName = (): string => {
  const spaceUnitName = faker.lorem.word();
  const spaceUnitNameLen = spaceUnitName.length;
  cy.get('[data-cy="space-unit-input"]').type(spaceUnitName);
  cy.get('[data-cy="ctr-name"]').should("have.text", spaceUnitNameLen);

  return spaceUnitName;
};

const inputValidSpaceShowcaseURL = (showcaseUrls: Array<string>) => {
  const randIndx = Math.floor(Math.random() * showcaseUrls.length);
  const url = showcaseUrls[randIndx];
  cy.get('[data-cy="space-unit-showcase-url"]').type(url);
};

/*  ======================================================== Notes ========================================================

   ---------------------- Jay's Property | Hands off ----------------------

    I notice that to see ur new console.log, you should re run cypress test 
    using only cy.log, no need to re run cypress 
    but cy.log only accepts strings (use jsong stringify). 
    If you want to log arrays or objects og ge samokan kas xhr nga logging sa matterport nga di gyud sya mo undang, used console.log instead

    There is also timing issue when manipulating mp space and sidebar since there is sometimes delay in mp space due to lag. And maybe nested "thens"? not sure.
    to resolve this: use callback functions to make sure everything is executed accordingly

    Usahay mo error ang cypress tungod lag kaayo ang mp space pero okay rana sya. Utroha lang ang test. Patience is a virtue 


    TODOS:
      - Update tag test
      - Polish embed media. Wala pa syay remove functionality (di ni sa test ayg kalimot)
      - Then add test for embed and remove media 

  ---------------------------------- END ----------------------------------

*/
