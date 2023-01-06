'use strict'

const getService = (name) => {
  return strapi.plugin('translate').service(name)
}

module.exports = {
  getService,
}
