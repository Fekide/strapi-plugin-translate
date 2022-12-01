import _ from 'lodash'
import { normalizeRelation } from '@strapi/admin/admin/src/content-manager/components/RelationInputDataManager/utils/normalizeRelations'

function parseRelation(data, metadata, relationEditLayout) {
  const result = normalizeRelation(data, {
    mainFieldName: metadata.edit.mainField.name,
    shouldAddLink: relationEditLayout.queryInfos.shouldDisplayRelationLink,
    targetModel: relationEditLayout.fieldSchema.targetModel,
  })

  return result
}

/**
 * @param data The data
 * @param allLayoutData The schema of the data
 * @param {null | string} component The name of a component or null for the content type
 * @returns {{path: string, toOneRelation: boolean, mainField: string}[]}
 */
export default function parseRelations(data, allLayoutData, component = null) {
  const result = _.cloneDeep(data)

  const layoutData = component
    ? allLayoutData.components[component]
    : allLayoutData.contentType

  Object.keys(layoutData.attributes).forEach((attribute) => {
    const attributeData = layoutData.attributes[attribute]

    if (_.has(result, attribute)) {
      const value = _.get(result, attribute)

      if (attributeData.type === 'relation') {
        const relationEditLayout = _.flatten(layoutData.layouts.edit).find(
          (editLayout) => editLayout.name == attribute
        )

        const metadata = layoutData.metadatas[attribute]

        if (Array.isArray(value)) {
          _.set(
            result,
            attribute,
            value.map((r) => parseRelation(r, metadata, relationEditLayout))
          )
        } else {
          _.set(
            result,
            attribute,
            parseRelation(value, metadata, relationEditLayout)
          )
        }
      } else if (attributeData.type === 'component') {
        _.set(
          result,
          attribute,
          parseRelations(value, allLayoutData, attributeData.component)
        )
      } else if (attributeData.type === 'dynamiczone' && Array.isArray(value)) {
        _.set(
          result,
          attribute,
          value.map((c) => parseRelations(c, allLayoutData, c.__component))
        )
      }
    }
  })

  return result
}
