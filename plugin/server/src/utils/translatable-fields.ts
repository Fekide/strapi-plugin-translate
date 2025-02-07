import _, { get } from 'lodash'

import { flatten_and_compact } from './lodash-helpers'
import {
  isTranslatedFieldType,
  getFieldTypeFormat,
} from './translated-field-types'
import { ContentTypeSchema } from '@strapi/types/dist/struct'
import { Attribute } from '@strapi/types/dist/schema'
import { TranslatableField } from '@shared/types/utils'
import { Modules, UID } from '@strapi/strapi'

/**
 * Get the field or fields to translate of a content type
 *
 * @param {object} data The data of the object to translate (required for arrays to skip empty props)
 * @param {object} schema The schema of the content type
 * @returns all attributes that can be translated
 */
export async function getAllTranslatableFields<
  TSchemaUID extends UID.ContentType,
>(data: Modules.Documents.Document<TSchemaUID>, schema: ContentTypeSchema) {
  const attributesSchema = _.get(schema, 'attributes', [])
  return flatten_and_compact(
    await Promise.all(
      Object.keys(attributesSchema).map(async (attr) => {
        const fieldSchema = attributesSchema[attr]

        if (fieldSchema.pluginOptions?.i18n?.localized) {
          return getTranslateFields(data, fieldSchema, attr)
        }
        return null
      })
    )
  )
}

/**
 * Get the field or fields to translate of a single attribute
 *
 * @param {object} data The data at the current level
 * @param {object} schema The schema of the attribute
 * @param {string} attr The name of the attribute
 * @returns The attribute or a list of child attributes if this attribute is a component or a dynamic zone
 */
export async function getTranslateFields<TSchemaUID extends UID.ContentType>(
  data: Modules.Documents.Document<TSchemaUID>,
  schema: Attribute.AnyAttribute,
  attr: string
): Promise<Array<TranslatableField> | TranslatableField> {
  if (
    isTranslatedFieldType(schema.type) &&
    _.get(data, attr, undefined) &&
    !['copy', 'delete'].includes(
      get(schema.pluginOptions, 'translate.translate')
    )
  ) {
    if (schema.type == 'component') {
      return (
        await recursiveComponentFieldsToTranslate(
          schema as Attribute.Component,
          _.get(data, attr, undefined)
        )
      ).map(({ field, format }) => ({
        field: `${attr}.${field}`,
        format,
      }))
    } else if (schema.type == 'dynamiczone') {
      return flatten_and_compact(
        await Promise.all(
          data[attr].map(async (object, index) => {
            return (
              await recursiveComponentFieldsToTranslate(schema, object)
            ).map(({ field, format }) => ({
              field: `${attr}.${index}.${field}`,
              format,
            }))
          })
        )
      )
    } else {
      const fieldData = _.get(data, attr, undefined)
      if (typeof fieldData === 'string' && fieldData.trim() === '') {
        return null
      }
      return {
        field: attr,
        format: getFieldTypeFormat(schema.type),
      }
    }
  }
  return null
}

/**
 *
 * @param {object} componentReference The schema of the component in the content-type or component (to know if it is repeated or not)
 * @param {object} data The data of the component
 * @returns A list of attributes to translate for this component
 */
export async function recursiveComponentFieldsToTranslate<
  TSchemaUID extends UID.Component,
>(
  componentReference: Attribute.Component | Attribute.DynamicZone,
  data: Modules.Documents.Document<TSchemaUID>
) {
  const componentSchema =
    componentReference.type == 'dynamiczone'
      ? strapi.components[data['__component']]
      : strapi.components[componentReference.component]

  const attributesSchema = _.get(componentSchema, 'attributes', [])
  let translateFields = await Promise.all(
    Object.keys(attributesSchema).map(async (attr) => {
      const schema = attributesSchema[attr]

      if (componentReference['repeatable'] && Array.isArray(data)) {
        return flatten_and_compact(
          await Promise.all(
            data.map(async (_value, index) =>
              getTranslateFields(data, schema, `${index}.${attr}`)
            )
          )
        )
      }
      return getTranslateFields(data, schema, attr)
    })
  )
  return flatten_and_compact(translateFields)
}
