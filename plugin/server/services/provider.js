'use strict'

module.exports = ({ strapi }) => ({
  async usage() {
    if (typeof strapi.plugin('translate').provider.usage !== 'function') {
      return undefined
    }
    return strapi.plugin('translate').provider.usage()
  },
})
