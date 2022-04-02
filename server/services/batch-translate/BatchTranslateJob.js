'use strict'

const { cleanData } = require('../../utils/clean-data')
const { batchContentTypeUid } = require('../../utils/constants')
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
    intervalLength = 5000,
  }) {
    this.totalEntities = 0
    this.translatedEntities = 0
    this.intervalId = null
    // TODO: this should probably be adaptive as to how many jobs are running
    // it is necessary as we do not want to get in to trouble for too many requests to deepl
    this.intervalLength = intervalLength
    this.id = id
    this.contentType = contentType
    this.contentTypeSchema = strapi.contentTypes[contentType]
    if (!this.contentTypeSchema.pluginOptions?.i18n?.localized) {
      throw new Error('deepl.batch-translate.content-type-not-localized')
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

  _resolve() {}
  _reject() {}

  _clearInterval() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
    }
  }

  async pause(setStatus = true) {
    // In case the promise has already resolved/rejected, don't run cancel behavior!
    if (['paused', 'cancelled', 'finished', 'failed'].includes(this.status)) {
      return
    }

    // pause scenario
    this._clearInterval()
    if (setStatus) {
      await this.updateStatus('paused')
    }

    this._reject('Job was paused')
  }

  async cancel() {
    // In case the promise has already resolved/rejected, don't run cancel behavior!
    if (['paused', 'cancelled', 'finished', 'failed'].includes(this.status)) {
      return
    }

    // Cancel-path scenario
    console.log('Cancelled translation')
    this._clearInterval()
    await this.updateStatus('cancelled')

    this._reject('Job was cancelled')
  }

  async waitFor() {
    if (this.promise) {
      await this.promise
    }
  }

  async updateStatus(status) {
    this.status = status
    await strapi
      .service(batchContentTypeUid)
      .update(this.id, { data: { status } })
  }

  async updateProgress() {
    await strapi.service(batchContentTypeUid).update(this.id, {
      data: { progress: this.translatedEntities / this.totalEntities },
    })
  }

  async translateOne() {
    if (this.status != 'running') {
      // We are currently not running, so we should not do anything
      // This should only happen when setup is running, otherwise the execution should already be cancelled
      return
    }
    let entity = null

    const populate = populateAll(this.contentTypeSchema)

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
      entity = await strapi.db.query(this.contentType).findOne({
        where: {
          locale: this.sourceLocale,
          localizations: {
            $or: [
              // Case there are other locales but not the target locale
              { locale: { $ne: this.targetLocale } },
              // Case there is no other locale yet (so there is no join partner and locale is null)
              { locale: { $null: true } },
            ],
          },
        },
        populate,
      })
    }

    // Cancel if there is no matching entity or we have reached our initial limit
    if (!entity || this.totalEntities == this.translatedEntities) {
      await this.updateStatus('finished')
      this._clearInterval()
      this._resolve()
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
      })

      const withRelations = await translateRelations(
        translated,
        this.contentTypeSchema,
        this.targetLocale
      )

      const uidsUpdated = await updateUids(withRelations, this.contentType)

      const fullyTranslatedData = cleanData(uidsUpdated, this.contentTypeSchema)
      // Add reference to other localizations
      const newLocalizations = entity.localizations.map((l) => l.id)
      newLocalizations.push(entity.id)
      fullyTranslatedData.localizations = newLocalizations
      // Set locale
      fullyTranslatedData.locale = this.targetLocale
      // Set publishedAt to null so the translation is not published directly
      fullyTranslatedData.publishedAt = null
      // Create localized entry

      await strapi
        .service(this.contentType)
        .create({ data: fullyTranslatedData, populate: ['localizations'] })

      this.translatedEntities++
    } catch (error) {
      strapi.log.error(error)
      if (error.details) {
        strapi.log.debug(JSON.stringify(error.details))
      }
      await this.updateStatus('failed')
      clearInterval(this.intervalId)
      this._reject('Translation of an entity failed')
      return
    }
    await this.updateProgress()
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

  start(resume = false) {
    this.promise = new Promise((resolve, reject) => {
      if (
        resume &&
        !['running', 'created', 'setup', 'paused'].includes(this.status)
      ) {
        reject('Job is not in a status to be resumed')
        return
      } else if (!resume && this.status != 'created') {
        reject('Job was started before or has already been stopped')
        return
      }

      this._reject = reject
      this._resolve = resolve

      // Start the interval before
      this.intervalId = setInterval(
        this.translateOne.bind(this),
        this.intervalLength
      )

      this.setup()
    })
    return this.promise
  }
}

module.exports = {
  BatchTranslateJob,
}
