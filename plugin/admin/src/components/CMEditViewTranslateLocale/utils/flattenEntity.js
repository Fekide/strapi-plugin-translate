import _ from 'lodash'

/**
 * @param data The data
 * @param allLayoutData The schema of the data
 * @param {null | string} component The name of a component or null for the content type
 * @returns {{[key: string]: {value: any, type: string}}}
 */
export default function flattenEntity(
  data,
  allLayoutData,
  component = null,
  prefix = '',
  componentIndex = null
) {
  const result = {}

  const layoutData = component
    ? allLayoutData.components[component]
    : allLayoutData.contentType

  if (data.__component) {
    result[`${prefix}__component`] = {
      value: data.__component,
      type: 'component',
    }
  }
  if (componentIndex !== null) {
    result[`${prefix}__temp_key__`] = {
      value: componentIndex,
      type: 'component',
    }
  }

  Object.keys(layoutData.attributes).forEach((attribute) => {
    const attributeData = layoutData.attributes[attribute]

    if (_.has(data, attribute)) {
      const value = _.get(data, attribute)

      if (attributeData.type === 'component') {
        _.assign(
          result,
          ...(attributeData.repeatable
            ? value.map((c, index) =>
                flattenEntity(
                  c,
                  allLayoutData,
                  attributeData.component,
                  `${prefix}${attribute}.${index}.`,
                  index
                )
              )
            : [
                flattenEntity(
                  value,
                  allLayoutData,
                  attributeData.component,
                  prefix + attribute + '.'
                ),
              ])
        )
      } else if (attributeData.type === 'dynamiczone' && Array.isArray(value)) {
        _.assign(
          result,
          ...value.map((c, index) =>
            flattenEntity(
              c,
              allLayoutData,
              c.__component,
              `${prefix}${attribute}.${index}.`,
              index
            )
          )
        )
      } else {
        result[prefix + attribute] = { value, type: attributeData.type }
      }
    }
  })

  return result
}
