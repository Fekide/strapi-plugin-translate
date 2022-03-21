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
  const { translateRelations: shouldTranslateRelations } = strapi.config.get('plugin.deepl')

  const attributesSchema = _.get(schema, 'attributes', [])
  const resultData = _.cloneDeep(data)
  await Promise.all(
    Object.keys(attributesSchema).map(async (attr) => {
      if (attr === 'localizations') {
        return true
      }

      const attributeSchema = attributesSchema[attr]

      if (attributeSchema.type === 'relation') {
        resultData[attr] = shouldTranslateRelations ? await translateRelation(
          _.get(data, attr, undefined),
          attributeSchema,
          targetLocale
        ) : undefined
      } else if (attributeSchema.type === 'component') {
        resultData[attr] = await translateComponent(
          _.get(data, attr, undefined),
          attributeSchema,
          targetLocale
        )
      } else if (attributeSchema.type === 'dynamiczone') {
        resultData[attr] = await Promise.all(
          _.get(data, attr, []).map((object) =>
            translateComponent(object, attributeSchema, targetLocale)
          )
        )
      }
      return true
    })
  )
  return resultData
}

async function translateComponent(data, componentReference, targetLocale) {
  const componentSchema =
    componentReference.type === 'dynamiczone'
      ? strapi.components[data.__component]
      : strapi.components[componentReference.component]
  if (componentReference.repeatable) {
    return await Promise.all(
      data.map((value) =>
        translateRelations(value, componentSchema, targetLocale)
      )
    )
  }
  return await translateRelations(data, componentSchema, targetLocale)
}

async function translateRelation(attributeData, attributeSchema, targetLocale) {
  const relationSchema = strapi.contentTypes[attributeSchema.target]

  const relationIsLocalized = _.get(
    relationSchema,
    'pluginOptions.i18n.localized',
    false
  )

  const relationIsBothWays =
    _.has(attributeSchema, 'inversedBy', false) ||
    _.has(attributeSchema, 'mappedBy', false)

  strapi.log.debug(
    JSON.stringify([
      attributeSchema.relation,
      relationIsLocalized,
      relationIsBothWays,
    ])
  )
  // If the relation is localized, the relevant localizations from the relation should be selected
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
  return attributeData
}

module.exports = {
  translateRelations,
}
