import get from 'lodash/get'
import set from 'lodash/set'
import groupBy from 'lodash/groupBy'

import { geti18nService, getService } from '../utils/get-service'
import { getAllTranslatableFields } from '../utils/translatable-fields'
import { filterAllDeletedFields } from '../utils/delete-fields'
import { cleanData } from '../utils/clean-data'
import { TRANSLATE_PRIORITY_BATCH_TRANSLATION } from '../utils/constants'
import { updateUids } from '../utils/update-uids'
import { BatchTranslateManagerImpl } from './batch-translate'
import { Core, Data, Modules, UID } from '@strapi/strapi'
import { TranslateConfig } from '../config'
import { keys } from '../utils/objects'
import { TranslateService } from '@shared/services/translate'
import { Locale } from '@shared/types/locale'
import { SingleLocaleTranslationReport, TotalRows, TranslatedCountsRows } from '@shared/types/report'
import {
  isCollectionType,
  isContentTypeUID,
  isSingleType,
} from '../utils/content-type'
import { BatchTranslateJob } from '@shared/types/batch-translate-job'
import { populateAll, translateRelations } from '../utils'

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

        if (textsToTranslate.length === 0) {
          return
        }

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
      const cleanedData = cleanData<typeof params.contentType>(
        withFieldsDeleted,
        contentSchema,
        false
      )

      if (collectionType) {
        await strapi.documents(params.contentType).update({
          documentId: params.documentId,
          data: cleanedData,
          locale: params.targetLocale,
          status: params.publish ? 'published' : 'draft',
        })
      } else if (singleType) {
        await strapi.documents(params.contentType).create({
          data: cleanedData,
          locale: params.targetLocale,
          status: params.publish ? 'published' : 'draft',
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

      let documentId = update.groupID
      if (typeof update.groupID === 'string' && update.groupID.includes('-')) {
        let firstId = update.groupID.split('-')[0]
        const entities = await strapi.documents(update.contentType).findMany({
          filters: { id: { $eq: firstId } },
          fields: ['documentId'],
          locale: '*',
        })
        if (entities.length === 0) {
          throw new Error('No entity found with id ' + firstId)
        }
        documentId = entities[0].documentId
      }
      const entities = await strapi.documents(update.contentType).findMany({
        filters: { documentId: { $eq: documentId } },
        fields: ['locale'],
        locale: '*',
      })
      const targetLocales: string[] = entities
        .map((entity) => entity.locale)
        .filter((locale) => locale !== sourceLocale)

      const sourceEntity = entities.find(
        ({ locale }) => locale === sourceLocale
      )

      if (!sourceEntity)
        throw new Error('No entity found with locale ' + sourceLocale)

      for (const targetLocale of targetLocales) {
        await getService('translate').translateEntity({
          documentId: documentId,
          contentType: update.contentType,
          sourceLocale,
          targetLocale,
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
    }
    return { result: 'success' }
  },
  async contentTypes() {
    const localizedContentTypes: UID.ContentType[] = keys(strapi.contentTypes)
      .filter((ct) => strapi.contentTypes[ct].pluginOptions?.i18n?.['localized'] === true)

    const locales: Locale[] = await geti18nService('locales').setIsDefault(
      await geti18nService('locales').find()
    )

    async function getContentTypeReport(contentType: UID.ContentType) {

      const translateJobs = (await strapi
        .documents('plugin::translate.batch-translate-job')
        .findMany({
          filters: { contentType: { $eq: contentType } },
          sort: { updatedAt: 'desc' },
        })) as BatchTranslateJob[]

      const collectionName = strapi.contentTypes[contentType].collectionName

      // use raw query to get the total of documents group by locale
      const { rows: totalRows } = await strapi.db.connection.raw<TotalRows>(`
        SELECT locale, COUNT(*) as count 
        FROM ${collectionName}
        WHERE published_at IS NULL 
        GROUP BY locale
      `);
      const totalMap = new Map(totalRows.map(row => [row.locale, parseInt(row.count)]));
      const totals = locales.map(({ code }) => totalMap.get(code) || 0);

      // use raw query to get the count of translated documents group by source and target locale
      const { rows: translatedCountsRows } = await strapi.db.connection.raw<TranslatedCountsRows>(`
        SELECT t1.locale as source, t2.locale as target, COUNT(*) as count
        FROM ${collectionName} t1
        JOIN ${collectionName} t2
        ON t1.document_id = t2.document_id
          AND t1.locale != t2.locale
        WHERE t1.published_at IS NULL
          AND t2.published_at IS NULL
        GROUP BY t1.locale, t2.locale
      `);
      const translatedCountsMap = new Map();
      translatedCountsRows.forEach(row => {
        translatedCountsMap.set(`${row.source}-${row.target}`, parseInt(row.count));
      });

      const completes = locales.map(({ code: targetLocale }) => {
        const translatedCounts = locales.map(({ code: sourceLocale }, sourceIndex) => {
          if (sourceLocale === targetLocale) return true;
          const sourceCount = totals[sourceIndex];
          const key = `${sourceLocale}-${targetLocale}`;
          const translatedCount = translatedCountsMap.get(key) || 0;
          return sourceCount === translatedCount;
        });
        const allTranslated = translatedCounts.every((translated) => translated);
        return allTranslated;
      });
  
      // create report
      const localeReports: Record<string, SingleLocaleTranslationReport> = {}
      locales.forEach(({ code }, index) => {
        localeReports[code] = {
          count: totals[index],
          complete: completes[index],
          job: translateJobs.find((job) => job.targetLocale === code),
        }
      })
      return {
        contentType,
        collection: strapi.contentTypes[contentType].info.displayName,
        localeReports,
      }
    }

    const reports = await Promise.all(
      localizedContentTypes.map((contentType) => {
        return getContentTypeReport(contentType)
      }
    ))

    return { contentTypes: reports, locales }
  },
})
