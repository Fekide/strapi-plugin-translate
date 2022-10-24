'use strict'

const _ = require('lodash')

async function getRelevantLocalization(contentType, id, locale) {
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
async function translateRelations(data, schema, targetLocale) {
  const { translateRelations: shouldTranslateRelations } =
    strapi.config.get('plugin.deepl')

  const attributesSchema = _.get(schema, 'attributes', [])
  const resultData = _.cloneDeep(data)
  await Promise.all(
    Object.keys(attributesSchema).map(async (attr) => {
      if (attr === 'localizations') {
        return
      }

      const attributeData = _.get(data, attr, undefined)

      if (attributeData === null || attributeData === undefined) {
        return
      }

      const attributeSchema = attributesSchema[attr]

      const onTranslate = _.get(
        attributeSchema,
        ['pluginOptions', 'deepl', 'translate'],
        'translate'
      )
      if (
        ['relation', 'component', 'dynamiczone'].includes(attributeSchema.type)
      ) {
        switch (onTranslate) {
          case 'translate':
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
                attributeData.map((object) =>
                  translateComponent(object, attributeSchema, targetLocale)
                )
              )
            }
            break
          case 'copy':
            resultData[attr] = _.get(data, attr, undefined)
            break
          case 'delete':
            resultData[attr] = undefined
            break
          default:
            break
        }
      }
    })
  )
  return resultData
}

async function translateComponent(data, componentReference, targetLocale) {
  if (!data) {
    return undefined
  }
  const componentSchema =
    componentReference.type === 'dynamiczone'
      ? strapi.components[data.__component]
      : strapi.components[componentReference.component]
  if (componentReference.repeatable) {
    return Promise.all(
      data.map((value) =>
        translateRelations(value, componentSchema, targetLocale)
      )
    )
  }
  return translateRelations(data, componentSchema, targetLocale)
}

async function translateRelation(attributeData, attributeSchema, targetLocale) {
  const relationSchema = strapi.contentTypes[attributeSchema.target]

  const relationIsLocalized = _.get(
    relationSchema,
    'pluginOptions.i18n.localized',
    false
  )

  const attributeTranslate = _.get(
    attributeSchema,
    'pluginOptions.deepl.translate',
    'translate'
  )

  const relationIsBothWays =
    _.has(attributeSchema, 'inversedBy', false) ||
    _.has(attributeSchema, 'mappedBy', false)

  // If the relation is localized, the relevant localizations from the relation should be selected
  if (attributeTranslate === 'translate') {
    if (relationIsLocalized) {
      // for oneToMany and manyToMany relations there are multiple relations possible, so all of them need to be considered
      if (
        ['oneToMany', 'manyToMany'].includes(attributeSchema.relation) &&
        attributeData?.length > 0
      ) {
        return _.compact(
          await Promise.all(
            attributeData.map(async (prevRelation) =>
              getRelevantLocalization(
                attributeSchema.target,
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
          attributeSchema.target,
          attributeData.id,
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
  } else if (attributeTranslate === 'copy') {
    if (relationIsLocalized || relationIsBothWays) {
      return ['oneToMany', 'manyToMany'].includes(attributeSchema.relation)
        ? []
        : undefined
    } else {
      return attributeData
    }
  }
  return attributeData
}

module.exports = {
  translateRelations,
}
