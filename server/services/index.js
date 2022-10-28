'use strict'

const batchTranslateJob = require('./batch-translate-job')
const deepl = require('./deepl')
const translate = require('./translate')
const untranslated = require('./untranslated')

module.exports = {
  'batch-translate-job': batchTranslateJob,
  deepl,
  translate,
  untranslated,
}
