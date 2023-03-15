// const { resetStrapi } = require('../utils/strapi')

describe('translate directly', () => {
  beforeEach(() => {
    cy.exec('yarn reset')
  })

  it('single article', () => {
    cy.intercept('/translate/translate').as('translateExecution')
    cy.intercept('/content-manager/uid/check-availability').as('regenerateUID')

    // Login and Navigate to article
    cy.login('admin@example.com', 'admin')
    cy.get('nav').contains('Content Manager').click()
    cy.contains('A bug is becoming a meme on the internet').click()

    // Go to page for creating German locale
    cy.contains('label', 'Locales')
      .invoke('attr', 'for')
      .then((id) => {
        cy.get('#' + id)
      })
      .click()
    cy.contains('German (de)').click()

    // Translate from English
    cy.contains('Translate from another locale').click()
    cy.contains('button', 'Yes, fill in').click()
    cy.wait('@translateExecution')

    // Regenerate UID
    cy.get('button[aria-label=regenerate]').click()
    cy.wait('@regenerateUID')

    // Save and Publish
    cy.contains('button', 'Save').click()
    cy.contains('button', 'Publish').click()

    // Verify
    cy.contains('button', 'Unpublish').should('be.visible')
    cy.contains('span', 'Sarah Baker').should('be.visible')
    cy.contains('span', 'tech').should('not.exist')
  })
})
