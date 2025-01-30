import { Core } from '@strapi/strapi'
import { getService } from '../utils/get-service'
import { getAllTranslatableFields } from '../utils/translatable-fields'
import { translateRelations } from '../utils/translate-relations'
import { TRANSLATE_PRIORITY_DIRECT_TRANSLATION } from '../utils/constants'
import { filterAllDeletedFields } from '../utils/delete-fields'
import { populateAll } from '../utils/populate-all'
import { cleanData } from '../utils/clean-data'
import { updateUids } from '../utils/update-uids'
import { z } from 'zod'
import { TranslateConfig } from '../config'
import { TranslateEntity } from '../../../shared/contracts/translate'
import { isCollectionType, isContentTypeUID } from '../utils/content-type'
import { handleContextError } from '../utils/handle-error'

export interface TranslateController extends Core.Controller {
  translateEntity: Core.ControllerHandler<TranslateEntity.Response>
  translateBatch: Core.ControllerHandler
  translateBatchPauseJob: Core.ControllerHandler
  translateBatchResumeJob: Core.ControllerHandler
  translateBatchCancelJob: Core.ControllerHandler
  translateBatchJobStatus: Core.ControllerHandler
  translateBatchUpdate: Core.ControllerHandler
  report: Core.ControllerHandler
  usageEstimate: Core.ControllerHandler
  usageEstimateCollection: Core.ControllerHandler
}

const translateBodySchema = z.object({
  documentId: z.string().optional(),
  sourceLocale: z.string(),
  targetLocale: z.string(),
  contentType: z.string(),
})

const batchTranslateBodySchema = z.object({
  contentType: z.string(),
  sourceLocale: z.string(),
  targetLocale: z.string(),
  autoPublish: z.boolean(),
  entityIds: z.array(z.string()).optional(),
})

const idQuerySchema = z.object({
  documentId: z.string(),
})

const batchUpdateBodySchema = z.object({
  sourceLocale: z.string(),
  updatedEntryIDs: z.array(z.string()),
})

const usageEstimateBodySchema = z.object({
  documentId: z.string(),
  contentType: z.string(),
  sourceLocale: z.string(),
})

const usageEstimateCollectionBodySchema = z.object({
  contentType: z.string(),
  sourceLocale: z.string(),
  targetLocale: z.string(),
})

