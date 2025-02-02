import { Modules, UID } from '@strapi/strapi'
import { cloneDeep } from 'lodash'
import { keys } from './objects'

/**
 * Remove all uids from a content type
 * @param {object} data The data in with uids
 * @param {object} contentTypeUid The uid of the content type
 * @returns The input data without uids
 */
export function removeUids<TSchemaUID extends UID.ContentType>(
  data: Modules.Documents.Document<TSchemaUID>,
  contentTypeUid: TSchemaUID
) {
  const schema = strapi.contentTypes[contentTypeUid]
  const attributesSchema = schema['attributes']
  const resultData = cloneDeep(data)
  keys(attributesSchema).forEach(async (attr) => {
    if (attributesSchema[attr].type === 'uid') delete resultData[attr]
  })

  return resultData
}
