'use strict'

const _ = require('lodash')

function deleteInvalidFields(data, schema) {
  if (!data) {
    return data
  }
  const attributesSchema = _.get(schema, 'attributes', [])
  const invalidFields = _.difference(
    Object.keys(data),
    Object.keys(attributesSchema)
  )
  invalidFields.forEach((field) => {
    if (field !== '__component') {
      delete data[field]
    }
  })
}

/**
 * Clean the data based on the schema to only include fields for input and flatten relations
 * @param {object} data The data to clean
 * @param {object} schema The schema of the content-type
 * @returns The input data with invalid fields (like id or localizations) removed
 */
function cleanData(data, schema) {
  const resultData = _.cloneDeep(data)

  deleteInvalidFields(resultData, schema)

  const attributesSchema = _.get(schema, 'attributes', [])

  Object.keys(attributesSchema).forEach((attr) => {
    const attributeSchema = attributesSchema[attr]

    if (!_.has(data, attr)) {
      return
    }

    if (attributeSchema.type === 'component') {
      resultData[attr] = cleanComponent(
        _.get(data, attr, undefined),
        attributeSchema
      )
    } else if (attributeSchema.type === 'dynamiczone') {
      resultData[attr] = _.get(data, attr, []).map((object) =>
        cleanComponent(object, attributeSchema)
      )
    } else if (attributeSchema.type === 'relation') {
      const relatedEntity = _.get(data, attr, [])
      if (Array.isArray(relatedEntity)) {
        resultData[attr] = relatedEntity.map((e) => e.id)
      } else if (relatedEntity) {
        resultData[attr] = relatedEntity.id
      }
    }
  })

  return resultData
}

function cleanComponent(data, componentReference) {
  if (!data) {
    return data
  }
  const componentSchema =
    componentReference.type === 'dynamiczone'
      ? strapi.components[data.__component]
      : strapi.components[componentReference.component]
  if (componentReference.repeatable) {
    return data.map((value) => cleanData(value, componentSchema))
  }
  return cleanData(data, componentSchema)
}

module.exports = {
  cleanData,
}
