import get from 'lodash/get'
import set from 'lodash/set'
import groupBy from 'lodash/groupBy'

import { geti18nService, getService } from '../utils/get-service'
import { getAllTranslatableFields } from '../utils/translatable-fields'
import { filterAllDeletedFields } from '../utils/delete-fields'
import { cleanData } from '../utils/clean-data'
import { TRANSLATE_PRIORITY_BATCH_TRANSLATION } from '../utils/constants'
import { updateUids } from '../utils/update-uids'
import { removeUids } from '../utils/remove-uids'
import { BatchTranslateManagerImpl } from './batch-translate'
import { Core, Data, Modules, UID } from '@strapi/strapi'
import { TranslateConfig } from '../config'
import { keys } from '../utils/objects'
import { TranslateService } from '@shared/services/translate'
import { Locale } from '@shared/types/locale'
import { SingleLocaleTranslationReport } from '@shared/types/report'
import {
  isCollectionType,
  isContentTypeUID,
  isSingleType,
} from '../utils/content-type'
import { BatchTranslateJob } from '@shared/types/batch-translate-job'
import { populateAll, translateRelations } from 'src/utils'

export default ({ strapi }: { strapi: Core.Strapi }): TranslateService => ({
  batchTranslateManager: new BatchTranslateManagerImpl(),

  async estimateUsage({ data, fieldsToTranslate }) {
    const text = fieldsToTranslate
      .map(({ field }) => get(data, field, ''))
      .join('')

    return text.length
  },

  async translate({
    data,
    sourceLocale,
    targetLocale,
    fieldsToTranslate,
    priority,
  }) {
    // Do not translate if there is nothing to do (for language variants)
    if (sourceLocale === targetLocale) {
      return data
    }

    const groupedFields = groupBy(fieldsToTranslate, 'format')

    const translatedData = { ...data }
    await Promise.all(
      Object.keys(groupedFields).map(async (format) => {
        const textsToTranslate = groupedFields[format].map(({ field }) =>
          get(data, field, '')
        )
        const translateResult = await strapi
          .plugin('translate')
          .provider.translate({
            text: textsToTranslate,
            targetLocale,
            sourceLocale,
            priority,
            format,
          })

        groupedFields[format].forEach(({ field }, index) => {
          set(translatedData, field, translateResult[index])
        })
      })
    )

    return translatedData
  },

  async translateEntity(params) {
    const contentSchema = strapi.contentTypes[params.contentType]

    const populateRule = populateAll<typeof params.contentType>(contentSchema, {
      populateMedia: true,
      populateRelations: true,
    })

    let fullyPopulatedData: Modules.Documents.Document<
      typeof params.contentType
    > = null

    const collectionType = isCollectionType(params.contentType)
    const singleType = isSingleType(params.contentType)

    if (collectionType) {
      if (!params.documentId) {
        throw new Error('Document ID is required for collection type')
      }
      fullyPopulatedData = await strapi.documents(params.contentType).findOne({
        documentId: params.documentId,
        locale: params.sourceLocale,
        populate: populateRule,
      })
    } else if (singleType) {
      fullyPopulatedData = await strapi
        .documents(params.contentType)
        .findFirst({
          locale: params.sourceLocale,
          populate: populateRule,
        })
    } else {
      throw new Error('Content type is neither a collection nor a single type')
    }

    const targetEntityExists =
      (await strapi.documents(params.contentType).count({
        filters: collectionType
          ? ({ documentId: { $eq: params.documentId } } as any)
          : undefined,
        locale: params.targetLocale,
      })) > 0

    if (params.create && targetEntityExists && !params.updateExisting) {
      throw new Error('Target entity already exists')
    }

    const fieldsToTranslate = await getAllTranslatableFields(
      fullyPopulatedData,
      contentSchema
    )

    const translatedData = await getService('translate').translate({
      data: fullyPopulatedData,
      sourceLocale: params.sourceLocale,
      targetLocale: params.targetLocale,
      fieldsToTranslate,
      priority: params.priority,
    })

    const translatedRelations = await translateRelations(
      strapi.config.get<TranslateConfig>('plugin::translate').regenerateUids
        ? await updateUids(translatedData, params.contentType)
        : translatedData,
      contentSchema,
      params.targetLocale
    )
    const withFieldsDeleted = filterAllDeletedFields(
      translatedRelations,
      contentSchema
    )

    if (params.create) {
      if (collectionType) {
        await strapi.documents(params.contentType).update({
          documentId: params.documentId,
          data: cleanData(withFieldsDeleted, contentSchema, false),
          locale: params.targetLocale,
          status: params.publish ? 'published' : 'draft',
        })
      } else if (singleType) {
        await strapi.documents(params.contentType).create({
          data: cleanData(withFieldsDeleted, contentSchema, false),
          locale: params.targetLocale,
        })
      }
    }

    const cleanedData = cleanData(withFieldsDeleted, contentSchema, true)

    return cleanedData
  },

  async batchTranslate(params) {
    return this.batchTranslateManager.submitJob(params)
  },
  async batchTranslatePauseJob(id) {
    return this.batchTranslateManager.pauseJob(id)
  },
  async batchTranslateResumeJob(id) {
    return this.batchTranslateManager.resumeJob(id)
  },
  async batchTranslateCancelJob(id) {
    return this.batchTranslateManager.cancelJob(id)
  },
  async batchUpdate(params) {
    const { updatedEntryIDs, sourceLocale } = params
    for (const updateID of updatedEntryIDs) {
      const update = await strapi
        .documents('plugin::translate.updated-entry')
        .findOne({ documentId: updateID })

      if (!update || !isContentTypeUID(update.contentType)) continue
      const mainID = update.groupID.split('-')[0]

      const normalizedEntities = await strapi
        .documents(update.contentType)
        .findMany({
          documentId: mainID,
          locale: '*',
        })

      const sourceEntity = normalizedEntities.find(
        ({ locale }) => locale === sourceLocale
      )

      if (!sourceEntity)
        throw new Error('No entity found with locale ' + sourceLocale)

      const targets = normalizedEntities
        .map(({ documentId, locale }) => ({ documentId, locale }))
        .filter(({ locale }) => locale !== sourceLocale)

      for (const { locale, documentId } of targets) {
        getService('translate').translateEntity({
          documentId: documentId,
          contentType: update.contentType,
          sourceLocale: update.sourceLocale,
          targetLocale: update.targetLocale,
          create: true,
          updateExisting: true,
          // FIXME: This should be configurable
          publish: false,
          priority: TRANSLATE_PRIORITY_BATCH_TRANSLATION,
        })
      }
      await strapi
        .documents('plugin::translate.updated-entry')
        .delete({ documentId: updateID })
      return { result: 'success' }
    }
  },
  async contentTypes() {
    const localizedContentTypes: UID.ContentType[] = keys(
      strapi.contentTypes
    ).filter(
      (ct) =>
        strapi.contentTypes[ct].pluginOptions?.i18n?.['localized'] === true
    )

    const locales: Locale[] = await geti18nService('locales').setIsDefault(
      await geti18nService('locales').find()
    )

    const reports = await Promise.all(
      localizedContentTypes.map(async (contentType) => {
        // get jobs
        const translateJobs = (await strapi
          .documents('plugin::translate.batch-translate-job')
          .findMany({
            filters: { contentType: { $eq: contentType } },
            sort: { updatedAt: 'desc' },
          })) as BatchTranslateJob[]

        // calculate current translation statuses
        const info = await Promise.all(
          locales.map(async ({ code }) => {
            const countPromise = strapi
              .documents(contentType)
              .count({ locale: code })

            const complete = await getService('untranslated').isFullyTranslated(
              contentType,
              code
            )

            return {
              count: await countPromise,
              complete,
            }
          })
        )

        // create report
        const localeReports: Record<string, SingleLocaleTranslationReport> = {}
        locales.forEach(({ code }, index) => {
          localeReports[code] = {
            ...info[index],
            job: translateJobs.find((job) => job.targetLocale === code),
          }
        })
        return {
          contentType,
          collection: strapi.contentTypes[contentType].info.displayName,
          localeReports,
        }
      })
    )

    return { contentTypes: reports, locales }
  },
})
