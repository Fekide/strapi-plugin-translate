'use strict'

const { getService } = require('../utils/get-service')

module.exports = () => ({
  async usage(ctx) {
    const data = await getService('provider').usage()
    ctx.body = { data }
  },
})
