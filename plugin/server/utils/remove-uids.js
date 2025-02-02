'use strict'

const _ = require('lodash')

/**
 * Remove all uids from a content type
 * @param {object} data The data in with uids
 * @param {object} contentTypeUid The uid of the content type
 * @returns The input data without uids
 */
function removeUids(data, contentTypeUid) {
  const schema = strapi.contentTypes[contentTypeUid]
  const attributesSchema = _.get(schema, 'attributes', [])
  const resultData = _.cloneDeep(data)
  Object.keys(attributesSchema).forEach(async (attr) => {
    if (attributesSchema[attr].type === 'uid') delete resultData[attr]
  })

  return resultData
}

module.exports = {
  removeUids,
}
