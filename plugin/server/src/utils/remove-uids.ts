'use strict'

import { get, cloneDeep } from 'lodash'

/**
 * Remove all uids from a content type
 * @param {object} data The data in with uids
 * @param {object} contentTypeUid The uid of the content type
 * @returns The input data without uids
 */
export function removeUids(data, contentTypeUid) {
  const schema = strapi.contentTypes[contentTypeUid]
  const attributesSchema = get(schema, 'attributes', [])
  const resultData = cloneDeep(data)
  Object.keys(attributesSchema).forEach(async (attr) => {
    if (attributesSchema[attr].type === 'uid') delete resultData[attr]
  })

  return resultData
}
