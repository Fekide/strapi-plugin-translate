'use strict'

const { URLSearchParams } = require('url')
const axios = require('axios')
const get = require('lodash/get')
const set = require('lodash/set')

async function deeplUsage({ free_api, ...parameters }) {
  const sub_domain = free_api ? 'api-free' : 'api'
  const params = new URLSearchParams(parameters)

  return (
    await axios.post(
      `https://${sub_domain}.deepl.com/v2/usage`,
      params.toString()
    )
  ).data
}

async function deeplTranslate({ text, free_api, glossary_id, ...parameters }) {
  const sub_domain = free_api ? 'api-free' : 'api'
  const params = new URLSearchParams(parameters)
  if (Array.isArray(text)) {
    text.forEach((t) => params.append('text', t))
  } else {
    params.append('text', text)
  }
  if (glossary_id) {
    params.append('glossary_id', glossary_id)
  }
  return (
    await axios.post(
      `https://${sub_domain}.deepl.com/v2/translate`,
      params.toString()
    )
  ).data
  // return {
  //   translations: text.map(t => ({
  //     text: `Translated (${parameters.target_lang}): ${t}`,
  //     detected_source_language: "EN"
  //   }))
  // }
}

function parseLocale(strapiLocale) {
  const unstripped = strapiLocale.toUpperCase()
  const stripped = unstripped.split('-')[0]
  switch (stripped) {
    case 'BG':
    case 'CS':
    case 'DA':
    case 'DE':
    case 'EL':
    case 'ES':
    case 'ET':
    case 'FI':
    case 'FR':
    case 'HU':
    case 'IT':
    case 'JA':
    case 'LT':
    case 'LV':
    case 'NL':
    case 'PL':
    case 'RO':
    case 'RU':
    case 'SK':
    case 'SL':
    case 'SV':
    case 'ZH':
      return stripped
    case 'PT':
      if (unstripped == 'PT-PT') return unstripped
      if (unstripped == 'PT-BR') return unstripped
      return stripped
    case 'EN':
      if (unstripped == 'EN-GB') return unstripped
      if (unstripped == 'EN-US') return unstripped
      return stripped

    default:
      throw new Error('unsupported locale')
  }
}

module.exports = ({ strapi }) => ({
  async translate({ data, sourceLocale, targetLocale, translateFields }) {
    const { apiKey, freeApi, glossaryId } = strapi.config.get('plugin.deepl')

    const textsToTranslate = translateFields.map((field) => {
      return get(data, field, '')
    })

    const translateResult = await deeplTranslate({
      text: textsToTranslate,
      auth_key: apiKey,
      free_api: freeApi,
      target_lang: parseLocale(targetLocale),
      source_lang: parseLocale(sourceLocale),
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
    return await deeplUsage({
      auth_key: apiKey,
      free_api: freeApi,
    })
  },
})
