import { get, cloneDeep, unset } from 'lodash'
import { isTranslatedFieldType } from './translated-field-types'
import { ContentTypeSchema, ComponentSchema } from '@strapi/types/dist/struct'
import { Attribute } from '@strapi/types/dist/schema'
import { Modules, UID } from '@strapi/strapi'

/**
 * Return new data without all attributes that have the config option pluginOptions.translate.translate=delete
 *
 * @param data The data of the object to translate (required for arrays to skip empty props)
 * @param {object} schema The schema of the content type
 * @returns all attributes that can be translated
 */
export function filterAllDeletedFields<TSchemaUID extends UID.ContentType>(
  data: Modules.Documents.Document<TSchemaUID>,
  schema: ContentTypeSchema | ComponentSchema
) {
  const attributesSchema = get(schema, 'attributes', [])
  const newData = cloneDeep(data)

  Object.keys(attributesSchema).map((attr) => {
    const fieldSchema = attributesSchema[attr]

    if (fieldSchema.pluginOptions?.i18n?.localized) {
      return filterDeletedFields(newData, fieldSchema, attr)
    }
  })

  return newData
}

/**
 * Unsets all attributes of data that have the config option pluginOptions.translate.translate=delete
 *
 * @param {object} data The data at the current level
 * @param {object} attribute The schema of the attribute
 * @param {string} attributeName The name of the attribute
 * @returns The attribute or a list of child attributes if this attribute is a component or a dynamic zone
 */
export function filterDeletedFields<TSchemaUID extends UID.ContentType>(
  data: Modules.Documents.Document<TSchemaUID>,
  attribute: Attribute.AnyAttribute,
  attributeName: string
) {
  const onTranslate = get(
    attribute,
    'pluginOptions.translate.translate',
    'translate'
  )
  if (
    isTranslatedFieldType(attribute.type) &&
    get(data, attributeName, undefined)
  ) {
    if (onTranslate === 'translate') {
      if (attribute.type == 'component') {
        const componenData = get(data, attributeName, undefined)
        recursiveComponentDeleteFields(
          attribute as Attribute.Component,
          componenData
        )
        if (componenData !== undefined) {
          data[attributeName] = componenData
        }
      } else if (attribute.type == 'dynamiczone') {
        data[attributeName] = data[attributeName].map((object: Modules.Documents.AnyDocument) => {
          recursiveComponentDeleteFields(attribute, object)
          return object
        })
      }
    } else if (onTranslate === 'delete') {
      unset(data, attributeName)
    }
  }
}

/**
 * Unsets all attributes of data that have the config option pluginOptions.translate.translate=delete
 * @param {object} componentReference The schema of the component in the content-type or component (to know if it is repeated or not)
 * @param {object} data The data of the component
 */
export function recursiveComponentDeleteFields<TSchemaUID extends UID.
Component>(
  componentReference: Attribute.Component | Attribute.DynamicZone,
  data: Modules.Documents.Document<TSchemaUID>
) {
  const componentSchema =
    componentReference.type == 'dynamiczone'
      ? strapi.components[data['__component']]
      : strapi.components[componentReference.component]

  const attributesSchema = get(componentSchema, 'attributes', [])

  Object.keys(attributesSchema).map((attr) => {
    const schema = attributesSchema[attr]

    if (componentReference['repeatable'] && Array.isArray(data)) {
      data.map((_value, index) =>
        filterDeletedFields(data, schema, `${index}.${attr}`)
      )
    }
    return filterDeletedFields(data, schema, attr)
  })
}
