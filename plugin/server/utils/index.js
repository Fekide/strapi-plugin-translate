'use strict'

const { cleanData } = require('./clean-data')
const deepl = require('./deepl-api')
const { getService } = require('./get-service')
const lodashHelpers = require('./lodash-helpers')
const { populateAll } = require('./populate-all')
const translatableFields = require('./translatable-fields')
const { translateRelations } = require('./translate-relations')
const { updateUids } = require('./update-uids')

module.exports = {
  cleanData,
  deepl,
  getService,
  ...lodashHelpers,
  populateAll,
  ...translatableFields,
  translateRelations,
  updateUids,
}
