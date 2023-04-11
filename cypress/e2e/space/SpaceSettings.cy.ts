import { faker } from '@faker-js/faker'
import { colors } from '../../../src/stores/config'
import { subcategories } from '../../../src/stores/localization'
import type { COLOR, TagColor } from '../../../src/stores/types'
import { FOLDER_TYPE } from '../../../src/stores/types'
import localForage from "localforage";

describe('Space Setting Modal', () => {
    beforeEach(() => {
        cy.viewport(1560, 850)
        localForage.clear()
        cy.visit('/')
        cy.login("admin.azusa@mailinator.com", "admin.azusa.123");
    })

    it.skip('Should inheret assignees', () => {
        cy.visit('/')
        localForage.clear()
        const usersCsvEmails = ['Janessa_Boyle@gmail.com', 'Shanon_Jerde46@yahoo.com', 'Joshuah.OKon71@yahoo.com'] // data from csv file

        //Navigate to a section
        cy.get('[data-cy="space-tree-wrapper"]').find(`span.node-text`).parent().parent().eq(1).click()
        cy.get(`[data-cy-type="Section node"]`).parent().parent().eq(0).click()

        cy.get('[data-cy="action-bar-buttons"]').find('[data-cy="section-setting-btn"]').click()
        cy.log('======= Select Current Section Setting ========')
        cy.get('[data-cy="space-settings-modal"]').should('be.visible')
        cy.log('======= Select Assignee Setting ========')

        //Select assignee tab
        cy.get('[data-cy="tab-assignee"]').should('be.visible')
        cy.get('[data-cy="tab-assignee"]').click()

        //Check if table, columns, and dropdowns are visible
        cy.get('[data-cy="assignee-table-wrapper"]').should('be.visible')
        cy.get('[data-cy="assingee-table-name-column"]').should('be.visible')
        cy.get('[data-cy="assingee-table-email-column"]').should('be.visible')
        cy.get('[data-cy="assingee-table-role-column"]').should('be.visible')
        cy.get('[data-cy="add-role-dropdown"]').should('be.visible')
        cy.get('[data-cy="remove-role-dropdown"]').should('be.visible')
        cy.get('[data-cy="remove-assignee-btn"]').should('be.visible')

        //Display add/edit role modal
        cy.log('======= Add/Edit Modal should be visible ========')
        cy.get('[data-cy="show-add-edit-assignee-modal"]').should('be.visible')
        cy.get('[data-cy="show-add-edit-assignee-modal"]').click()

        //Check if table, columns, and buttons are visible
        cy.get('[data-cy="add-edit-assignee-modal"]').should('be.visible')
        cy.get('[data-cy="assignee-name-input"]').should('be.visible')
        cy.get('[data-cy="add-assignee-table-wrapper"]').should('be.visible')

        //Check if add and remove role dropdowns are visible
        cy.get('[data-cy="add-assignee-role-dropdown"]').should('be.visible')
        cy.get('[data-cy="remove-assignee-role-dropdown"]').should('be.visible')
        cy.get('[data-cy="remove-assignee-imported-dropdown"]').should('be.visible')
        cy.get('[data-cy="add-assignee-btn"]').should('be.visible')

        //Import new assignees using bulk upload
        cy.get('[data-cy="bulk-upload-file-input"]').attachFile('user_data_csv.csv')

        //Check if imported users appear in table
        usersCsvEmails.forEach(email => {
            cy.get('[data-cy="add-assignee-table-wrapper"]').get(`[data-cy-id="add-assignee-table-email-${email}"]`)
        })
        cy.get('[data-cy="add-assignee-table-name-column"]').should('be.visible')
        cy.get('[data-cy="add-assignee-table-email-column"]').should('be.visible')

        //Test if checkboxes work and select all
        checkAllCheckboxes(usersCsvEmails,'data-cy="add-edit-assignee-modal"')

        //If checkboxes work, try 2 adding roles
        for (let i = 0; i < 2; i++) {
            cy.get('[data-cy="add-assignee-role-dropdown"]').click()
            cy.get('[data-cy="add-assignee-role-dropdown"]').get('[data-cy="add-role-dropdown-item"]').first().click()
        }

        //Save users
        cy.get('[data-cy="add-assignee-btn"]').click()

        //Expect Add Assignee modal to be invisible after saving
        cy.get('[data-cy="show-add-edit-role-modal"]').should('not.be.visible')

        //Go to to next page in assignee table
        cy.get('[data-cy="assignee-table-wrapper"]').find('.pagination-next').should('be.visible')
        cy.get('[data-cy="assignee-table-wrapper"]').find('.pagination-next').click()

        //Check if saved imported users have been added to assignee table
        usersCsvEmails.forEach(email => {
            cy.get(`[data-cy-id="assingee-table-email-${email}"]`).invoke('text').then((text) => {
                expect(text.trim()).to.equal(email)
            })
        })

        //Close modal
        cy.get('[data-cy="space-setting-main-modal"]').click()
        cy.get('[data-cy="space-settings-modal"]').should('not.be.visible')

        //Go to Facility
        cy.get(`[data-cy-type="Facility node"]`).parent().parent().eq(0).click()

        //Select Current Facility Setting
        cy.get('[data-cy="action-bar-buttons"]').find('[data-cy="facility-setting-btn"]').click()
        cy.log('======= Select Current Facility Setting ========')
        cy.get('[data-cy="space-settings-modal"]').should('be.visible')
        cy.log('======= Select Assignee Setting ========')

        //Check if table, columns, and dropdowns are visible
        cy.get('[data-cy="assignee-table-wrapper"]').should('be.visible')
        cy.get('[data-cy="assingee-table-name-column"]').should('be.visible')
        cy.get('[data-cy="assingee-table-email-column"]').should('be.visible')
        cy.get('[data-cy="assingee-table-role-column"]').should('be.visible')
        cy.get('[data-cy="add-role-dropdown"]').should('be.visible')
        cy.get('[data-cy="remove-role-dropdown"]').should('be.visible')
        cy.get('[data-cy="remove-assignee-btn"]').should('be.visible')

        //Check if saved imported users have been added to assignee table
        usersCsvEmails.forEach(email => {
            cy.get(`[data-cy-id="assingee-table-email-${email}"]`).invoke('text').then((text) => {
                expect(text.trim()).to.equal(email)
            })
        })

        //Close facility setting modal
        cy.get('[data-cy="space-setting-main-modal"]').click()
        cy.get('[data-cy="space-settings-modal"]').should('not.be.visible')

        cy.get(`[data-cy-type="Space node"]`).parent().parent().eq(0).click()

        //Select assignee tab
        cy.get('[data-cy="space-tab-assignee"]').should('be.visible')
        cy.get('[data-cy="space-tab-assignee"]').click()

        //Go to to next page in assignee table
        cy.get('[data-cy="assignee-table-wrapper"]').find('.pagination-next').should('be.visible')
        cy.get('[data-cy="assignee-table-wrapper"]').find('.pagination-next').first().click()

        //Check if saved imported users have been added to assignee table
        usersCsvEmails.forEach(email => {
            cy.get(`[data-cy-id="assingee-table-email-${email}"]`).first().invoke('text').then((text) => {
                expect(text.trim()).to.equal(email)
            })
        })
    })
    it('Should Have Tag Category Settings', () => {
        // cy.visit('/')
        // cy.login("admin.azusa@mailinator.com", "admin.azusa.123");
        // localForage.clear()
        let categoryName: string = faker.name.jobArea()
        let localSubs: Array<string> = []
        let icons: Array<string> = []
        let color: TagColor = colors[Math.floor(Math.random() * colors.length)]
        const rand = randomNumber(3, 5)
        const iconNames = [
            "antenna.png",
            "cctv.png",
            "computer.png",
            "customer.png",
            "fan.png",
            "mop.png",
            "padlock.png",
            "telephone.png",
        ]
        const icon = iconNames[randomNumber(0, iconNames.length)]

        cy.log('======= Check if Root Node is Available and Select Section ========')
        cy.get('[data-cy="space-tree-wrapper"]').find(`[data-cy="tree-ROOT"]`).should('exist')
        cy.get(`[data-cy="tree-type-${FOLDER_TYPE.SECTION}"]`).closest('.tree-node').first().click();
        cy.get('[data-cy="action-bar-buttons"]').find('[data-cy="section-setting-btn"]').click()
        cy.log('======= Select Current Section Setting ========')
        cy.get('[data-cy="space-settings-modal"]').should('be.visible')
        cy.log('======= Select Tag Category Setting ========')

        //Select tag category tab
        cy.get('[data-cy="tab-tagcategory"]').should('be.visible')
        cy.get('[data-cy="tab-tagcategory"]').click()
        cy.get('[data-cy="category-table-wrapper"]').should('be.visible')
        // cy.get('[data-cy="category-table-name-column"]').should('be.visible')
        // cy.get('[data-cy="category-table-color-column"]').should('be.visible')
        // cy.get('[data-cy="category-table-subcategory-column"]').should('be.visible')
        // cy.get('[data-cy="category-table-edit"]').should('be.visible')
        // cy.get('[data-cy="category-table-delete"]').should('be.visible')
        cy.get('[data-cy="show-add-edit-category-modal"]').should('be.visible')

        //Display add/edit tag category modal
        cy.log('======= Add/Edit Modal should be visible ========')
        cy.get('[data-cy="show-add-edit-category-modal"]').should('be.visible')
        cy.get('[data-cy="show-add-edit-category-modal"]').click()
        cy.get('[data-cy="add-edit-category-modal"]').should('be.visible')
        cy.get('[data-cy="category-name-input"]').should('be.visible')
        cy.get('[data-cy="subcategory-table-wrapper"]').should('be.visible')
        cy.get('[data-cy="cancel-add-category-btn"]').should('be.visible')
        cy.get('[data-cy="add-category-btn"]').should('be.visible')

        //Check if each color option is visible
        for (let i = 0; i < colors.length; i++) {
            cy.get(`[data-cy-id="category-color-${colors[i].name}"]`).should('be.visible')
        }

        //Create new tag category
        cy.get('[data-cy="category-name-input"]').type(categoryName)
        cy.get(`[data-cy-id="category-color-${color.name}"]`).click()

        //Show add subcategory modal
        cy.get('[data-cy="show-add-edit-subcategory-modal"]').click()
        cy.get('[data-cy="add-edit-subcategory-modal"]').should('be.visible')
        cy.get('[data-cy="cancel-add-subcategory-btn"]').should('be.visible')
        cy.get('[data-cy="add-subcategory-btn"]').should('be.visible')

        //Check if all inputs are visible
        cy.get('[data-cy="subcategory-name-input"]').should('be.visible')
        cy.get('[data-cy="subcategory-icon-name"]').should('be.visible')

        //Check that icon name says undefined when no icon has been uploaded yet
        cy.get('[data-cy="subcategory-icon-name"]').invoke('text').then((text) => {
            expect(text.trim()).to.equal('Undefined')
        })
        // cy.get('[data-cy="subcategory-icon-file-upload"]').should('be.visible')

        //Create new subcategory
        let limit: number = randomNumber(2, 5)
        for (let j = 0; j < limit; j++) {
            const sub = subcategories[randomNumber(0, subcategories.length)]
            const image = iconNames[Math.floor(Math.random() * iconNames.length)]
            localSubs.push(sub)
            icons.push(image)

            cy.get('[data-cy="subcategory-name-input"]').type(sub)
            cy.get('[data-cy="subcategory-icon-file-upload"]').attachFile(image)
            cy.get('[data-cy="subcategory-icon-name"]').wait(200).invoke('text').then((text) => {
                expect(text.trim()).to.equal(image)
            })
            cy.get('[data-cy="add-subcategory-btn"]').click()
            cy.get('[data-cy="add-edit-subcategory-modal"]').should('not.be.visible')
            if (j < limit - 1) {
                cy.get('[data-cy="show-add-edit-subcategory-modal"]').click()
            }
        }

        //Check if newly added localSubs appear on the table
        cy.get('[data-cy="subcategory-table-name-column"]').should('be.visible')
        cy.get('[data-cy="subcategory-table-icon-image-column"]').should('be.visible')
        cy.get('[data-cy="subcategory-table-icon-name-column"]').should('be.visible')

        for (let i = 0; i < localSubs.length; i++) {
            if (i > 3) {
                cy.get('[data-cy="subcategory-table-wrapper"]').find('.pagination-next').should('be.visible')
                cy.get('[data-cy="subcategory-table-wrapper"]').find('.pagination-next').click()
            }
            cy.get(`[data-cy-id="subcategory-table-name-${localSubs[i]}"]`).should('be.visible')
            cy.get(`[data-cy-id="subcategory-table-name-${localSubs[i]}"]`).first().invoke('text').then((text) => {
                expect(text.trim()).to.equal(localSubs[i])
            })
            cy.get(`[data-cy-id="subcategory-table-icon-image-${icons[i]}"]`).should('be.visible')
            cy.get(`[data-cy-id="subcategory-table-icon-name-${icons[i]}"]`).should('be.visible')
            cy.get(`[data-cy-id="subcategory-table-icon-name-${icons[i]}"]`).first().invoke('text').then((text) => {
                expect(text.trim()).to.equal(icons[i])
            })
        }

        //Check if edit and delete buttons are visible for each row
        cy.get('[data-cy="subcategory-table-edit"]').should('be.visible')
        cy.get('[data-cy="subcategory-table-delete"]').should('be.visible')

        //Check if edit button for subcategory table works
        if (localSubs.length >= 5) {
            cy.get('[data-cy="subcategory-table-wrapper"]').find('.pagination-previous').should('be.visible')
            cy.get('[data-cy="subcategory-table-wrapper"]').find('.pagination-previous').click()
        }
        cy.get(`[data-cy-id="subcategory-table-edit-${localSubs[0]}"]`).first().click()
        cy.get('[data-cy="add-edit-subcategory-modal"]').should('be.visible')
        cy.get('[data-cy="subcategory-name-input"]').should('have.value', localSubs[0])
        cy.get('[data-cy="subcategory-icon-image"]').should('be.visible')
        cy.get('[data-cy="subcategory-icon-name"]').invoke('text').then((text) => {
            expect(text.trim()).to.equal(icons[0])
        })

        //Edit the selected subcategory
        const editedIcon = iconNames[Math.floor(Math.random() * iconNames.length)]
        const editedName = faker.name.jobType()
        cy.get('[data-cy="subcategory-name-input"]').clear().type(editedName)
        cy.get('[data-cy="subcategory-icon-file-upload"]').attachFile(editedIcon)
        cy.get('[data-cy="subcategory-icon-name"]').wait(200).invoke('text').then((text) => {
            expect(text.trim()).to.equal(editedIcon)
        })
        cy.get('[data-cy="add-subcategory-btn"]').click()
        cy.get('[data-cy="add-edit-subcategory-modal"]').should('not.be.visible')

        //Check if edit is reflected on subcategory table
        cy.get(`[data-cy-id="subcategory-table-name-${editedName}"]`).should('be.visible')
        cy.get(`[data-cy-id="subcategory-table-icon-name-${editedIcon}"]`).should('be.visible')
        cy.get(`[data-cy-id="subcategory-table-name-${editedName}"]`).invoke('text').then((text) => {
            expect(text.trim()).to.equal(editedName)
        })
        cy.get(`[data-cy-id="subcategory-table-icon-name-${editedIcon}"]`).first().invoke('text').then((text) => {
            expect(text.trim()).to.equal(editedIcon)
        })

        cy.get('[data-cy="add-category-btn"]').should('be.visible')
        cy.get('[data-cy="add-category-btn"]').click()

        //Proceed to next page
        if (localSubs.length > 5) {
            /* cy.get('[data-cy="category-table-wrapper"]').find('.pagination-next').should('be.visible')
            cy.get('[data-cy="category-table-wrapper"]').find('.pagination-next').click()    */
        }
        cy.get('[data-cy="category-table-wrapper"]').find('.pagination-next').invoke('hasClass', 'is-disabled')
            .then(isDisabled => {
                if (!isDisabled) {
                    cy.get('[data-cy="category-table-wrapper"]').find('.pagination-next').should('be.visible')
                    cy.get('[data-cy="category-table-wrapper"]').find('.pagination-next').click()
                }
            })


        //Check if added tag category exists
        cy.get(`[data-cy-id="category-table-name-${categoryName}"]`).should('be.visible')
        cy.get(`[data-cy-id="category-table-name-${categoryName}"]`).invoke('text').then((text) => {
            expect(text.trim()).to.equal(categoryName)
        })
        
        //Delete the categories we just added
        //cy.get('[data-cy="category-table-wrapper"]').find('[data-cy="category-table-delete"]').eq(0).click()

    })

    it('Should Have Role Settings', () => {
        // cy.visit('/')
        // localForage.clear()
        
        cy.log('======= Check if Root Node is Available and Select Section ========')
        cy.get('[data-cy="space-tree-wrapper"]').find(`[data-cy="tree-ROOT"]`).should('exist')
        cy.get(`[data-cy="tree-type-${FOLDER_TYPE.SECTION}"]`).closest('.tree-node').first().click();
        cy.get('[data-cy="action-bar-buttons"]').find('[data-cy="section-setting-btn"]').click()
        cy.log('======= Select Current Section Setting ========')
        cy.get('[data-cy="space-settings-modal"]').should('be.visible')
        cy.log('======= Select Role Setting ========')

        //Select role tab
        cy.get('[data-cy="tab-role"]').should('be.visible')
        cy.get('[data-cy="tab-role"]').click()
        cy.get('[data-cy="role-table-wrapper"]').should('be.visible')
        //cy.get('[data-cy="role-table-name-column"]').should('be.visible')
        //cy.get('[data-cy="role-table-category-column"]').should('be.visible')
        //cy.get('[data-cy="role-table-edit"]').should('be.visible')
        // cy.get('[data-cy="role-table-delete"]').should('be.visible')

        for (let i = 0; i < 2; i++) {
            const roleName: string = faker.name.jobArea()
            const color: COLOR = colors[Math.floor(Math.random() * colors.length)].name

            //Display add/edit role modal
            cy.log('======= Add/Edit Modal should be visible ========')
            cy.get('[data-cy="show-add-edit-role-modal"]').should('be.visible')
            cy.get('[data-cy="show-add-edit-role-modal"]').click()
            cy.get('[data-cy="add-edit-role-modal"]').should('be.visible')
            cy.get('[data-cy="role-name-input"]').should('be.visible')

            //Check if each color option is visible
            for (let i = 0; i < colors.length; i++) {
                cy.get(`[data-cy-id="role-color-${colors[i].name}"]`).should('be.visible')
            }
            cy.get('[data-cy="role-category-dropdown"]').should('be.visible')

            //Create new role
            cy.log('======= Add New Role ========')
            cy.get('[data-cy="role-name-input"]').type(roleName)
            cy.get(`[data-cy-id="role-color-${color}"]`).click()
            cy.get('[data-cy="role-category-dropdown"]').click()
            cy.get('[data-cy="category-dropdown-item"]').first().click()
            cy.get('[data-cy="add-role-btn"]').click()

            //Check if paginations is available and check if new user exists on table
            // cy.get('[data-cy="role-table-wrapper"]').find('.pagination-next').should('be.visible')
            // cy.get('[data-cy="role-table-wrapper"]').find('.pagination-next').click()
            cy.get(`[data-cy-id="role-table-name-${roleName}"]`).should('be.visible')
            cy.get(`[data-cy-id="role-table-name-${roleName}"]`).invoke('text').then((text) => {
                expect(text.trim()).to.equal(roleName)
            })
        }

    })

    it('Should Have Asssignee Setting', () => {
        // cy.visit('/')
        // localForage.clear()
        let assigneeName: string = faker.name.fullName()
        const usersCsvEmails = ['Janessa_Boyle@gmail.com', 'Shanon_Jerde46@yahoo.com', 'Joshuah.OKon71@yahoo.com'] // data from csv file
        const rand = Math.floor(Math.random() * 5)


        cy.log('======= Check if Root Node is Available and Select Section ========')
        cy.get('[data-cy="space-tree-wrapper"]').find(`[data-cy="tree-ROOT"]`).should('exist')
        cy.get(`[data-cy="tree-type-${FOLDER_TYPE.SECTION}"]`).closest('.tree-node').first().click();
        cy.get('[data-cy="action-bar-buttons"]').find('[data-cy="section-setting-btn"]').click()
        cy.log('======= Select Current Section Setting ========')
        cy.get('[data-cy="space-settings-modal"]').should('be.visible')
        cy.log('======= Select Assignee Setting ========')

        //Select assignee tab
        cy.get('[data-cy="tab-assignee"]').should('be.visible')
        cy.get('[data-cy="tab-assignee"]').click()

        //Check if table, columns, and dropdowns are visible
        cy.get('[data-cy="assignee-table-wrapper"]').should('be.visible')
        // cy.get('[data-cy="assingee-table-name-column"]').should('be.visible')
        // cy.get('[data-cy="assingee-table-email-column"]').should('be.visible')
        // cy.get('[data-cy="assingee-table-role-column"]').should('be.visible')
        cy.get('[data-cy="add-role-dropdown"]').should('be.visible')
        cy.get('[data-cy="remove-role-dropdown"]').should('be.visible')
        cy.get('[data-cy="remove-assignee-btn"]').should('be.visible')

        //Display add/edit role modal
        cy.log('======= Add/Edit Modal should be visible ========')
        cy.get('[data-cy="show-add-edit-assignee-modal"]').should('be.visible')
        cy.get('[data-cy="show-add-edit-assignee-modal"]').click()

        //Check if table, columns, and buttons are visible
        cy.get('[data-cy="add-edit-assignee-modal"]').should('be.visible')
        cy.get('[data-cy="assignee-name-input"]').should('be.visible')
        cy.get('[data-cy="add-assignee-table-wrapper"]').should('be.visible')

        //Check if add and remove role dropdowns are visible
        cy.get('[data-cy="add-assignee-role-dropdown"]').should('be.visible')
        cy.get('[data-cy="remove-assignee-role-dropdown"]').should('be.visible')
        cy.get('[data-cy="remove-assignee-imported-dropdown"]').should('be.visible')
        cy.get('[data-cy="add-assignee-btn"]').should('be.visible')

        //Import new assignees using bulk upload
        cy.get('[data-cy="bulk-upload-file-input"]').attachFile('user_data_csv.csv')

        //Check if imported users appear in table
        usersCsvEmails.forEach(email => {
            cy.get('[data-cy="add-assignee-table-wrapper"]').get(`[data-cy-id="add-assignee-table-email-${email}"]`)
        })
        cy.get('[data-cy="add-assignee-table-name-column"]').should('be.visible')
        cy.get('[data-cy="add-assignee-table-email-column"]').should('be.visible')

        //Test if checkboxes work and select all
        checkAllCheckboxes(usersCsvEmails,'data-cy="add-edit-assignee-modal"')

        //If checkboxes work, try 2 adding roles
        for (let i = 0; i < 2; i++) {
            cy.get('[data-cy="add-assignee-role-dropdown"]').click()
            cy.get('[data-cy="add-assignee-role-dropdown"]').get('[data-cy="add-role-dropdown-item"]').first().click()
        }

        //Test removing one role
        cy.get('[data-cy="remove-assignee-role-dropdown"]').click()
        cy.get('[data-cy="remove-assignee-role-dropdown"]').get('[data-cy="remove-role-dropdown-item"]').first().click()

        //Remove all selected users
        cy.get('[data-cy="remove-assignee-imported-dropdown"]').click()

        //Import users again
        cy.get('[data-cy="bulk-upload-file-input"]').attachFile('user_data_csv.csv');

        usersCsvEmails.forEach(email => {
            cy.get('[data-cy="add-assignee-table-wrapper"]').get(`[data-cy-id="add-assignee-table-email-${email}"]`)
        })
        cy.get('[data-cy="add-assignee-table-name-column"]').should('be.visible')
        cy.get('[data-cy="add-assignee-table-email-column"]').should('be.visible')

        //Select all users again
        checkAllCheckboxes(usersCsvEmails,'data-cy="add-edit-assignee-modal"')

        //Add roles again
        for (let i = 0; i < 2; i++) {
            cy.get('[data-cy="add-assignee-role-dropdown"]').click()
            cy.get('[data-cy="add-assignee-role-dropdown"]').get('[data-cy="add-role-dropdown-item"]').first().click()
        }

        //Save users
        cy.get('[data-cy="add-assignee-btn"]').click()

        //Expect Add Assignee modal to be invisible after saving
        cy.get('[data-cy="show-add-edit-role-modal"]').should('not.be.visible')

        //Go to to next page in assignee table
        // cy.get('[data-cy="assignee-table-wrapper"]').find('.pagination-next').should('be.visible')
        // cy.get('[data-cy="assignee-table-wrapper"]').find('.pagination-next').click()

        //Check if saved imported users have been added to assignee table
        usersCsvEmails.forEach(email => {
            cy.get(`[data-cy-id="assingee-table-email-${email}"]`).invoke('text').then((text) => {
                expect(text.trim()).to.equal(email)
            })
        })

        //Delete users previously added via csv
        checkAllCheckboxes(usersCsvEmails,'data-cy="assignee-table-wrapper"')
        cy.get('[data-cy="remove-assignee-btn"]').click()

        //Delete roles and categories added my previous test cases
        cy.log("Delete previous categories and roles")

        //Select role tab
        cy.get('[data-cy="tab-role"]').should('be.visible')
        cy.get('[data-cy="tab-role"]').click()
        cy.get('[data-cy="role-table-wrapper"]').should('be.visible')

        cy.get('[data-cy="role-table-wrapper"]').find('[data-cy="role-table-delete"]').its('length').then(roleLength => {
            cy.log(`There are ${roleLength} roles`)
            for (let k = 0; k < roleLength; k++) {
                cy.get('[data-cy="role-table-wrapper"]').find('[data-cy="role-table-delete"]').first().click()
            }
        });

        //Select tag category tab
        cy.get('[data-cy="tab-tagcategory"]').should('be.visible')
        cy.get('[data-cy="tab-tagcategory"]').click()
        cy.get('[data-cy="category-table-wrapper"]').should('be.visible')

        cy.get('[data-cy="category-table-wrapper"]').find('[data-cy="category-table-delete"]').its('length').then(categoryLength => {
            cy.log(`There are ${categoryLength} categories`)
            for (let k = 0; k < categoryLength; k++) {
                cy.get('[data-cy="category-table-wrapper"]').find('[data-cy="category-table-delete"]').first().click()
            }
        });

        cy.log(`Clean up finished`)
    })

    const checkAllCheckboxes = (users:Array<string>,target:string) => {
        //Test if checkboxes work and select all
        users.forEach(email => {
            cy.get(`[${target}]`).find('.checkbox input[type="checkbox"]').eq(0).check()
        })
    }

    const randomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
})