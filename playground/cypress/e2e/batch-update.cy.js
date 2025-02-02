describe('batch update', () => {
  beforeEach(() => {
    cy.exec('npm run reset')
  })

  it('should add an update entry when a translated entity is updated', () => {
    // Login and translate first category
    cy.login()
    cy.get('nav').contains('Content Manager').click()

    cy.get('nav[aria-label="Content Manager"]').contains('Category').click()

    cy.contains('tech').click()

    // Go to page for creating German locale
    cy.get('div[aria-label=Locales]').click()
    cy.contains('German (de)').click()

    // First translation
    cy.get('input[name=name]').type('translation')
    // Save
    cy.contains('button', 'Save').click()
    cy.contains('Saved document').should('be.visible')

    // Update the translation
    cy.get('input[name=name]').type('edited')
    // Save
    cy.contains('button', 'Save').click()
    cy.contains('Saved document').should('be.visible')

    // Verify
    cy.visit('/admin/plugins/translate')

    cy.get('button[data-cy="api::category.category.update"]').should('exist')
  })
})
