const { defineConfig } = require('cypress')

const dotenv = require('dotenv')

dotenv.config({ path: process.env.ENV_PATH })

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: `http://${process.env.HOST}:${process.env.PORT}`,
  },
  env: {
    ADMIN_MAIL: process.env.INIT_ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.INIT_ADMIN_PASSWORD,
    VERSION: process.env.VERSION,
  },
})
