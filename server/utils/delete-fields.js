'use strict'

const _ = require('lodash')

/**
 * Return new data without all attributes that have the config option pluginOptions.deepl.translate=delete
 *
 * @param {object} data The data of the object to translate (required for arrays to skip empty props)
 * @param {object} schema The schema of the content type
 * @returns all attributes that can be translated
 */
function filterAllDeletedFields(data, schema) {
  const attributesSchema = _.get(schema, 'attributes', [])
  const { translatedFieldTypes } = strapi.config.get('plugin.deepl')
  const newData = _.cloneDeep(data)

  Object.keys(attributesSchema).map((attr) => {
    const fieldSchema = attributesSchema[attr]

    if (fieldSchema.pluginOptions?.i18n?.localized) {
      return filterDeletedFields(
        newData,
        fieldSchema,
        attr,
        translatedFieldTypes
      )
    }
  })

  return newData
}

/**
 * Unsets all attributes of data that have the config option pluginOptions.deepl.translate=delete
 *
 * @param {object} data The data at the current level
 * @param {object} schema The schema of the attribute
 * @param {string} attr The name of the attribute
 * @param {array} translatedFieldTypes The types of fields that are translated
 * @returns The attribute or a list of child attributes if this attribute is a component or a dynamic zone
 */
function filterDeletedFields(data, schema, attr, translatedFieldTypes) {
  const onTranslate = _.get(
    schema,
    'pluginOptions.deepl.translate',
    'translate'
  )
  if (
    translatedFieldTypes.includes(schema.type) &&
    _.get(data, attr, undefined)
  ) {
    if (onTranslate === 'translate') {
      if (schema.type == 'component') {
        const componenData = _.get(data, attr, undefined)
        recursiveComponentDeleteFields(
          schema,
          componenData,
          translatedFieldTypes,
          attr
        )
        if (componenData !== undefined) {
          data[attr] = componenData
        }
      } else if (schema.type == 'dynamiczone') {
        data[attr] = data[attr].map((object) => {
          recursiveComponentDeleteFields(
            schema,
            object,
            translatedFieldTypes,
            attr
          )
          return object
        })
      }
    } else if (onTranslate === 'delete') {
      _.unset(data, attr)
    }
  }
}

/**
 * Unsets all attributes of data that have the config option pluginOptions.deepl.translate=delete
 * @param {object} componentReference The schema of the component in the content-type or component (to know if it is repeated or not)
 * @param {object} data The data of the component
 * @param {array} translatedFieldTypes The types of fields that are translated
 */
function recursiveComponentDeleteFields(
  componentReference,
  data,
  translatedFieldTypes
) {
  const componentSchema =
    componentReference.type == 'dynamiczone'
      ? strapi.components[data.__component]
      : strapi.components[componentReference.component]

  const attributesSchema = _.get(componentSchema, 'attributes', [])

  Object.keys(attributesSchema).map((attr) => {
    const schema = attributesSchema[attr]

    if (componentReference.repeatable) {
      data.map((_value, index) =>
        filterDeletedFields(
          data,
          schema,
          `${index}.${attr}`,
          translatedFieldTypes
        )
      )
    }
    return filterDeletedFields(data, schema, attr, translatedFieldTypes)
  })
}

module.exports = {
  filterAllDeletedFields,
  filterDeletedFields,
  recursiveComponentDeleteFields,
}
