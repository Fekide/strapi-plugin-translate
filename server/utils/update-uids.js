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
        const onTranslate = _.get(
          attributeSchema,
          ['pluginOptions', 'deepl', 'translate'],
          'translate'
        )
        switch (onTranslate) {
          case 'translate':
            resultData[attr] = await strapi
              .service('plugin::content-manager.uid')
              .generateUIDField({
                contentTypeUID: contentTypeUid,
                field: attr,
                data,
              })
            break
          case 'delete':
            resultData[attr] = undefined
            break
          case 'copy':
          default:
            break
        }
      }
      return true
    })
  )
  return resultData
}

module.exports = {
  updateUids,
}
