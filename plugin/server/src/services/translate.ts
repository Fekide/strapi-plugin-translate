

import get from 'lodash/get'
import set from 'lodash/set'
import groupBy from 'lodash/groupBy'

import { geti18nService, getService } from '../utils/get-service'
import {
  getAllTranslatableFields,
} from '../utils/translatable-fields'
import { filterAllDeletedFields } from '../utils/delete-fields'
import { cleanData } from '../utils/clean-data'
import { TRANSLATE_PRIORITY_BATCH_TRANSLATION } from '../utils/constants'
import { updateUids } from '../utils/update-uids'
import { removeUids } from '../utils/remove-uids'
import { BatchTranslateManagerImpl } from './batch-translate'
import { Core, UID } from '@strapi/strapi'
import { Locale } from '@strapi/i18n/dist/shared/contracts/locales'
import { TranslateConfig } from '../config'
import { keys } from '../utils/objects'
import { TranslateService } from '@shared/services/translate'

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
        .findOne({documentId: updateID})

      if (!update) continue
      const mainID = update.groupID.split('-')[0]

      const normalizedEntities = await strapi.documents(update.contentType).findMany({
        filters: { documentId: mainID },
        locale: "*"
      })

      normalizedEntities.forEach((normalizedEntity) => {
        delete normalizedEntity.localizations
      })

      const sourceEntity = normalizedEntities.find(
        ({ locale }) => locale === sourceLocale
      )

      if (!sourceEntity)
        throw new Error('No entity found with locale ' + sourceLocale)

      const targets = normalizedEntities
        .map(({ documentId, locale }) => ({ documentId, locale }))
        .filter(({ locale }) => locale !== sourceLocale)

      const contentTypeSchema = strapi.contentTypes[update.contentType]
      const fieldsToTranslate = await getAllTranslatableFields(
        sourceEntity,
        contentTypeSchema
      )

      for (const { locale, documentId } of targets) {
        const translated = await this.translate({
          sourceLocale,
          targetLocale: locale,
          priority: TRANSLATE_PRIORITY_BATCH_TRANSLATION,
          fieldsToTranslate,
          data: sourceEntity,
        })

        const uidsUpdated = strapi.config.get<TranslateConfig>(
          'plugin.translate'
        ).regenerateUids
          ? await updateUids(translated, update.contentType)
          : removeUids(translated, update.contentType)

        const withFieldsDeleted = filterAllDeletedFields(
          uidsUpdated,
          update.contentType
        )

        const fullyTranslatedData = cleanData(
          withFieldsDeleted,
          contentTypeSchema
        )

        strapi.documents(update.contentType).update({
          documentId,
          data: fullyTranslatedData,
        })
      }
      await strapi.documents('plugin::translate.updated-entry').delete({documentId: updateID})
      return {result: 'success'}
    }
  },
  async contentTypes() {
    
    const localizedContentTypes: UID.ContentType[] = keys(strapi.contentTypes).filter(
      (ct) => strapi.contentTypes[ct].pluginOptions?.i18n?.["localized"] === true
    )

    const locales: Locale[] = await geti18nService('locales').find()

    const reports = await Promise.all(
      localizedContentTypes.map(async (contentType) => {
        // get jobs
        const translateJobs = await strapi.documents('plugin::translate.batch-translate-job')
          .findMany({
            filters: { contentType: { $eq: contentType } },
            sort: { updatedAt: 'desc' },
          })

        // calculate current translation statuses
        const info = await Promise.all(
          locales.map(async ({ code }) => {
            const countPromise = strapi.documents(contentType)
              .count({ locale: code  })

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
        const localeReports = {}
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
