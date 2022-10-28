'use strict'

/**
 *  service.
 */

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('plugin::deepl.batch-translate-job')
