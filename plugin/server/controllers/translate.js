'use strict'

const { getService } = require('../utils/get-service')
const { getAllTranslatableFields } = require('../utils/translatable-fields')
const { translateRelations } = require('../utils/translate-relations')
const { DEEPL_PRIORITY_DIRECT_TRANSLATION } = require('../utils/constants')
const { filterAllDeletedFields } = require('../utils/delete-fields')

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

    const fieldsToTranslate = await getAllTranslatableFields(
      data,
      contentSchema
    )
    try {
      const translatedData = await getService('translate').translate({
        data,
        sourceLocale,
        targetLocale,
        fieldsToTranslate,
        priority: DEEPL_PRIORITY_DIRECT_TRANSLATION,
      })
      const translatedRelations = await translateRelations(
        translatedData,
        contentSchema,
        targetLocale
      )
      const withFieldsDeleted = filterAllDeletedFields(
        translatedRelations,
        contentSchema
      )

      ctx.body = withFieldsDeleted
    } catch (error) {
      strapi.log.error('Translating entity failed: ' + error.message)
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
  async batchTranslate(ctx) {
    const { contentType, sourceLocale, targetLocale, autoPublish, entityIds } =
      ctx.request.body

    if (!targetLocale || !sourceLocale) {
      return ctx.badRequest('target and source locale are both required')
    }

    if (typeof autoPublish != 'boolean') {
      return ctx.badRequest('autoPublish must be a boolean')
    }

    const contentSchema = strapi.contentTypes[contentType]

    if (!contentSchema) {
      return ctx.notFound('corresponding content type not found')
    }

    ctx.body = {
      data: await getService('translate').batchTranslate({
        contentType,
        sourceLocale,
        targetLocale,
        entityIds,
        autoPublish,
      }),
    }
  },
  async batchTranslatePauseJob(ctx) {
    const { id } = ctx.request.params

    if (!id) {
      return ctx.badRequest('id is missing')
    }

    try {
      const parsedId = parseInt(id)
      ctx.body = {
        data: await getService('translate').batchTranslatePauseJob(parsedId),
      }
    } catch (error) {
      if (
        typeof error.message === 'string' &&
        error.message.startsWith('deepl')
      ) {
        return ctx.badRequest(error.message)
      } else {
        return ctx.internalServerError(error.message)
      }
    }
  },
  async batchTranslateResumeJob(ctx) {
    const { id } = ctx.request.params

    if (!id) {
      return ctx.badRequest('id is missing')
    }

    try {
      const parsedId = parseInt(id)
      ctx.body = {
        data: await getService('translate').batchTranslateResumeJob(parsedId),
      }
    } catch (error) {
      if (
        typeof error.message === 'string' &&
        error.message.startsWith('deepl')
      ) {
        return ctx.badRequest(error.message)
      } else {
        return ctx.internalServerError(error.message)
      }
    }
  },
  async batchTranslateCancelJob(ctx) {
    const { id } = ctx.request.params

    if (!id) {
      return ctx.badRequest('id is missing')
    }

    try {
      const parsedId = parseInt(id)
      ctx.body = {
        data: await getService('translate').batchTranslateCancelJob(parsedId),
      }
    } catch (error) {
      if (
        typeof error.message === 'string' &&
        error.message.startsWith('deepl')
      ) {
        return ctx.badRequest(error.message)
      } else {
        return ctx.internalServerError(error.message)
      }
    }
  },
  async batchTranslateJobStatus(ctx) {
    const { id } = ctx.request.params

    if (!id) {
      return ctx.badRequest('id is missing')
    }
    const parsedId = parseInt(id)
    const job = await getService('batch-translate-job').findOne(parsedId)
    if (!job) {
      return ctx.notFound()
    }
    ctx.body = {
      data: {
        status: job.status,
        progress: job.progress,
        failureReason: job.failureReason,
      },
    }
  },
  async batchTranslateContentTypes(ctx) {
    ctx.body = {
      data: await getService('translate').contentTypes(),
    }
  },
})
