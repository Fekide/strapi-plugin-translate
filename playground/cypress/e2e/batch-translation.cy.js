describe('batch translation', () => {
  beforeEach(() => {
    cy.exec('npm run reset')
  })

  it('should translate all articles', () => {
    cy.intercept('/translate/batch').as('batchTranslateExecution')
    cy.intercept('/translate/report').as('translateReport')

    // Login and Navigate to Translate Page
    cy.login()
    cy.get('nav').contains('Translate').click()

    cy.wait('@translateReport')

    // Start batch translation

    cy.get('button[data-cy="api::article.article.de.translate"]').focus()
    cy.get('button[data-cy="api::article.article.de.translate"]').click()

    // Complete dialog
    cy.get('div[role=dialog] div[role=combobox]')
      .filter(':contains("English (en)")')
      .should('be.visible')

    cy.get('div[role=dialog] button')
      .filter(':contains("Translate")')
      .click()

    // Verify translation finished

    cy.wait('@translateReport')

    cy.get('[data-cy="api::article.article.de"]')
      .contains('Job finished')
      .should('exist')
    cy.get('[data-cy="api::article.article.de"]')
      .contains('complete')
      .should('exist')
  })

  it('should translate and publish all articles', () => {
    cy.intercept('/translate/batch').as('batchTranslateExecution')
    cy.intercept('/translate/report').as('translateReport')

    // Login and Navigate to Translate Page
    cy.login()
    cy.get('nav').contains('Translate').click()

    cy.wait('@translateReport')

    // Start batch translation

    cy.get('button[data-cy="api::article.article.de.translate"]').focus()
    cy.get('button[data-cy="api::article.article.de.translate"]').click()

    // Complete dialog
    cy.get('div[role=dialog] div[role=combobox]')
      .filter(':contains("English (en)")')
      .should('be.visible')
    cy.get('input[name=auto-publish]').click()
    cy.get('div[role=dialog] button')
      .filter(':contains("Translate")')
      .click()

    // Verify translation finished

    cy.wait('@translateReport')

    cy.get('[data-cy="api::article.article.de"]')
      .contains('Job finished')
      .should('exist')
    cy.get('[data-cy="api::article.article.de"]')
      .contains('complete')
      .should('exist')
  })
})
