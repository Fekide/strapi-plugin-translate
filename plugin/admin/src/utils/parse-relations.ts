import { Data, Schema, UID } from '@strapi/strapi'
import { EditLayout } from '@strapi/content-manager/strapi-admin'
import _, { cloneDeep, flattenDeep, get, has, set, unset } from 'lodash'

/**
 * Function is copied from https://github.com/strapi/strapi/blob/v4.5.3/packages/core/admin/admin/src/content-manager/components/RelationInputDataManager/utils/getRelationLink.js
 * and lies under the MIT Expat License with  Copyright (c) 2015-present Strapi Solutions SAS
 * @param {*} targetModel
 * @param {*} documentId
 * @returns
 */
export function getRelationLink(targetModel: string, documentId?: string) {
  return `../collection-types/${targetModel}/${documentId ?? ''}`
}

/**
 * Function is copied from https://github.com/strapi/strapi/blob/v4.5.3/packages/core/admin/admin/src/content-manager/components/RelationInputDataManager/utils/normalizeRelations.js
 * and lies under the MIT Expat License with  Copyright (c) 2015-present Strapi Solutions SAS
 * @param {*} relation
 * @param {*} options
 * @returns
 */
const normalizeRelation = (
  relation: any,
  { mainFieldName, targetModel }: { mainFieldName: string; targetModel: string }
) => {
  const nextRelation = { ...relation }
  nextRelation.href = getRelationLink(targetModel, nextRelation.documentId)
  nextRelation.label = nextRelation[mainFieldName]
  return nextRelation
}

function parseRelation(
  data: Schema.Attribute.Value<Schema.Attribute.AnyAttribute>,
  relationEditLayout: any
) {
  if (!relationEditLayout) {
    // In this case, strapi is <4.5
    return data
  }
  const result = normalizeRelation(data, {
    mainFieldName: relationEditLayout.mainField.name,
    targetModel: relationEditLayout.attribute.targetModel,
  })
  return result
}

/**
 * @param data The data
 * @param schema The schema of the data
 * @param component The name of a component or null for the content type
 * @returns {{path: string, toOneRelation: boolean, mainField: string}[]}
 */
export default function parseRelations(
  data: Data.Entity,
  schema: {
    contentType: Schema.ContentType
    components: Schema.Components
    editLayout: EditLayout
  },
  component: UID.Component | null = null
) {
  const result: any = cloneDeep(data)

  const currentSchema = component
    ? schema.components[component]
    : schema.contentType
  const currentLayout = component
    ? schema.editLayout.components[component]
    : schema.editLayout

  Object.keys(currentSchema.attributes).forEach((attribute) => {
    const attributeData = currentSchema.attributes[attribute]

    if (has(result, attribute)) {
      const value = get(result, attribute)

      if (attributeData.type === 'relation') {
        const relationEditLayout = flattenDeep(currentLayout.layout).find(
          (editLayout) => editLayout.name == attribute
        )

        if (Array.isArray(value)) {
          unset(result, attribute)
          set(
            result,
            `${attribute}.connect`,
            value.map((r, index) => ({
              __temp_key__: `a${index}`,
              ...parseRelation(r, relationEditLayout),
            }))
          )
        } else {
          unset(result, attribute)
          set(
            result,
            `${attribute}.connect`,
            value
              ? [
                  {
                    __temp_key__: 'a0',
                    ...parseRelation(value, relationEditLayout),
                  },
                ]
              : []
          )
        }
      } else if (attributeData.type === 'component') {
        set(
          result,
          attribute,
          attributeData.repeatable
            ? value.map((c: Data.Component, index: number) => ({
                __temp_key__: `a${index}`,
                ...parseRelations(c, schema, attributeData.component),
              }))
            : parseRelations(value, schema, attributeData.component)
        )
      } else if (attributeData.type === 'dynamiczone' && Array.isArray(value)) {
        set(
          result,
          attribute,
          value.map((c, index) => ({
            __temp_key__: `a${index}`,
            ...parseRelations(c, schema, c.__component),
          }))
        )
      }
    }
  })

  return result
}
