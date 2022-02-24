'use strict'

const { actions } = require('./services/permissions/actions')

module.exports = async ({ strapi }) => {
  await strapi.admin.services.permission.actionProvider.registerMany(actions)
}
