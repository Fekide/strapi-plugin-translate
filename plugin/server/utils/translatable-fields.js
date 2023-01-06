'use strict'

const _ = require('lodash')

const { flatten_and_compact } = require('./lodash-helpers')
const {
  isTranslatedFieldType,
  getFieldTypeFormat,
} = require('./translated-field-types')

/**
 * Get the field or fields to translate of a content type
 *
 * @param {object} data The data of the object to translate (required for arrays to skip empty props)
 * @param {object} schema The schema of the content type
 * @returns all attributes that can be translated
 */
async function getAllTranslatableFields(data, schema) {
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
async function getTranslateFields(data, schema, attr) {
  if (
    isTranslatedFieldType(schema.type) &&
    _.get(data, attr, undefined) &&
    schema.pluginOptions?.translate?.translate === 'translate'
  ) {
    if (schema.type == 'component') {
      return (
        await recursiveComponentFieldsToTranslate(
          schema,
          _.get(data, attr, undefined),
          attr
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
              await recursiveComponentFieldsToTranslate(schema, object, attr)
            ).map(({ field, format }) => ({
              field: `${attr}.${index}.${field}`,
              format,
            }))
          })
        )
      )
    } else {
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
async function recursiveComponentFieldsToTranslate(componentReference, data) {
  const componentSchema =
    componentReference.type == 'dynamiczone'
      ? strapi.components[data.__component]
      : strapi.components[componentReference.component]

  const attributesSchema = _.get(componentSchema, 'attributes', [])
  let translateFields = await Promise.all(
    Object.keys(attributesSchema).map(async (attr) => {
      const schema = attributesSchema[attr]

      if (componentReference.repeatable) {
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

module.exports = {
  getAllTranslatableFields,
  getTranslateFields,
  recursiveComponentFieldsToTranslate,
}
