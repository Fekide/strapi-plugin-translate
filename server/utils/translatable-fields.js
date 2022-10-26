'use strict'

const _ = require('lodash')

const { flatten_and_compact } = require('./lodash-helpers')

/**
 * Get the field or fields to translate of a content type
 *
 * @param {object} data The data of the object to translate (required for arrays to skip empty props)
 * @param {object} schema The schema of the content type
 * @returns all attributes that can be translated
 */
async function getAllTranslatableFields(data, schema) {
  const attributesSchema = _.get(schema, 'attributes', [])
  const { translatedFieldTypes } = strapi.config.get('plugin.deepl')
  return flatten_and_compact(
    await Promise.all(
      Object.keys(attributesSchema).map(async (attr) => {
        const fieldSchema = attributesSchema[attr]

        if (fieldSchema.pluginOptions?.i18n?.localized) {
          return getTranslateFields(
            data,
            fieldSchema,
            attr,
            translatedFieldTypes
          )
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
 * @param {array} translatedFieldTypes The types of fields that are translated
 * @returns The attribute or a list of child attributes if this attribute is a component or a dynamic zone
 */
async function getTranslateFields(data, schema, attr, translatedFieldTypes) {
  if (
    translatedFieldTypes.includes(schema.type) &&
    _.get(data, attr, undefined) &&
    schema.pluginOptions?.deepl?.translate === 'translate'
  ) {
    if (schema.type == 'component') {
      return (
        await recursiveComponentFieldsToTranslate(
          schema,
          _.get(data, attr, undefined),
          translatedFieldTypes,
          attr
        )
      ).map((path) => `${attr}.${path}`)
    } else if (schema.type == 'dynamiczone') {
      return flatten_and_compact(
        await Promise.all(
          data[attr].map(async (object, index) => {
            return (
              await recursiveComponentFieldsToTranslate(
                schema,
                object,
                translatedFieldTypes,
                attr
              )
            ).map((path) => `${attr}.${index}.${path}`)
          })
        )
      )
    } else {
      return attr
    }
  }
  return null
}

/**
 *
 * @param {object} componentReference The schema of the component in the content-type or component (to know if it is repeated or not)
 * @param {object} data The data of the component
 * @param {array} translatedFieldTypes The types of fields that are translated
 * @returns A list of attributes to translate for this component
 */
async function recursiveComponentFieldsToTranslate(
  componentReference,
  data,
  translatedFieldTypes
) {
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
              getTranslateFields(
                data,
                schema,
                `${index}.${attr}`,
                translatedFieldTypes
              )
            )
          )
        )
      }
      return await getTranslateFields(data, schema, attr, translatedFieldTypes)
    })
  )
  return flatten_and_compact(translateFields)
}

module.exports = {
  getAllTranslatableFields,
  getTranslateFields,
  recursiveComponentFieldsToTranslate,
}
