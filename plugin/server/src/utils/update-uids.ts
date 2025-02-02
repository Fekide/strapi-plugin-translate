import { Modules, UID } from '@strapi/strapi'
import { get, cloneDeep } from 'lodash'

/**
 * Update all uids of a content type using the built in generateUIDField functionality
 * @param {object} data The data in which to update the uids
 * @param {object} contentTypeUid The uid of the content type
 * @returns The input data with unique uids
 */
export async function updateUids<TSchemaUID extends UID.ContentType>(
  data: Modules.Documents.Document<TSchemaUID>,
  contentTypeUid: TSchemaUID
) {
  const schema = strapi.contentTypes[contentTypeUid]
  const attributesSchema = get(schema, 'attributes', [] as const)
  const resultData = cloneDeep(data)
  await Promise.all(
    Object.keys(attributesSchema).map(async (attr) => {
      const attributeSchema = attributesSchema[attr]
      if (attributeSchema.type === 'uid') {
        const onTranslate = get(
          attributeSchema,
          ['pluginOptions', 'translate', 'translate'],
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
