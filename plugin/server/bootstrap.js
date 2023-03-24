'use strict'

const _ = require('lodash')

const { actions } = require('./services/permissions/actions')
const { getService } = require('./utils/get-service')

const createProvider = (translateConfig) => {
  const providerName = _.toLower(translateConfig.provider)
  let provider

  if (providerName === 'dummy') {
    provider = require('./utils/dummy-provider')
  } else {
    let modulePath
    try {
      modulePath = require.resolve(`strapi-provider-translate-${providerName}`)
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        modulePath = providerName
      } else {
        throw error
      }
    }

    try {
      provider = require(modulePath)
    } catch (err) {
      throw new Error(`Could not load translate provider "${providerName}".`)
    }
  }

  return provider.init(
    translateConfig.providerOptions,
    translateConfig.settings
  )
}

module.exports = async ({ strapi }) => {
  const translateConfig = strapi.config.get('plugin.translate')
  strapi.plugin('translate').provider = createProvider(translateConfig)

  // Listen for updates to entries, mark them as updated
  strapi.db.lifecycles.subscribe({
    afterUpdate(event) {
      if (
        event?.result?.locale &&
        Array.isArray(event.result.localizations) &&
        event.result.localizations.length > 0 &&
        Object.keys(event.params.data).some(
          (key) => !['localizations', 'updatedAt', 'updatedBy'].includes(key)
        )
      ) {
        const groupID = [
          event.result.id,
          ...event.result.localizations.map(({ id }) => id),
        ]
          .sort()
          .join('-')
        getService('updated-entry').create({
          data: {
            contentType: event.model.uid,
            groupID,
            localesWithUpdates: [event.result.locale],
          },
        })
      }
    },
  })

  await strapi.admin.services.permission.actionProvider.registerMany(actions)
  await getService('translate').batchTranslateManager.bootstrap()
}
