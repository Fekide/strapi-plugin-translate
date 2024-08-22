import _ from 'lodash'

export const PUBLICATION_STATES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
}

/**
 * Function is copied from https://github.com/strapi/strapi/blob/v4.5.3/packages/core/admin/admin/src/content-manager/components/RelationInputDataManager/utils/getRelationLink.js
 * and lies under the MIT Expat License with  Copyright (c) 2015-present Strapi Solutions SAS
 * @param {*} targetModel
 * @param {*} id
 * @returns
 */
export function getRelationLink(targetModel, id) {
  return `/content-manager/collectionType/${targetModel}/${id ?? ''}`
}

/**
 * Function is copied from https://github.com/strapi/strapi/blob/v4.5.3/packages/core/admin/admin/src/content-manager/components/RelationInputDataManager/utils/normalizeRelations.js
 * and lies under the MIT Expat License with  Copyright (c) 2015-present Strapi Solutions SAS
 * @param {*} relation
 * @param {*} options
 * @returns
 */
const normalizeRelation = (
  relation,
  { shouldAddLink, mainFieldName, targetModel }
) => {
  const nextRelation = { ...relation }

  if (shouldAddLink) {
    nextRelation.href = getRelationLink(targetModel, nextRelation.id)
  }

  nextRelation.publicationState = false

  if (nextRelation?.publishedAt !== undefined) {
    nextRelation.publicationState = nextRelation.publishedAt
      ? PUBLICATION_STATES.PUBLISHED
      : PUBLICATION_STATES.DRAFT
  }

  nextRelation.mainField = nextRelation[mainFieldName]

  return nextRelation
}

function parseRelation(data, metadata, relationEditLayout) {
  if (!relationEditLayout) {
    // In this case, strapi is <4.5
    return data
  }
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
            value.map((r, index) => ({
              __temp_key__: `a${index}`,
              ...parseRelation(r, metadata, relationEditLayout),
            }))
          )
        } else {
          _.set(
            result,
            attribute,
            value
              ? [
                  {
                    __temp_key__: 'a0',
                    ...parseRelation(value, metadata, relationEditLayout),
                  },
                ]
              : []
          )
        }
      } else if (attributeData.type === 'component') {
        _.set(
          result,
          attribute,
          attributeData.repeatable
            ? value.map((c) =>
                parseRelations(c, allLayoutData, attributeData.component)
              )
            : parseRelations(value, allLayoutData, attributeData.component)
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
