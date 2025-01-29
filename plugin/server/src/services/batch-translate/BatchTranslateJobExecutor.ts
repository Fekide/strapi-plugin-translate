import { Data, Struct, UID } from '@strapi/strapi'
import {
  batchContentTypeUid,
  TRANSLATE_PRIORITY_BATCH_TRANSLATION,
} from '../../utils/constants'
import { getService } from '../../utils/get-service'
import { populateAll } from '../../utils/populate-all'
import { BatchTranslateJob } from '@shared/types/batch-translate-job'
import { isContentTypeUID, isLocalizedContentType } from '../../utils/content-type'

export class BatchTranslateJobExecutor {
  totalEntities: number
  translatedEntities: number
  intervalId: null
  id: string
  autoPublish: boolean
  contentType: UID.ContentType
  contentTypeSchema: Struct.ContentTypeSchema
  sourceLocale: string
  targetLocale: string
  documentIds: Data.DocumentID[]
  status:
    | 'created'
    | 'setup'
    | 'running'
    | 'paused'
    | 'cancelled'
    | 'finished'
    | 'failed'
  promise: Promise<any>

  constructor({
    documentId,
    contentType,
    sourceLocale,
    targetLocale,
    entityIds,
    status,
    autoPublish = false,
  }: BatchTranslateJob) {
    this.totalEntities = 0
    this.translatedEntities = 0
    this.intervalId = null
    this.id = documentId
    this.autoPublish = autoPublish
    this.contentType = contentType
    if (!isContentTypeUID(contentType)) {
      throw new Error('translate.batch-translate.content-type-not-exist')
    }
    this.contentTypeSchema = strapi.contentTypes[contentType]
    if (!isLocalizedContentType(contentType)) {
      throw new Error('translate.batch-translate.content-type-not-localized')
    }
    this.sourceLocale = sourceLocale
    this.targetLocale = targetLocale
    if (Array.isArray(entityIds) && entityIds.length > 0) {
      this.documentIds = entityIds
    } else {
      this.documentIds = null
    }
    this.status = status
  }

  async pause(setStatus = true) {
    // In case the promise has already resolved/rejected, don't run cancel behavior!
    if (['paused', 'cancelled', 'finished', 'failed'].includes(this.status)) {
      return
    }

    // pause scenario
    if (setStatus) {
      await this.updateStatus('paused')
    }
  }

  async cancel() {
    // In case the promise has already resolved/rejected, don't run cancel behavior!
    if (['paused', 'cancelled', 'finished', 'failed'].includes(this.status)) {
      return
    }

    // Cancel-path scenario
    strapi.log.warn('Cancelled translation')

    await this.updateStatus('cancelled')
  }

  async waitFor() {
    if (this.promise) {
      await this.promise
    }
  }

  async updateStatus(
    status: BatchTranslateJob['status'],
    additionalData: Partial<
      Pick<BatchTranslateJob, 'failureReason' | 'progress'>
    > = {}
  ) {
    const data: Partial<Omit<BatchTranslateJob, 'documentId'>> = {
      status,
      ...additionalData,
    }
    this.status = status
    await strapi
      .documents(batchContentTypeUid)
      .update({ documentId: this.id, data })
  }

  async updateProgress() {
    const data: Partial<Omit<BatchTranslateJob, 'documentId'>> = {
      progress: this.translatedEntities / this.totalEntities,
    }
    await strapi.documents(batchContentTypeUid).update({
      documentId: this.id,
      data: data,
    })
  }

  async setup() {
    await this.updateStatus('setup')
    if (!this.documentIds) {
      this.documentIds = await getService(
        'untranslated'
      ).getUntranslatedDocumentIDs({
        uid: this.contentType,
        targetLocale: this.targetLocale,
        sourceLocale: this.sourceLocale,
      })
    }
    this.translatedEntities = await strapi.documents(this.contentType).count({
      locale: this.sourceLocale,
      filters: {
        documentId: { $in: this.documentIds },
      },
    })
    this.totalEntities = this.documentIds.length

    // TODO: Initialize variables (which ids have to be translated, how many etc)
    if (this.status !== 'setup') {
      // Job was cancelled before setup was complete, should not continue here then
      // Promise should have already been rejected though (not sure if when then even get here?)
      return
    }

    await this.updateStatus('running')
    // The rest of the logic will now be executed using the interval
  }

  async start(resume = false) {
    if (
      resume &&
      !['running', 'created', 'setup', 'paused'].includes(this.status)
    ) {
      throw new Error('Job is not in a status to be resumed')
    } else if (!resume && this.status != 'created') {
      throw new Error('Job was started before or has already been stopped')
    }

    await this.setup().catch((error) => {
      this.updateStatus('failed', { failureReason: error })
      throw error
    })

    let entity: Data.Entity | null = null

    const populate = populateAll(this.contentTypeSchema)
    while (this.status === 'running') {
      if (this.documentIds !== null) {
        // Get an entity from the provided entity id list
        // Try until we get one or the list is empty
        while (!entity && this.documentIds.length > 0) {
          const nextId = this.documentIds.pop()
          entity = await strapi.documents(this.contentType).findOne({
            documentId: nextId,
            locale: this.sourceLocale,
            populate,
          })
          if (entity?.locale !== this.sourceLocale) {
            strapi.log.warn(
              `Entity ${nextId} of ${this.contentType} did not have the correct source locale ${this.sourceLocale}, skipping it...`
            )
            entity = null
          } else if (
            entity?.localizations?.filter(
              (l: Data.Entity) => l.locale === this.targetLocale
            ).length > 0
          ) {
            strapi.log.warn(
              `Entity ${nextId} of ${this.contentType} already has a translation for ${this.sourceLocale}, skipping it...`
            )
            entity = null
          }
        }
      } else {
        // Get an entity that was not translated yet
        entity = await getService('untranslated').getUntranslatedEntity(
          {
            uid: this.contentType,
            targetLocale: this.targetLocale,
            sourceLocale: this.sourceLocale,
          },
          { populate }
        )
      }

      // Cancel if there is no matching entity or we have reached our initial limit
      if (!entity || this.totalEntities == this.translatedEntities) {
        await this.updateStatus('finished')
        return
      }

      // Translate the entity
      try {
        await getService('translate').translateEntity({
          documentId: entity.documentId,
          contentType: this.contentType,
          sourceLocale: this.sourceLocale,
          targetLocale: this.targetLocale,
          create: true,
          updateExisting: false,
          publish: this.autoPublish,
          priority: TRANSLATE_PRIORITY_BATCH_TRANSLATION,
        })

        this.translatedEntities++
        entity = null
      } catch (error) {
        strapi.log.error(error)
        if (error.details) {
          strapi.log.debug(JSON.stringify(error.details))
        }
        await this.updateStatus('failed', {
          failureReason: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        })
        clearInterval(this.intervalId)
        throw new Error(
          `Translation of entity ${entity.documentId} from ${this.sourceLocale} to ${this.targetLocale} failed`
        )
      }
      await this.updateProgress()
    }
    switch (this.status) {
      case 'paused':
        throw new Error('Job was paused')
      case 'cancelled':
        throw new Error('Job was cancelled')
      case 'failed':
        throw new Error('Translation of an entity failed')

      default:
        break
    }
  }
}
