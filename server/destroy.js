'use strict'

const { getService } = require('./utils/get-service')

module.exports = async () => {
  // destroy phase
  await getService('translate').batchTranslateManager.destroy()
}
