 /// <reference types="Cypress" />

  // https://docs.cypress.io/api/introduction/api.html

  import { faker } from '@faker-js/faker';

  describe('My First Test', () => {
    it('Does not do much!', () => {
      expect(true).to.equal(true)
    })
  })

  /* describe( '=========End-to-End(E2E Testing)============', () => {
    beforeEach(() => {
      cy.visit("http://localhost:5174/users").viewport(1600,900).wait(4000);
      cy.url().should('contains', 'users');
    })

    let userfirstname = faker.name.firstName()
    let userlastname = faker.name.lastName()
    let email = faker.internet.email()
    // let mobile = faker.phone.number()
    let mobile = faker.phone.phoneNumber('+63 9## ### ####')

    it('===Should REGISTER NEW USER, SEARCH NEWLY ADDED USER [FirstName, LastName, Email, Mobile]===', () => {
      //==================Press ADD Button first =======================//
      // cy.get('.columns > :nth-child(1) > :nth-child(1)').click();
      cy.get('#addButton').click();

      //==================Registering Credentials=======================//
      // cy.get('.inputFirstNameForm').focus().clear() ------------------> Best Practice , Needs to edit main code
      cy.get('[style="width: 300px;"] > .control > .input').focus().clear()
      .click().type(userfirstname).wait(500);

      // cy.get('.inputLastNameForm').focus().clear() -------------------> Best Practice , Needs to edit main code
      cy.get('main > :nth-child(3) > .control > .input').focus().clear()
      .click().type(userlastname).wait(500);

      // cy.get('.inputEmailForm').focus().clear() ----------------------> Best Practice , Needs to edit main code
      cy.get('main > :nth-child(4) > .control > .input').focus().clear()
      .click().type(email).wait(500);

      // cy.get('.inputMobileForm').focus().clear() ---------------------> Best Practice , Needs to edit main code
      cy.get('main > :nth-child(5) > .control > .input').focus().clear()
      .click().type(mobile).wait(500);

      //==================Save Credentials=============================//
      //cy.get('#saveButton').click().wait(1000); ----------------------> Best Practice , Needs to edit main code
      cy.get('main > :nth-child(6)').click().wait(1000);
      cy.log('clicked Save').wait(500);

      //==================SEARCH Newly added User======================//
      // cy.get('inputSearchFirstName').focus(); ----------------------> Best Practice , Needs to edit main code
      cy.get(':nth-child(1) > .control > .input').focus()      
      .type(userfirstname).wait(500);
      // cy.get('rowInput > [data-label="Firstname"]').should('contain',userfirstname);--> Best Practice , Needs to edit main code
      cy.get(':nth-child(1) > [data-label="Firstname"]').should('contain',userfirstname);
      expect(true).to.be.true;                    
      cy.log('User ' + userfirstname +  ' found').wait(500);

      // cy.get('inputSearchFirstName').click().focus().clear()---------> Best Practice , Needs to edit main code
      cy.get(':nth-child(1) > .control > .input').click().focus().clear()
      //cy.get('inputSearchLastName').click().focus()-------------------> Best Practice , Needs to edit main code  
      cy.get(':nth-child(2) > :nth-child(2) > .control > .input').click().focus()   
      .type(userlastname).wait(500);
      cy.get('[data-label="Lastname"]').should('contain',userlastname);
      expect(true).to.be.true;  
      cy.log('User ' + userlastname +  ' found').wait(500);

      // ===================== EMAIL SEARCH ===========================//
      //cy.get('inputSearchLastName').click().focus().clear()----------> Best Practice , Needs to edit main code
      cy.get(':nth-child(2) > :nth-child(2) > .control > .input').click().focus().clear()
      //cy.get('inputSearchEmail').click().focus()---------------------> Best Practice , Needs to edit main code
      cy.get(':nth-child(2) > :nth-child(3) > .control > .input').click().focus()
      .type(email).wait(500)
      cy.get('[data-label="Email"]').should('contain',email);
      expect(true).to.be.true;                     
      cy.log( email +  ' found').wait(500);

      //===================== MOBILE # SEARCH ===========================//
      //cy.get('inputSearchEmail').click().focus().clear()---------------> Best Practice , Needs to edit main code
      cy.get(':nth-child(2) > :nth-child(3) > .control > .input').click().focus().clear()
      //cy.get('inputSearchMobile').click().focus()---------------------> Best Practice , Needs to edit main code
      cy.get(':nth-child(2) > :nth-child(4) > .control > .input').click().focus()
      .type(mobile).wait(500)
      cy.get('[data-label="Mobile"]').should('contain',mobile);
      expect(true).to.be.true;                    
      cy.log(mobile +  ' found').wait(500);
    });

    it('======== Should EDIT NEW USER ========' , () => {
      //==================EDIT Credentials=============================//
      cy.get(':nth-child(1) > [data-label="Actions"] > .button').click({multiple:true});
      cy.log('Currently on Edit Mode').wait(1000);
      cy.get('[style="width: 300px;"] > .control > .input').click().focus().clear()
      .type(userfirstname).wait(500);
      cy.get('main > :nth-child(6)').click();
      cy.log('User Data Successfully Edited');
      cy.contains(userfirstname);
      expect(true).to.be.true;                      
      cy.log('User '+ userfirstname+ ' was Successfully updated').wait(1000);
    });

    it('==Should Cancel User Creation and Delete NEWLY CREATED USER==' , () => {
      //==================Press ADD Button first =======================//
      cy.get('.columns > :nth-child(1) > :nth-child(1)').click();

      //=======Registering Credentials   >>>   CANCEL=====================//
      cy.get('[style="width: 300px;"] > .control > .input').focus().clear()
      .click().type(userfirstname).wait(1000);

      cy.get('main > :nth-child(3) > .control > .input').focus().clear()
      .click().type(userlastname).wait(1000);

      cy.get('main > :nth-child(4) > .control > .input').focus().clear()
      .click().type(email).wait(1000);                  

      cy.get('[data-test="button-cancel"]').click().wait(1000);          // Cancel Button (Click)
      cy.log('User Creation Cancelled').wait(4000);

      //=======Registering Credentials   >>>   DELETE ==================//
      cy.get('#addButton').click();                                         // Add Button (Click)
      cy.get('[style="width: 300px;"] > .control > .input').focus().clear()
      .click().type(userfirstname).wait(1000);

      cy.get('main > :nth-child(3) > .control > .input').focus().clear()
      .click().type(userlastname).wait(1000);

      cy.get('main > :nth-child(4) > .control > .input').focus().clear()
      .click().type(email).wait(1000);

      cy.get('main > :nth-child(5) > .control > .input').focus().clear()
      .click().type(mobile).wait(1000);

      cy.get('[data-test="button-save"]').click().wait(1000);                       
      cy.log('clicked Save').wait(2000);                                   // Save Button (Click)

      cy.get(':nth-child(1) > [data-label="Actions"] > .button').click().wait(1000); // Edit Button (Click)

      cy.get('[data-test="button-delete"]').click().wait(1000);
      cy.log('clicked Delete').wait(2000);                                // Delete Button (Click)
    });

    // it('========Should Press Next Page and  Scrolldown using realSwipe("toBottom") =====', () => {
    //   //============SCROLL-DOWN + Click Next Page x3==================//
    //   cy.get('body').realSwipe('toBottom').wait(1000);
    //   cy.get('.pagination').realHover({ position: "bottom" }).wait(1000).wait(1000);
    //   cy.get('.pagination-next').click({force:true}).wait(1000);
    //   cy.log('Next Page Clicked --once');
    //   cy.get('.info').should('contain','26-50').wait(2000);
    //   cy.get('.pagination').realHover({ position: "bottom" }).wait(1000).wait(1000);
    //   cy.get('.pagination-next').click({force:true}).wait(1000);
    //   cy.log('Next Page Clicked --twice');
    //   cy.get('.info').should('contain','51-75').wait(2000);
    //   cy.get('.pagination').realHover({ position: "bottom" }).wait(1000).wait(1000);
    //   cy.get('.pagination-next').click({force:true}).wait(1000);
    //   cy.log('Next Page Clicked --three times');
    //   cy.get('.info').should('contain','76-100').wait(2000);
    // });
  }) */
