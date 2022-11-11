'use strict'

const get = require('lodash/get')
const set = require('lodash/set')

const { getService } = require('../utils/get-service')
const { BatchTranslateManager } = require('./batch-translate')

module.exports = ({ strapi }) => ({
  batchTranslateManager: new BatchTranslateManager(),

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

    const textsToTranslate = fieldsToTranslate.map((field) => {
      return get(data, field, '')
    })

    const translateResult = await strapi
      .plugin('translate')
      .provider.translate({
        text: textsToTranslate,
        targetLocale,
        sourceLocale,
        priority,
      })

    const translatedData = { ...data }
    fieldsToTranslate.forEach((field, index) => {
      set(translatedData, field, translateResult[index])
    })

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
  async contentTypes() {
    const localizedContentTypes = Object.keys(strapi.contentTypes).filter(
      (ct) => strapi.contentTypes[ct].pluginOptions?.i18n?.localized
    )

    const locales = await strapi.service('plugin::i18n.locales').find()

    const reports = await Promise.all(
      localizedContentTypes.map(async (contentType) => {
        // get jobs
        const jobs = await strapi.db
          .query('plugin::translate.batch-translate-job')
          .findMany({
            where: { contentType: { $eq: contentType } },
            orderBy: { updatedAt: 'desc' },
          })

        // calculate current translation statuses
        const info = await Promise.all(
          locales.map(async ({ code }) => {
            const countPromise = strapi.db
              .query(contentType)
              .count({ where: { locale: code } })
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
            job: jobs.find((job) => job.targetLocale === code),
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
