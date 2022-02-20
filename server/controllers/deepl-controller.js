'use strict'

const _ = require('lodash')

async function getTranslateFields(data, schema, attr, translatedFieldTypes) {
  if (
    translatedFieldTypes.includes(schema.type) &&
    _.get(data, attr, undefined)
  ) {
    if (schema.type == 'component') {
      return (
        await recursiveComponentFieldsToTranslate(
          schema,
          _.get(data, attr, undefined),
          translatedFieldTypes,
          attr
        )
      ).map((path) => `${attr}.${path}`)
    } else if (schema.type == 'dynamiczone') {
      return await Promise.all(
        data[attr].map(async (object, index) => {
          return (
            await recursiveComponentFieldsToTranslate(
              schema,
              object,
              translatedFieldTypes,
              attr
            )
          ).map((path) => `${attr}.${index}.${path}`)
        })
      )
    } else {
      return attr
    }
  }
  return null
}

async function recursiveComponentFieldsToTranslate(
  componentReference,
  data,
  translatedFieldTypes
) {
  const componentInfo =
    componentReference.type == 'dynamiczone'
      ? strapi.components[data.__component]
      : strapi.components[componentReference.component]
  const componentSchema = await strapi
    .plugin('content-type-builder')
    .service('components')
    .formatComponent(componentInfo)

  const attributesSchema = _.get(componentSchema, 'schema.attributes', [])
  let translateFields = await Promise.all(
    Object.keys(attributesSchema).map(async (attr) => {
      const schema = attributesSchema[attr]

      if (componentReference.repeatable) {
        return _.compact(
          _.flattenDeep(
            await Promise.all(
              data.map(async (_value, index) =>
                getTranslateFields(
                  data,
                  schema,
                  `${index}.${attr}`,
                  translatedFieldTypes
                )
              )
            )
          )
        )
      }
      return getTranslateFields(data, schema, attr, translatedFieldTypes)
    })
  )
  return _.compact(_.flattenDeep(translateFields))
}

module.exports = ({ strapi }) => ({
  async translate(ctx) {
    const { data, sourceLocale, targetLocale, contentTypeUid } =
      ctx.request.body

    if (!targetLocale || !sourceLocale) {
      ctx.send({ error: 'deepl.localeMissing' }, 400)
    }

    const contentType = strapi.contentTypes[contentTypeUid]

    if (!contentType) {
      return ctx.send({ error: 'contentType.notFound' }, 404)
    }
    const contentSchema = await strapi
      .plugin('content-type-builder')
      .service('content-types')
      .formatContentType(contentType)
    const attributesSchema = _.get(contentSchema, 'schema.attributes', [])

    const { translatedFieldTypes } = strapi.config.get('plugin.deepl')

    let translateFields = _.compact(
      _.flattenDeep(
        await Promise.all(
          Object.keys(attributesSchema).map(async (attr) => {
            const schema = attributesSchema[attr]

            if (schema.pluginOptions?.i18n.localized) {
              return getTranslateFields(
                data,
                schema,
                attr,
                translatedFieldTypes
              )
            }
            return null
          })
        )
      )
    )

    strapi.log.debug(JSON.stringify(translateFields))

    // ctx.body = data
    ctx.body = await strapi.plugin('deepl').service('deeplService').translate({
      data,
      sourceLocale,
      targetLocale,
      translateFields,
    })
  },
  async usage(ctx) {
    ctx.body = await strapi.plugin('deepl').service('deeplService').usage()
  },
})
