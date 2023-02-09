
import { faker } from '@faker-js/faker';

describe('Space Unit Modal', () => {

  beforeEach( () => {
    cy.viewport(1560, 850)
  })
  
  it('Should validate and add Space Unit', () => {

    cy.visit('/')

    let spaceUnitName: string, email: string = ''

    const perPage = 5 // no. of users per page in table
    const totalUsers = 10 // total users to be added in table; should be divisible by perPage
    const showcaseUrls = ['https://my.matterport.com/show/?m=Msfg36od5J3', 'https://my.matterport.com/show/?m=qSGGhhjTYbN']

    let spaceUnit = 'section'

    for(let i = 0; i < 3; i++){ 

      if(i === 1) spaceUnit = 'facility'
      else if(i === 2) spaceUnit = 'space'
      
      // 0. Expect add-section-btn
      // 1. Click add-section-btn
      cy.get(`[data-cy="add-${spaceUnit}-btn"]`).should('be.visible').click()
      expectInit(spaceUnit) 
  
      // 2. Type >= 25 characters in space-unit-input
      cy.get('[data-cy="space-unit-input"]').type(faker.lorem.words(10))
      cy.get('[data-cy="ctr-name"]').should('have.text', '25')
      cy.get('[data-cy="ctr-name-label"]').should('have.class', 'has-text-danger')
  
      // 3. Clear field space-unit-input
      cy.get('[data-cy="space-unit-input"]').clear()
      cy.get('[data-cy="ctr-name"]').should('have.text', '0')
      cy.get('[data-cy="ctr-name-label"]').should('not.have.class', 'has-text-danger')
  
      // 4. Click save-btn
      cy.get('[data-cy="save-btn"]').click()
      cy.get('[data-cy="space-unit-input-error"]').should('have.text', `${c(spaceUnit)} name is required`)
  
      // 5. Type valid space-unit-input
      spaceUnitName = inputValidSpaceUnitName()
      
      if(spaceUnit === 'space'){ // add showcase url
        // Enter invalid url
        cy.get('[data-cy="space-unit-showcase-url"]').type(faker.lorem.word())
        cy.get('[data-cy="space-unit-showcase-url-error"]').should('be.visible').should('have.text', `Invalid URL`)

        // Clear field 
        cy.get('[data-cy="space-unit-showcase-url"]').clear()

        // type valid showcase url 
        inputValidSpaceShowcaseURL(showcaseUrls)
      }

      // 5.5 bulk upload
      const usersCsvEmails = ['Janessa_Boyle@gmail.com', 'Shanon_Jerde46@yahoo.com', 'Joshuah.OKon71@yahoo.com'] // data from csv file
      cy.get('[data-cy="bulk-upload-file-input"]').attachFile('user_data_csv.csv');
      usersCsvEmails.forEach(email => {
        cy.get('[data-cy="space-unit-table-wrapper"]').find(`[data-cy="space-unit-tbl-${email}"]`)
      })

      // 6. Click save-btn
      cy.get('[data-cy="save-btn"]').click()
      expectDispose({spaceUnitName})
  
  
      // 7. Click add-section-btn
      cy.get(`[data-cy="add-${spaceUnit}-btn"]`).should('be.visible').click()
      expectInit(spaceUnit) // on opening of modal
  
      // 8. Type valid space-unit-input
      spaceUnitName = inputValidSpaceUnitName()

      // Type valid showcase url if spaceUnit is space 
      if(spaceUnit === 'space'){
        inputValidSpaceShowcaseURL(showcaseUrls)
      }
  
      // 9. Type invalid email-input
      email = faker.lorem.word()
      cy.get('[data-cy="email-input"]').type(email)
      cy.get('[data-cy="add-user-btn"]').should('not.be.disabled')
  
      // 10. Click add-user-btn
      cy.get('[data-cy="add-user-btn"]').click()
      cy.get('[data-cy="email-input-wrapper"]').find('p').should('have.text', `Please include an '@' in the email address. '${email}' is missing an '@'.`)
      // ------------------------------ 
  
      // 11. Clear field email-input
      cy.get('[data-cy="email-input"]').clear()
      cy.get('[data-cy="add-user-btn"]').should('be.disabled')
  
  
      // 12. addUser() N times
      let countPage = addSpaceUnitUser(totalUsers, perPage)
      goFirstPageInTable(countPage)
  
      // 13. Click select-all-checkboxes; empty table
      // 14. Click remove-users-btn
      for(let i = countPage; i--;){
        cy.get('[data-cy="space-unit-users"]').find('.checkbox input[type="checkbox"]').eq(0).check()
        cy.get('[data-cy="remove-user-btn"]').click()
      }
      cy.get('[data-cy="space-unit-modal"]').find('[class="table is-empty"]') // check if table is empty
  
      // 15. addUser() N times
      countPage = addSpaceUnitUser(totalUsers, perPage)
      goFirstPageInTable(countPage)
  
      // 16 check random rows
      let selectedUsersIndx = checkRandomRows()
      let selectedUsersEmail = getCheckedRowsByEmail(selectedUsersIndx) // get selected rows by email; To be checked later if it is removed
  
      // 17. Click remove-users-btn
      cy.get('[data-cy="remove-user-btn"]').click().then( (x) => {
        selectedUsersEmail.forEach(i => {
          cy.get('[data-cy="space-unit-table-wrapper"]').get(`[data-cy="space-unit-tbl-${i}"]`).should('not.exist')
        })
      })
      
      // 18. Click save-btn
      cy.get('[data-cy="save-btn"]').click()
      expectDispose({spaceUnitName})
  
      cy.log(spaceUnitName)
  
      // 19. Select last section in Space Tree that your currently added; .last() won't work dunno why
      // cy.get('[data-cy="space-tree-wrapper"]').find(`ul>li>ul`).then( (li) => {
      //   li.toArray().forEach( (el, indx) => {
      //     //@ts-ignore
      //     cy.log(el.children.item(0)?.children.item(1)?.textContent)
      //     if(spaceUnitName == el.children.item(0)?.children.item(1)?.textContent){
      //       cy.log('equal')
      //       el.click()
      //       return 
      //     }
      //   })
      // })
      // cy.get('[data-cy="space-tree-wrapper"]').find(`ul>li`).eq( (-7) - i ).click()
      // cy.get('[data-cy="space-tree-wrapper"]').find(`ul>li`).last().click()

      cy.get('[data-cy="space-tree-wrapper"]').find(`[data-cy="tree-${spaceUnitName}"]`).parent().parent().eq(0).click()

    }


  })

})


