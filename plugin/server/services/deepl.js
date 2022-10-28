'use strict'

const deepl = require('../utils/deepl-api')

module.exports = ({ strapi }) => ({
  async usage() {
    const { apiKey, freeApi } = strapi.config.get('plugin.deepl')
    return deepl.usage({
      auth_key: apiKey,
      free_api: freeApi,
    })
  },
})
