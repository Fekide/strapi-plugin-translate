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
      return ctx.badRequest('target and source locale are both required')
    }

    const contentType = strapi.contentTypes[contentTypeUid]

    if (!contentType) {
      return ctx.notFound('corresponding content type not found')
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

    try {
      ctx.body = await strapi
        .plugin('deepl')
        .service('deeplService')
        .translate({
          data,
          sourceLocale,
          targetLocale,
          translateFields,
        })
    } catch (error) {
      strapi.log.error(JSON.stringify(error))

      if (error.response.status !== undefined) {
        switch (error.response.status) {
          case 400:
            return ctx.badRequest('deepl.error.badRequest', {
              message: error.message,
            })
          case 403:
            return ctx.forbidden('deepl.error.forbidden', {
              message: error.message,
            })
          case 404:
            return ctx.notFound('deepl.error.notFound', {
              message: error.message,
            })
          case 413:
            return ctx.payloadTooLarge('deepl.error.payloadTooLarge', {
              message: error.message,
            })
          case 414:
            return ctx.uriTooLong('deepl.error.uriTooLong', {
              message: error.message,
            })
          case 429:
            return ctx.tooManyRequests('deepl.error.tooManyRequests', {
              message: error.message,
            })
          case 456:
            return ctx.paymentRequired('deepl.error.paymentRequired', {
              message: error.message,
            })
          default:
            return ctx.internalServerError(error.message)
        }
      } else if (error.message) {
        return ctx.internalServerError(
          'CMEditViewTranslateLocale.translate-failure',
          { message: error.message }
        )
      } else {
        return ctx.internalServerError(
          'CMEditViewTranslateLocale.translate-failure'
        )
      }
    }
  },
  async usage(ctx) {
    ctx.body = await strapi.plugin('deepl').service('deeplService').usage()
  },
})
