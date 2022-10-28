'use strict'

const batchTranslateJob = require('./batch-translate-job')
const deepl = require('./deepl')
const translate = require('./translate')

module.exports = {
  'batch-translate-job': batchTranslateJob,
  deepl,
  translate,
}
