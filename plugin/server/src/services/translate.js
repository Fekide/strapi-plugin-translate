const get = require('lodash/get');
const set = require('lodash/set');
const groupBy = require('lodash/groupBy');
const { getService } = require('../utils/get-service');
const { getAllTranslatableFields } = require('../utils/translatable-fields');
const { filterAllDeletedFields } = require('../utils/delete-fields');
const { cleanData } = require('../utils/clean-data');
const { TRANSLATE_PRIORITY_BATCH_TRANSLATION } = require('../utils/constants');
const { updateUids } = require('../utils/update-uids');
const { removeUids } = require('../utils/remove-uids');
const { BatchTranslateManager } = require('./batch-translate/BatchTranslateManager');

const translateService = ({ strapi }) => ({
  batchTranslateManager: new BatchTranslateManager(),
});

module.exports = translateService;
