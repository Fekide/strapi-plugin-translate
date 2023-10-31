describe('direct translation', () => {
  beforeEach(() => {
    cy.exec('yarn reset')
  })

  it('single article', () => {
    cy.intercept('/translate/translate').as('translateExecution')

    // Login and Navigate to article
    cy.login()
    cy.get('nav').contains('Content Manager').click()
    cy.contains('A bug is becoming a meme on the internet').click()

    // Go to page for creating German locale
    cy.contains('label', 'Locales')
      .invoke('attr', 'for')
      .then((id) => {
        cy.get(`[id='${id}']`)
      })
      .click()
    cy.contains('German (de)').click()

    // Translate from English
    cy.contains('Translate from another locale').click()
    cy.contains('button', 'Yes, fill in').click()
    cy.wait('@translateExecution')

    // Update UID
    cy.contains('label', 'slug')
      .invoke('attr', 'for')
      .then((id) => {
        cy.get(`[id='${id}']`)
      })
      .clear()
      .type('a-bug-is-becoming-a-meme-on-the-internet-1')

    // Save and Publish
    cy.contains('button', 'Save').click()
    cy.contains('button', 'Publish').click()

    // Verify
    cy.contains('button', 'Unpublish').should('be.visible')
    cy.contains('span', 'Sarah Baker').should('be.visible')
    cy.contains('span', 'tech').should('not.exist')
  })

  it('category and article', () => {
    cy.intercept('/translate/translate').as('translateExecution')

    // Login and Navigate to article
    cy.login()
    cy.get('nav').contains('Content Manager').click()

    cy.get('nav[aria-label=Content]').contains('Category').click()

    cy.contains('tech').click()

    // Go to page for creating German locale
    cy.contains('label', 'Locales')
      .invoke('attr', 'for')
      .then((id) => {
        cy.get(`[id='${id}']`)
      })
      .click()
    cy.contains('German (de)').click()

    // Translate from English
    cy.contains('Translate from another locale').click()
    cy.contains('button', 'Yes, fill in').click()
    cy.wait('@translateExecution')

    // Update UID
    cy.contains('label', 'slug')
      .invoke('attr', 'for')
      .then((id) => {
        cy.get(`[id='${id}']`)
      })
      .clear()
      .type('tech-1')

    // Save
    cy.contains('button', 'Save').click()

    cy.get('nav[aria-label=Content]').contains('Article').click()

    cy.contains('A bug is becoming a meme on the internet').click()

    // Go to page for creating German locale
    cy.contains('label', 'Locales')
      .invoke('attr', 'for')
      .then((id) => {
        cy.get(`[id='${id}']`)
      })
      .click()
    cy.contains('German (de)').click()

    // Translate from English
    cy.contains('Translate from another locale').click()
    cy.contains('button', 'Yes, fill in').click()
    cy.wait('@translateExecution')

    // Regenerate UID
    cy.contains('label', 'slug')
      .invoke('attr', 'for')
      .then((id) => {
        cy.get(`[id='${id}']`)
      })
      .clear()
      .type('a-bug-is-becoming-a-meme-on-the-internet-1')

    // Save and Publish
    cy.contains('button', 'Save').click()
    cy.contains('button', 'Publish').click()

    // Verify
    cy.contains('button', 'Unpublish').should('be.visible')
    cy.contains('span', 'Sarah Baker').should('be.visible')
    cy.contains('span', 'tech').should('be.visible')
  })

  it('single type with components', () => {
    cy.intercept('/translate/translate').as('translateExecution')
    cy.intercept('/content-manager/uid/check-availability').as('regenerateUID')

    // Login and Navigate to article
    cy.login()
    cy.get('nav').contains('Content Manager').click()

    cy.get('nav[aria-label=Content]').contains('Homepage').click()

    // Go to page for creating German locale
    cy.contains('label', 'Locales')
      .invoke('attr', 'for')
      .then((id) => {
        cy.get(`[id='${id}']`)
      })
      .click()
    cy.contains('German (de)').click()

    // Translate from English
    cy.contains('Translate from another locale').click()
    cy.contains('button', 'Yes, fill in').click()
    cy.wait('@translateExecution')

    // Save
    cy.contains('button', 'Save').click()

    // Verify
    cy.contains('label', 'metaTitle')
      .invoke('attr', 'for')
      .then((id) => {
        cy.get(`[id='${id.replace('.', '\\.')}']`)
      })
      .should('have.value', 'My personal Strapi blog')
    cy.contains('label', 'shareImage')
      .invoke('attr', 'for')
      .then((id) => {
        cy.get(`[id='${id}']`)
      })
      .get('img')
      .should('be.visible')
    cy.contains('button', 'Save').should('be.disabled')
  })

  it('single type with relation in component', () => {
    cy.intercept('/translate/translate').as('translateExecution')

    // Login
    cy.login()

    // Translate all categories
    cy.getAllSessionStorage().then((result) => {
      cy.request({
        method: 'POST',
        url: '/translate/batch-translate',
        body: {
          contentType: 'api::category.category',
          sourceLocale: 'en',
          targetLocale: 'de',
          autoPublish: true,
        },
        auth: {
          bearer: JSON.parse(result[Cypress.config().baseUrl].jwtToken),
        },
      })
    })

    //Navigate to Categories page
    cy.get('nav').contains('Content Manager').click()

    cy.get('nav[aria-label=Content]').contains('Categories Page').click()

    // Go to page for creating German locale
    cy.contains('label', 'Locales')
      .invoke('attr', 'for')
      .then((id) => {
        cy.get(`[id='${id}']`)
      })
      .click()
    cy.contains('German (de)').click()

    // Translate from English
    cy.contains('Translate from another locale').click()
    cy.contains('button', 'Yes, fill in').click()
    cy.wait('@translateExecution')

    // Save
    cy.contains('button', 'Save').click()

    // Verify
    cy.contains('button', 'News').click()
    cy.contains('span', 'news')
    cy.contains('button', 'Save').should('be.disabled')
  })
})
