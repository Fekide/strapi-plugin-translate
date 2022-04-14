'use strict'

const getService = (name) => {
  return strapi.plugin('deepl').service(name)
}

module.exports = {
  getService,
}