export default ({ strapi }: { strapi: Core.Strapi }): TranslateController => ({
  async translateEntity(ctx) {
    const { data, error, success } = translateBodySchema.safeParse(
      ctx.request.body
    )

    if (!success) {
      return ctx.badRequest({ message: 'request data invalid', error })
    }

    const { documentId, sourceLocale, targetLocale, contentType } = data

    const isCollection = isCollectionType(contentType)

    if (!documentId && isCollection) {
      return ctx.badRequest({
        message: 'documentId is missing, but required for collection types',
      })
    }

    if (!isContentTypeUID(contentType)) {
      return ctx.notFound('corresponding content type not found')
    }

    try {
      const translatedData = await getService('translate').translateEntity({
        documentId,
        contentType,
        sourceLocale,
        targetLocale,
        create: false,
        priority: TRANSLATE_PRIORITY_DIRECT_TRANSLATION,
      })

      return { data: translatedData }
    } catch (error) {
      return handleContextError(ctx, error, 'TranslateEntity.error')
    }
  },
  async translateBatch(ctx) {
    const {
      data: { contentType, sourceLocale, targetLocale, autoPublish, entityIds },
      error,
      success,
    } = batchTranslateBodySchema.safeParse(ctx.request.body)

    if (!success) {
      return ctx.badRequest({ message: 'request data invalid', error })
    }

    if (!isContentTypeUID(contentType)) {
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
  async translateBatchPauseJob(ctx) {
    const {
      data: { documentId: id },
      error,
      success,
    } = idQuerySchema.safeParse(ctx.query)

    if (!success) {
      return ctx.badRequest({ message: 'id is missing', error })
    }

    try {
      ctx.body = {
        data: await getService('translate').batchTranslatePauseJob(id),
      }
    } catch (error) {
      if (
        typeof error.message === 'string' &&
        error.message.startsWith('translate')
      ) {
        return ctx.badRequest(error.message)
      } else {
        return ctx.internalServerError(error.message)
      }
    }
  },
  async translateBatchResumeJob(ctx) {
    const {
      data: { documentId: id },
      error,
      success,
    } = idQuerySchema.safeParse(ctx.query)

    if (!success) {
      return ctx.badRequest({ message: 'id is missing', error })
    }

    try {
      ctx.body = {
        data: await getService('translate').batchTranslateResumeJob(id),
      }
    } catch (error) {
      if (
        typeof error.message === 'string' &&
        error.message.startsWith('translate')
      ) {
        return ctx.badRequest(error.message)
      } else {
        return ctx.internalServerError(error.message)
      }
    }
  },
  async translateBatchCancelJob(ctx) {
    const {
      data: { documentId: id },
      error,
      success,
    } = idQuerySchema.safeParse(ctx.query)

    if (!success) {
      return ctx.badRequest({ message: 'id is missing', error })
    }

    try {
      ctx.body = {
        data: await getService('translate').batchTranslateCancelJob(id),
      }
    } catch (error) {
      if (
        typeof error.message === 'string' &&
        error.message.startsWith('translate')
      ) {
        return ctx.badRequest(error.message)
      } else {
        return ctx.internalServerError(error.message)
      }
    }
  },
  async translateBatchJobStatus(ctx) {
    const {
      data: { documentId: id },
      error,
      success,
    } = idQuerySchema.safeParse(ctx.query)

    if (!success) {
      return ctx.badRequest({ message: 'id is missing', error })
    }

    const job = await getService('batch-translate-job').findOne(id, {})
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
  async translateBatchUpdate(ctx) {
    const { data, error, success } = batchUpdateBodySchema.safeParse(
      ctx.request.body
    )

    if (!success) {
      return ctx.badRequest({ message: 'request data invalid', error })
    }

    const { updatedEntryIDs, sourceLocale } = data

    ctx.body = {
      data: await getService('translate').batchUpdate({
        updatedEntryIDs,
        sourceLocale,
      }),
    }
  },
  async report(ctx) {
    ctx.body = {
      data: await getService('translate').contentTypes(),
    }
  },
  async usageEstimate(ctx) {
    const {
      data: { documentId, contentType, sourceLocale },
      error,
      success,
    } = usageEstimateBodySchema.safeParse(ctx.request.body)

    if (!success) {
      return ctx.badRequest({ message: 'request data invalid', error })
    }

    if (!isContentTypeUID(contentType)) {
      return ctx.notFound('corresponding content type not found')
    }
    const contentSchema = strapi.contentTypes[contentType]

    const populateRule = populateAll(contentSchema, { populateMedia: true })

    const fullyPopulatedData = await strapi.documents(contentType).findOne({
      documentId,
      locale: sourceLocale,
      populate: populateRule,
    })

    const fieldsToTranslate = await getAllTranslatableFields(
      fullyPopulatedData,
      contentSchema
    )

    ctx.body = {
      data: await getService('translate').estimateUsage({
        fieldsToTranslate,
        data: fullyPopulatedData,
      }),
    }
  },
  async usageEstimateCollection(ctx) {
    const { data, error, success } =
      usageEstimateCollectionBodySchema.safeParse(ctx.request.body)

    if (!success) {
      return ctx.badRequest({ message: 'request data invalid', error })
    }
    const { contentType, sourceLocale, targetLocale } = data

    if (!isContentTypeUID(contentType)) {
      return ctx.notFound('corresponding content type not found')
    }

    const contentTypeSchema = strapi.contentTypes[contentType]

    const entityIDs = await getService(
      'untranslated'
    ).getUntranslatedDocumentIDs({
      uid: contentType,
      targetLocale,
      sourceLocale,
    })

    let sum = 0

    for (const id of entityIDs) {
      const populateRule = populateAll(contentTypeSchema, {
        populateMedia: true,
      })

      const fullyPopulatedData = await strapi.documents(contentType).findOne({
        documentId: id,
        locale: sourceLocale,
        populate: populateRule,
      })

      const fieldsToTranslate = await getAllTranslatableFields(
        fullyPopulatedData,
        contentTypeSchema
      )

      sum = +(await getService('translate').estimateUsage({
        fieldsToTranslate,
        data: fullyPopulatedData,
      }))
    }

    ctx.body = {
      data: sum,
    }
  },
})
