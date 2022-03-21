'use strict'

const _ = require('lodash')

const { getAllTranslatableFields } = require('../utils/translatable-fields')
const { translateRelations } = require('../utils/translate-relations')

module.exports = ({ strapi }) => ({
  async translate(ctx) {
    const { data, sourceLocale, targetLocale, contentTypeUid } =
      ctx.request.body

    if (!targetLocale || !sourceLocale) {
      return ctx.badRequest('target and source locale are both required')
    }

    const contentSchema = strapi.contentTypes[contentTypeUid]

    if (!contentSchema) {
      return ctx.notFound('corresponding content type not found')
    }

    let fieldsToTranslate = await getAllTranslatableFields(data, contentSchema)
    try {
      const translatedData = await strapi
        .plugin('deepl')
        .service('deeplService')
        .translate({
          data,
          sourceLocale,
          targetLocale,
          fieldsToTranslate,
        })
      ctx.body = await translateRelations(
        translatedData,
        contentSchema,
        targetLocale
      )
    } catch (error) {
      console.log(error)
      strapi.log.error(JSON.stringify(error))
      if (error.response?.status !== undefined) {
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
