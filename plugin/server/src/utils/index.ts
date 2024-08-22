'use strict'

import { cleanData } from './clean-data'
import { getService } from './get-service'
import * as lodashHelpers from './lodash-helpers'
import { populateAll } from './populate-all'
import * as translatableFields from './translatable-fields'
import { translateRelations } from './translate-relations'
import { updateUids } from './update-uids'

export default {
  cleanData,
  getService,
  ...lodashHelpers,
  populateAll,
  ...translatableFields,
  translateRelations,
  updateUids,
}
