'use strict'

const get = require('lodash/get')
const set = require('lodash/set')

const deepl = require('../utils/deepl-api')
const { BatchTranslateManager } = require('./batch-translate')

module.exports = ({ strapi }) => ({
  batchTranslateManager: new BatchTranslateManager(),

  async translate({ data, sourceLocale, targetLocale, fieldsToTranslate }) {
    const { apiKey, freeApi, glossaryId } = strapi.config.get('plugin.deepl')

    const textsToTranslate = fieldsToTranslate.map((field) => {
      return get(data, field, '')
    })

    const translateResult = await deepl.translate({
      text: textsToTranslate,
      auth_key: apiKey,
      free_api: freeApi,
      target_lang: deepl.parseLocale(targetLocale),
      source_lang: deepl.parseLocale(sourceLocale),
      glossary_id: glossaryId,
    })

    const translatedData = { ...data }
    fieldsToTranslate.forEach((field, index) => {
      set(translatedData, field, translateResult.translations[index]?.text)
    })

    return translatedData
  },

  async batchTranslate(params) {
    return await this.batchTranslateManager.submitJob(params)
  },
  async batchTranslatePauseJob(id) {
    return await this.batchTranslateManager.pauseJob(id)
  },
  async batchTranslateResumeJob(id) {
    return await this.batchTranslateManager.resumeJob(id)
  },
  async batchTranslateCancelJob(id) {
    return await this.batchTranslateManager.cancelJob(id)
  },
})
