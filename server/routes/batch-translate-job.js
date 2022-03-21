'use strict'

/**
 *  router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories

module.exports = createCoreRouter('plugin::deepl.batch-translate-job')
