'use strict'

import { get, cloneDeep, has, compact } from 'lodash'
import { getConfig } from './get-config'
import { UID } from '@strapi/strapi'
import { Struct, Schema } from '@strapi/strapi'

async function getRelevantLocalization(
  contentType: UID.Service,
  id: string,
  locale: string
) {
  const relationContent = await strapi
    .service(contentType)
    .findOne(id, { populate: 'localizations' })
  return relationContent.localizations.filter((l) => l.locale === locale)[0]
}

/**
 * Translate relations by either copying, deleting or using the corresponding locale
 * @param {object} data The data to translate
 * @param {object} schema The schema of the content-type
 * @param {string} targetLocale The target locale (iso-format)
 * @returns The input data with relations either
 *  - copied in the case they can be resued
 *  - deleted if they cannot be reused
 *  - translated if the relation target is localized and the related instance has the targetLocale created
 */
export async function translateRelations(
  data: unknown,
  schema: Struct.ContentTypeSchema | Struct.ComponentSchema,
  targetLocale: string
) {
  const { translateRelations: shouldTranslateRelations } = getConfig()

  const attributesSchema = get(schema, 'attributes', [])
  const resultData = cloneDeep(data)
  await Promise.all(
    Object.keys(attributesSchema).map(async (attr) => {
      if (attr === 'localizations') {
        return
      }

      const attributeData = get(data, attr, undefined)

      if (attributeData === null || attributeData === undefined) {
        return
      }

      const attributeSchema = attributesSchema[attr]

      const onTranslate = get(
        attributeSchema,
        ['pluginOptions', 'translate', 'translate'],
        'translate'
      )
      if (
        ['relation', 'component', 'dynamiczone'].includes(attributeSchema.type)
      ) {
        switch (onTranslate) {
          case 'copy':
            if (attributeSchema.type === 'relation') {
              resultData[attr] = shouldTranslateRelations
                ? await translateRelation(
                    attributeData,
                    attributeSchema,
                    targetLocale
                  )
                : undefined
            } else {
              resultData[attr] = attributeData
            }
            break
          case 'delete':
            resultData[attr] = undefined
            break
          case 'translate':
          default:
            if (attributeSchema.type === 'relation') {
              resultData[attr] = shouldTranslateRelations
                ? await translateRelation(
                    attributeData,
                    attributeSchema,
                    targetLocale
                  )
                : undefined
            } else if (attributeSchema.type === 'component') {
              resultData[attr] = await translateComponent(
                attributeData,
                attributeSchema,
                targetLocale
              )
            } else if (attributeSchema.type === 'dynamiczone') {
              resultData[attr] = await Promise.all(
                attributeData.map((object: unknown) =>
                  translateComponent(object, attributeSchema, targetLocale)
                )
              )
            }
            break
        }
      }
    })
  )
  return resultData
}

async function translateComponent(
  data: unknown,
  componentReference: Schema.Attribute.AnyAttribute,
  targetLocale
) {
  if (!data) {
    return undefined
  }
  const componentSchema =
    componentReference.type === 'dynamiczone'
      ? strapi.components[data['__component']]
      : strapi.components[componentReference['component']]
  if (componentReference['repeatable'] && Array.isArray(data)) {
    return Promise.all(
      data.map((value) =>
        translateRelations(value, componentSchema, targetLocale)
      )
    )
  }
  return translateRelations(data, componentSchema, targetLocale)
}

async function translateRelation(
  attributeData: unknown,
  attributeSchema: Schema.Attribute.Relation,
  targetLocale: string
) {
  const relationSchema = strapi.contentTypes[attributeSchema['target']]

  const relationIsLocalized = get(
    relationSchema,
    'pluginOptions.i18n.localized',
    false
  )

  const onTranslate = get(
    attributeSchema,
    'pluginOptions.translate.translate',
    'translate'
  )

  const relationIsBothWays =
    has(attributeSchema, 'inversedBy') || has(attributeSchema, 'mappedBy')

  if (onTranslate === 'delete') {
    return undefined
  }

  if (onTranslate === 'copy') {
    if (relationIsLocalized || relationIsBothWays) {
      return ['oneToMany', 'manyToMany'].includes(attributeSchema.relation)
        ? []
        : undefined
    } else {
      return attributeData
    }
  }

  // If the relation is localized, the relevant localizations from the relation should be selected
  if (relationIsLocalized) {
    // for oneToMany and manyToMany relations there are multiple relations possible, so all of them need to be considered
    if (
      ['oneToMany', 'manyToMany'].includes(attributeSchema.relation) &&
      Array.isArray(attributeData) &&
      attributeData.length > 0
    ) {
      return compact(
        await Promise.all(
          attributeData.map(async (prevRelation) =>
            getRelevantLocalization(
              attributeSchema['target'],
              prevRelation.id,
              targetLocale
            )
          )
        )
      )
    } else if (
      ['oneToOne', 'manyToOne'].includes(attributeSchema.relation) &&
      attributeData
    ) {
      return getRelevantLocalization(
        attributeSchema['target'],
        attributeData['id'],
        targetLocale
      )
    }
  } else if (
    relationIsBothWays &&
    ['oneToOne', 'oneToMany'].includes(attributeSchema.relation)
  ) {
    // In this case the relations in other locales or in the referenced relations would be deleted
    // so there is not really a different option than to not include these relations
    return attributeSchema.relation == 'oneToMany' ? [] : undefined
  }
  return attributeData
}
