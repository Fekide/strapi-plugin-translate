// ...existing code...
'use strict'

const { cleanData } = require('../../utils/clean-data')
const {
  batchContentTypeUid,
  TRANSLATE_PRIORITY_BATCH_TRANSLATION,
} = require('../../utils/constants')
const { filterAllDeletedFields } = require('../../utils/delete-fields')
const { getService } = require('../../utils/get-service')
const { populateAll } = require('../../utils/populate-all')
const { getAllTranslatableFields } = require('../../utils/translatable-fields')
const { translateRelations } = require('../../utils/translate-relations')
const { updateUids } = require('../../utils/update-uids')

class BatchTranslateJob {
  // ...existing code...
}

module.exports = {
  BatchTranslateJob,
}
// ...existing code...
