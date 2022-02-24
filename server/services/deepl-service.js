'use strict'

const get = require('lodash/get')
const set = require('lodash/set')

const deepl = require('../utils/deepl-api')

module.exports = ({ strapi }) => ({
  async translate({ data, sourceLocale, targetLocale, translateFields }) {
    const { apiKey, freeApi, glossaryId } = strapi.config.get('plugin.deepl')

    const textsToTranslate = translateFields.map((field) => {
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
    translateFields.forEach((field, index) => {
      set(translatedData, field, translateResult.translations[index]?.text)
    })

    return translatedData
  },

  async usage() {
    const { apiKey, freeApi } = strapi.config.get('plugin.deepl')
    return await deepl.usage({
      auth_key: apiKey,
      free_api: freeApi,
    })
  },
})
