import get from 'lodash/get';
import set from 'lodash/set';
import groupBy from 'lodash/groupBy';
import { getService } from '../utils/get-service.js';
import { getAllTranslatableFields } from '../utils/translatable-fields.js';
import { filterAllDeletedFields } from '../utils/delete-fields.js';
import { cleanData } from '../utils/clean-data.js';
import { TRANSLATE_PRIORITY_BATCH_TRANSLATION } from '../utils/constants.js';
import { updateUids } from '../utils/update-uids.js';
import { removeUids } from '../utils/remove-uids.js';
import { BatchTranslateManager } from './batch-translate.js';

const translateService = ({ strapi }) => ({
  batchTranslateManager: new BatchTranslateManager(),
  // ...existing code...
});

export default translateService;
