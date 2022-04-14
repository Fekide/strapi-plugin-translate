'use strict'

const _ = require('lodash')

/**
 * Update all uids of a content type using the built in generateUIDField functionality
 * @param {object} data The data in which to update the uids
 * @param {object} contentTypeUid The uid of the content type
 * @returns The input data with unique uids
 */
async function updateUids(data, contentTypeUid) {
  const schema = strapi.contentTypes[contentTypeUid]
  const attributesSchema = _.get(schema, 'attributes', [])
  const resultData = _.cloneDeep(data)
  await Promise.all(
    Object.keys(attributesSchema).map(async (attr) => {
      const attributeSchema = attributesSchema[attr]
      if (attributeSchema.type === 'uid') {
        resultData[attr] = await strapi
          .service('plugin::content-manager.uid')
          .generateUIDField({
            contentTypeUID: contentTypeUid,
            field: attr,
            data,
          })
      }
      return true
    })
  )
  return resultData
}

module.exports = {
  updateUids,
}
