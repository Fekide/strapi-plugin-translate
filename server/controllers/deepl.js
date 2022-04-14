'use strict'

const { getService } = require('../utils/get-service')

module.exports = () => ({
  async usage(ctx) {
    ctx.body = await getService('deepl').usage()
  },
})
