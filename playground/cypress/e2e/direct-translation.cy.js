describe('direct translation', () => {
  beforeEach(() => {
    cy.exec('npm run reset')
  })

  it('single article', () => {
    cy.intercept('/translate/entity').as('translateExecution')

    // Login and Navigate to article
    cy.login()
    cy.get('nav').contains('Content Manager').click()
    cy.contains('A bug is becoming a meme on the internet').click()

    // Go to page for creating German locale
    cy.get('div[aria-label=Locales]').click()
    cy.contains('German (de)').click()

    // Translate from English
    cy.contains('Translate from another locale').click()
    cy.contains('button', 'Yes, fill in').click()
    cy.wait('@translateExecution')
    cy.wait(1000)

    // Save and Publish
    cy.contains('button', 'Save').click()
    cy.contains('Saved document').should('be.visible')
    cy.wait(1000)
    cy.contains('button', 'Publish').click()
    cy.contains('Published document').should('be.visible')

    // Verify
    cy.contains('span', 'Sarah Baker').should('be.visible')
    cy.contains('span', 'tech').should('not.exist')
  })

  it('category and article', () => {
    cy.intercept('/translate/entity').as('translateExecution')

    // Login and Navigate to article
    cy.login()
    cy.get('nav').contains('Content Manager').click()

    cy.get('nav[aria-label="Content Manager"]').contains('Category').click()

    cy.contains('tech').click()

    // Go to page for creating German locale
    cy.get('div[aria-label=Locales]').click()
    cy.contains('German (de)').click()

    // Translate from English
    cy.contains('Translate from another locale').click()
    cy.contains('button', 'Yes, fill in').click()
    cy.wait('@translateExecution')
    cy.wait(1000)

    // Save
    cy.contains('button', 'Save').click()
    cy.contains('Saved document').should('be.visible')
    cy.wait(1000)

    cy.get('nav[aria-label="Content Manager"]').contains('Article').click()

    // Switch back to English
    cy.get('div[aria-label="Select a locale"]').click()
    cy.contains('English (en)').click()

    cy.contains('A bug is becoming a meme on the internet').click()

    // Go to page for creating German locale
    cy.get('div[aria-label=Locales]').click()
    cy.contains('German (de)').click()

    // Translate from English
    cy.contains('Translate from another locale').click()
    cy.contains('button', 'Yes, fill in').click()
    cy.wait('@translateExecution')
    cy.wait(1000)

    // Save and Publish
    cy.contains('button', 'Save').click()
    cy.contains('Saved document').should('be.visible')
    cy.wait(2000)
    cy.contains('button', 'Publish').click()
    cy.contains('Published document').should('be.visible')

    // Verify
    cy.contains('span', 'Sarah Baker').should('be.visible')
    cy.contains('span', 'tech').should('be.visible')
  })

  it('single type with components', () => {
    cy.intercept('/translate/entity').as('translateExecution')

    // Login and Navigate to article
    cy.login()
    cy.get('nav').contains('Content Manager').click()

    cy.get('nav[aria-label="Content Manager"]').contains('Homepage').click()

    // Go to page for creating German locale
    cy.get('div[aria-label=Locales]').click()
    cy.contains('German (de)').click()

    // Translate from English
    cy.contains('Translate from another locale').click()
    cy.contains('button', 'Yes, fill in').click()
    cy.wait('@translateExecution')
    cy.wait(1000)

    // Save
    cy.contains('button', 'Save').click()
    cy.contains('Saved document').should('be.visible')

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

    cy.contains('"subtitle"').should('be.visible')

    cy.contains(
      'This is a blog post about the latest news in the world. Stay tuned!'
    ).should('be.visible')
    cy.contains('We will talk about the latest tech news, stay tuned!').should(
      'be.visible'
    )

    cy.contains('button', 'Save').should('be.disabled')
  })

  it('single type with relation in component', () => {
    cy.intercept('/translate/entity').as('translateExecution')

    // Login
    cy.login()

    // Translate all categories
    cy.getAllSessionStorage().then((result) => {
      cy.request({
        method: 'POST',
        url: '/translate/batch',
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

    cy.get('nav[aria-label="Content Manager"]')
      .contains('Categories Page')
      .click()

    // Go to page for creating German locale
    cy.get('div[aria-label=Locales]').click()
    cy.contains('German (de)').click()

    // Translate from English
    cy.contains('Translate from another locale').click()
    cy.contains('button', 'Yes, fill in').click()
    cy.wait('@translateExecution')
    cy.wait(1000)

    // Save
    cy.contains('button', 'Save').click()
    cy.contains('Saved document').should('be.visible')

    // Verify
    cy.contains('button', 'News').click()
    cy.contains('span', 'news')
    cy.contains('button', 'Save').should('be.disabled')
  })
})
