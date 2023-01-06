'use strict'

const { cleanData } = require('../../utils/clean-data')
const {
  batchContentTypeUid,
  TRANSLATE_PRIORITY_BATCH_TRANSLATION,
} = require('../../utils/constants')
const { filterAllDeletedFields } = require('../../utils/delete-fields')
const { getService } = require('../../utils/get-service')
const { populateAll } = require('../../utils/populate-all')
const { getAllTranslatableFields } = require('../../utils/translatable-fields')
const { translateRelations } = require('../../utils/translate-relations')
const { updateUids } = require('../../utils/update-uids')

class BatchTranslateJob {
  constructor({
    id,
    contentType,
    sourceLocale,
    targetLocale,
    entityIds,
    status,
    autoPublish = false,
  }) {
    this.totalEntities = 0
    this.translatedEntities = 0
    this.intervalId = null
    this.id = id
    this.autoPublish = autoPublish
    this.contentType = contentType
    this.contentTypeSchema = strapi.contentTypes[contentType]
    if (!this.contentTypeSchema.pluginOptions?.i18n?.localized) {
      throw new Error('translate.batch-translate.content-type-not-localized')
    }
    this.sourceLocale = sourceLocale
    this.targetLocale = targetLocale
    if (Array.isArray(entityIds) && entityIds.length > 0) {
      this.entityIds = entityIds
    } else {
      this.entityIds = null
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
    console.log('Cancelled translation')

    await this.updateStatus('cancelled')
  }

  async waitFor() {
    if (this.promise) {
      await this.promise
    }
  }

  async updateStatus(status, additionalData = {}) {
    this.status = status
    await strapi
      .service(batchContentTypeUid)
      .update(this.id, { data: { status, ...additionalData } })
  }

  async updateProgress() {
    await strapi.service(batchContentTypeUid).update(this.id, {
      data: { progress: this.translatedEntities / this.totalEntities },
    })
  }

  async setup() {
    await this.updateStatus('setup')
    if (!this.entityIds) {
      this.totalEntities = await strapi.db
        .query(this.contentType)
        .count({ where: { locale: this.sourceLocale } })
      this.translatedEntities = await strapi.db.query(this.contentType).count({
        where: {
          locale: this.sourceLocale,
          localizations: { locale: { $eq: this.targetLocale } },
        },
      })
    }

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
      this.updateStatus('failed', error)
      throw error
    })

    let entity = null

    const populate = populateAll(this.contentTypeSchema)
    while (this.status === 'running') {
      if (this.entityIds !== null) {
        // Get an entity from the provided entity id list
        // Try until we get one or the list is empty
        while (!entity && this.entityIds.length > 0) {
          const nextId = this.entityIds.pop(0)
          entity = await strapi.db.query(this.contentType).findOne({
            where: { id: nextId, locale: this.sourceLocale },
            populate,
          })
          if (entity?.locale !== this.sourceLocale) {
            strapi.log.warn(
              `Entity ${nextId} of ${this.contentType} did not have the correct source locale ${this.sourceLocale}, skipping it...`
            )
            entity = null
          } else if (
            entity?.localizations?.filter((l) => l.locale === this.targetLocale)
              .length > 0
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
        const fieldsToTranslate = await getAllTranslatableFields(
          entity,
          this.contentTypeSchema
        )

        const translated = await getService('translate').translate({
          data: entity,
          sourceLocale: this.sourceLocale,
          targetLocale: this.targetLocale,
          fieldsToTranslate,
          priority: TRANSLATE_PRIORITY_BATCH_TRANSLATION,
        })

        const withRelations = await translateRelations(
          translated,
          this.contentTypeSchema,
          this.targetLocale
        )

        const uidsUpdated = await updateUids(withRelations, this.contentType)

        const withFieldsDeleted = filterAllDeletedFields(
          uidsUpdated,
          this.contentType
        )

        const fullyTranslatedData = cleanData(
          withFieldsDeleted,
          this.contentTypeSchema
        )
        // Add reference to other localizations
        const newLocalizations = entity.localizations.map(({ id }) => id)
        newLocalizations.push(entity.id)
        fullyTranslatedData.localizations = newLocalizations
        // Set locale
        fullyTranslatedData.locale = this.targetLocale
        // Set publishedAt to null so the translation is not published directly
        fullyTranslatedData.publishedAt =
          entity.publishedAt && this.autoPublish ? new Date() : null
        // Create localized entry
        await strapi.service(this.contentType).create({
          data: fullyTranslatedData,
          // Needed for syncing localizations
          populate: ['localizations'],
        })

        this.translatedEntities++
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
        throw new Error('Translation of an entity failed')
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

module.exports = {
  BatchTranslateJob,
}
