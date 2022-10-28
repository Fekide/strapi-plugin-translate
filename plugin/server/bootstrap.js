'use strict'

const { actions } = require('./services/permissions/actions')
const { getService } = require('./utils/get-service')

module.exports = async ({ strapi }) => {
  await strapi.admin.services.permission.actionProvider.registerMany(actions)
  await getService('translate').batchTranslateManager.bootstrap()
}
