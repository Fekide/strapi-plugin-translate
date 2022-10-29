'use strict'

/**
 *   controller
 */

const { createCoreController } = require('@strapi/strapi').factories

module.exports = createCoreController('plugin::translate.batch-translate-job')
