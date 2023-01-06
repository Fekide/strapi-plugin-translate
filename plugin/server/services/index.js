'use strict'

const batchTranslateJob = require('./batch-translate-job')
const chunks = require('./chunks')
const provider = require('./provider')
const translate = require('./translate')
const untranslated = require('./untranslated')
const format = require('./format')

module.exports = {
  'batch-translate-job': batchTranslateJob,
  provider,
  translate,
  untranslated,
  chunks,
  format,
}
