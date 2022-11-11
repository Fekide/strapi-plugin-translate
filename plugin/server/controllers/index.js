'use strict'

const batchTranslateJob = require('./batch-translate-job')
const provider = require('./provider')
const translate = require('./translate')

module.exports = {
  'batch-translate-job': batchTranslateJob,
  provider,
  translate,
}
