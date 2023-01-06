'use strict'

module.exports = ({ strapi }) => ({
  async usage() {
    return strapi.plugin('translate').provider.usage()
  },
})