const expectInit = (spaceUnit: string) => {
  cy.get('[data-cy="space-unit-modal"]').should('be.visible')
  cy.get('[data-cy="space-unit-name"]').should('have.text', `${c(spaceUnit)} Name`)
  cy.get('[data-cy="space-unit-input-error"]').should('not.be.visible')
  cy.get('[data-cy="space-unit-input"]').should('be.empty')
  cy.get('[data-cy="email-input"]').should('be.empty')
  cy.get('[data-cy="ctr-name-label"]').should('have.text', '0/25')
  cy.get('[data-cy="ctr-name-label"]').should('not.have.class', 'has-text-danger')
  cy.get('[data-cy="space-unit-modal"]').find('[class="table is-empty"]')
  cy.get('[data-cy="add-user-btn"]').should('be.disabled')
}

const expectDispose = (payload: { spaceUnitName: string; }) => {
  cy.get('[data-cy="space-unit-modal"]').should('not.be.visible')
  cy.get('[data-cy="space-table-wrapper"]').find(`[data-cy="tbl-${payload.spaceUnitName}"]`).should('have.text', payload.spaceUnitName)
  cy.get('[data-cy="space-tree-wrapper"]').find(`[data-cy="tree-${payload.spaceUnitName}"]`)

}

const inputValidSpaceUnitName = () :string => {
  const spaceUnitName = faker.lorem.word()
  const spaceUnitNameLen = spaceUnitName.length
  cy.get('[data-cy="space-unit-input"]').type(spaceUnitName)
  cy.get('[data-cy="ctr-name"]').should('have.text', spaceUnitNameLen)

  return spaceUnitName
}

const inputValidSpaceShowcaseURL = (showcaseUrls: Array<string>) => {
  const randIndx = Math.floor(Math.random() * showcaseUrls.length)
  const url = showcaseUrls[randIndx]
  cy.get('[data-cy="space-unit-showcase-url"]').type(url)
}

const addSpaceUnitUser = (nTimes: number, perPage: number) :number => {

  let countPage = 1

  for(let i = 0; i < nTimes; i++){

    const email = faker.internet.email()
    cy.get('[data-cy="email-input"]').type(email)
    cy.get('[data-cy="add-user-btn"]').click()
    cy.get('[data-cy="add-user-btn"]').should('be.disabled')

    // click next pagination; if per page is 5 then mod 5
    if( (i !== 0) && (i % perPage === 0) ){
      cy.get('[data-cy="space-unit-users"]').find('.pagination-next').click()
      countPage++
    }
    // ---------------

    cy.get('[data-cy="space-unit-table-wrapper"]').get(`[data-cy="space-unit-tbl-${email}"]`)

  }

  return countPage


}

const getCheckedRowsByEmail = (selectedUsersIndx: Array<number>) :Array<string> => {
  const selectedUsersEmail: Array<string> = []

  cy.get('[data-cy="space-unit-users"]').find('.table').find('tr').then( (rows) => {
    rows.toArray().forEach( (el, indx) => {
      if(indx !== 0 && selectedUsersIndx.includes(indx))
      //@ts-ignore
      selectedUsersEmail.push(el.children.item(1)?.textContent)
    })
  })

  return selectedUsersEmail
}

const checkRandomRows = () :Array<number> => {

  const rndInt = Math.floor(Math.random() * 3) + 2 // either odd or even

  const selectedUsersIndx: Array<number> = []
  cy.get('[data-cy="space-unit-users"]').find('.checkbox input[type="checkbox"]').each( (chk, i) => {
    if(i !== 0 && i % rndInt){
      cy.wrap(chk).click()
      selectedUsersIndx.push(i)
    }
  })
  return selectedUsersIndx
}

const goFirstPageInTable = (pages: number) => {
  while(pages > 1){
    cy.get('[data-cy="space-unit-users"]').find('.pagination-previous').click()
    pages--
  }
}

const c = (ch: string) => ch.charAt(0).toUpperCase() + ch.slice(1)
