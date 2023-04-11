
import { faker } from '@faker-js/faker';
import localForage from "localforage";

describe('Space Tree', () => {

  beforeEach( () => {
    // cy.viewport(1560, 850)
    localForage.clear()
  })
  
  it('Should test space tree', () => {
    cy.login("admin.azusa@mailinator.com", "admin.azusa.123");
    cy.visit('/')

    

    let spaceUnitName = ''
    let nSection = 3 // top and bottom
    const nSubSection = 4 // left and right

    addSections(nSection)

    cy.get('[data-cy="space-tree-wrapper"]').get('span.test-node').then( ($elem) => {
      
      let x = $elem.length / 2 // divide by 2 so that above space tree will be selected and be visible on the screen; applicable only if no. of nodes is < 20
      if(nSection >= x){ 
        x = $elem.length - (nSection - x) 
      }

      while(nSection--){
        cy.log('====== LOOPING ROOT SECTION ======')
        let nChild = nSubSection

        // Select node by going to top
        cy.get('[data-cy="space-tree-wrapper"]').find(`span.test-node`).eq(Math.floor(Math.random() * x) + nSection).click({force: true}) 
        
        while(nChild--){
          cy.log('====== LOOPING CHILDREN INSIDE SECTION ======')
  
          cy.get(`[data-cy="add-section-btn"]`).should('be.visible').click()
  
          spaceUnitName = inputValidSpaceUnitName()
          cy.get('[data-cy="save-btn"]').click()
          expectDispose({spaceUnitName})
  
          cy.get('[data-cy="space-tree-wrapper"]').find(`[data-cy="tree-${spaceUnitName}"]`).click({multiple: true, force: true})
        }

      }
    })



  })

})

const expectDispose = (payload: { spaceUnitName: string; }) => {
  cy.get('[data-cy="space-unit-modal"]').should('not.be.visible')
  cy.get('[data-cy="space-table-wrapper"]').find(`[data-cy="tbl-${payload.spaceUnitName}"]`).should('have.text', payload.spaceUnitName)
  cy.get('[data-cy="space-tree-wrapper"]').find(`[data-cy="tree-${payload.spaceUnitName}"]`)

}

const inputValidSpaceUnitName = () :string => {

  let spaceUnitName = ''

  while(true){
    spaceUnitName = faker.company.name() 
    if(spaceUnitName.length <= 25) break 
  }
  
  cy.get('[data-cy="space-unit-input"]').type(spaceUnitName)

  return spaceUnitName
}

const addSections = (nSections: number) => {

  while(nSections--){
    cy.get(`[data-cy="add-section-btn"]`).should('be.visible').click()
  
    const spaceUnitName = inputValidSpaceUnitName()
    cy.get('[data-cy="save-btn"]').click()
    expectDispose({spaceUnitName})
  }

}


