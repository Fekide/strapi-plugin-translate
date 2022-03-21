'use strict'

const _ = require('lodash')

/**
 * Create a populate object to populate all direct data:
 * - all components, dynamic zones and nested components
 * - from all relations only the ID (more is not necessary for translation)
 *
 * @param {object} schema The schema of the content type
 * @returns a populate object with all components, nested components,
 *  dynamic zones and relations
 */
function populateAll(schema) {
  const attributesSchema = _.get(schema, 'attributes', [])
  const populateResult = {}

  Object.keys(attributesSchema).forEach((attr) => {
    const fieldSchema = attributesSchema[attr]
    if (fieldSchema.type === 'component') {
      populateResult[attr] = {
        populate: recursiveComponentPopulate(fieldSchema.component),
      }
    } else if (fieldSchema.type === 'dynamiczone') {
      populateResult[attr] = {
        populate: fieldSchema.components.reduce((combined, component) => {
          return _.merge(combined, recursiveComponentPopulate(component))
        }, {}),
      }
    } else if (['relation', 'media'].includes(fieldSchema.type)) {
      populateResult[attr] = {
        select: ['id'],
      }
    }
  })
  if (Object.keys(populateResult).length == 0) {
    return true
  }
  return populateResult
}

/**
 *
 * @param {object} componentReference The schema of the component in the content-type or component (to know if it is repeated or not)
 * @param {object} data The data of the component
 * @param {array} translatedFieldTypes The types of fields that are translated
 * @returns A list of attributes to translate for this component
 */
function recursiveComponentPopulate(component) {
  const componentSchema = strapi.components[component]
  return populateAll(componentSchema)
}

module.exports = {
  populateAll,
}
