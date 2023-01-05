'use strict'

const _ = require('lodash')

/**
 * Create a populate object to populate all direct data:
 * - all components, dynamic zones and nested components
 * - from all relations only the ID (more is not necessary for translation)
 *
 * @param {object} schema The schema of the content type
 * @param {object} options - options for recursion and population
 * @param {number} options.maxDepth - maximum depth for recursive population, defaults to 10
 * @param {boolean} options.populateMedia - whether to include media, defaults to false
 * @returns a populate object with all components, nested components,
 *  dynamic zones and relations
 */
function populateAll(
  schema,
  { maxDepth, populateMedia } = { maxDepth: 10, populateMedia: false }
) {
  const attributesSchema = _.get(schema, 'attributes', [])
  const populateResult = {}

  Object.keys(attributesSchema).forEach((attr) => {
    const fieldSchema = attributesSchema[attr]
    if (fieldSchema.type === 'component') {
      populateResult[attr] = {
        populate: recursiveComponentPopulate(fieldSchema.component, {
          maxDepth: maxDepth - 1,
          populateMedia,
        }),
      }
    } else if (fieldSchema.type === 'dynamiczone') {
      const dynamicZonePopulate = fieldSchema.components.reduce(
        (combined, component) => {
          return _.merge(
            combined,
            recursiveComponentPopulate(component, {
              maxDepth: maxDepth - 1,
              populateMedia,
            })
          )
        },
        {}
      )
      populateResult[attr] = {
        populate:
          Object.keys(dynamicZonePopulate).length == 0
            ? true
            : dynamicZonePopulate,
      }
    } else if (['relation', 'media'].includes(fieldSchema.type)) {
      if (fieldSchema.type === 'media' && populateMedia) {
        populateResult[attr] = true
      } else {
        populateResult[attr] = {
          select: ['id'],
        }
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
 * @param {object} options - options for recursion and population
 * @param {number} options.maxDepth - maximum recursive depth
 * @param {boolean} options.populateMedia - see {@link populateAll}
 * @returns A list of attributes to translate for this component
 */
function recursiveComponentPopulate(component, options) {
  const componentSchema = strapi.components[component]
  if (options.maxDepth == 0) {
    return true
  }
  return populateAll(componentSchema, options)
}

module.exports = {
  populateAll,
}
