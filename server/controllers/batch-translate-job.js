'use strict'

/**
 *   controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController('plugin::deepl.batch-translate-job')
