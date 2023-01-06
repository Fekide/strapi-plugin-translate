'use strict'

const _ = require('lodash')
const { isTranslatedFieldType } = require('./translated-field-types')

/**
 * Return new data without all attributes that have the config option pluginOptions.translate.translate=delete
 *
 * @param {object} data The data of the object to translate (required for arrays to skip empty props)
 * @param {object} schema The schema of the content type
 * @returns all attributes that can be translated
 */
function filterAllDeletedFields(data, schema) {
  const attributesSchema = _.get(schema, 'attributes', [])
  const newData = _.cloneDeep(data)

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
 * @param {object} schema The schema of the attribute
 * @param {string} attr The name of the attribute
 * @returns The attribute or a list of child attributes if this attribute is a component or a dynamic zone
 */
function filterDeletedFields(data, schema, attr) {
  const onTranslate = _.get(
    schema,
    'pluginOptions.translate.translate',
    'translate'
  )
  if (isTranslatedFieldType(schema.type) && _.get(data, attr, undefined)) {
    if (onTranslate === 'translate') {
      if (schema.type == 'component') {
        const componenData = _.get(data, attr, undefined)
        recursiveComponentDeleteFields(schema, componenData, attr)
        if (componenData !== undefined) {
          data[attr] = componenData
        }
      } else if (schema.type == 'dynamiczone') {
        data[attr] = data[attr].map((object) => {
          recursiveComponentDeleteFields(schema, object, attr)
          return object
        })
      }
    } else if (onTranslate === 'delete') {
      _.unset(data, attr)
    }
  }
}

/**
 * Unsets all attributes of data that have the config option pluginOptions.translate.translate=delete
 * @param {object} componentReference The schema of the component in the content-type or component (to know if it is repeated or not)
 * @param {object} data The data of the component
 */
function recursiveComponentDeleteFields(componentReference, data) {
  const componentSchema =
    componentReference.type == 'dynamiczone'
      ? strapi.components[data.__component]
      : strapi.components[componentReference.component]

  const attributesSchema = _.get(componentSchema, 'attributes', [])

  Object.keys(attributesSchema).map((attr) => {
    const schema = attributesSchema[attr]

    if (componentReference.repeatable) {
      data.map((_value, index) =>
        filterDeletedFields(data, schema, `${index}.${attr}`)
      )
    }
    return filterDeletedFields(data, schema, attr)
  })
}

module.exports = {
  filterAllDeletedFields,
  filterDeletedFields,
  recursiveComponentDeleteFields,
}
