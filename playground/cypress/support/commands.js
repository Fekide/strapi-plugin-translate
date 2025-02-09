// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', () => {
  cy.request('POST', '/admin/login', {
    email: Cypress.env('ADMIN_MAIL'),
    password: Cypress.env('ADMIN_PASSWORD'),
  }).then((result) => {
    cy.visit('/admin', {
      onBeforeLoad: (contentWindow) => {
        contentWindow.sessionStorage.setItem(
          'jwtToken',
          JSON.stringify(result.body.data.token)
        )
        contentWindow.sessionStorage.setItem(
          'userInfo',
          JSON.stringify(result.body.data.user)
        )
      },
    })
    verifyAdminPageHasLoaded()
  })
})
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

function verifyAdminPageHasLoaded(maxAttempts = 3, attempts = 0) {
  if (attempts > maxAttempts) {
    throw new Error('Timed out waiting for admin page to load correctly')
  }
  cy.get('h1').then(($heading) => {
    if (!$heading || !$heading.text().includes('Hello Admin')) {
      cy.reload()
      verifyAdminPageHasLoaded(maxAttempts, attempts + 1)
    }
  })
}
