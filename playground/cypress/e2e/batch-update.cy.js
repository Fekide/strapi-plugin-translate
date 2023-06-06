describe('batch update', () => {
  beforeEach(() => {
    cy.exec('yarn reset')
  })

  it('should add an update entry when a translated entity is updated', () => {
    cy.intercept('/translate/batch-translate').as('batchTranslateExecution')
    cy.intercept('/translate/batch-translate/content-types/').as(
      'batchTranslateContentTypes'
    )

    // Login and translate first category
    cy.login()
    cy.visit(
      '/admin/content-manager/collectionType/api::category.category/create?plugins[i18n][locale]=de&plugins[i18n][relatedEntityId]=1'
    )
    cy.get('#name').type('translation')
    cy.get('button[type=submit]').focus()
    cy.get('button[type=submit]').click()

    // Edit the category
    cy.get('#name').type('edited')
    cy.get('button[type=submit]').focus()
    cy.get('button[type=submit]').click()

    // Verify
    cy.visit('/admin/plugins/translate')

    cy.get('button[data-cy="api::category.category.update"]').should('exist')
  })
})
