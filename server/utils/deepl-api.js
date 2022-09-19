'use strict'

const { URLSearchParams } = require('url')
const axios = require('axios')

const _ = require('lodash')

const { DEEPL_FREE_API, DEEPL_PAID_API } = require('./constants')
const { splitTextArrayIntoChunks } = require('./chunks')

async function usage({ free_api, ...parameters }) {
  const apiURL = free_api ? DEEPL_FREE_API : DEEPL_PAID_API
  const params = new URLSearchParams(parameters)

  return (await axios.post(`${apiURL}/usage`, params.toString())).data
}

async function translate({ text, free_api, glossary_id, ...parameters }) {
  if (!text) {
    return { translations: [] }
  }

  const apiURL = free_api ? DEEPL_FREE_API : DEEPL_PAID_API
  const params = new URLSearchParams(parameters)
  if (glossary_id) {
    params.append('glossary_id', glossary_id)
  }

  const textArray = Array.isArray(text) ? text : [text]

  const { chunks, reduceFunction } = splitTextArrayIntoChunks(textArray)

  return reduceFunction(
    await Promise.all(
      chunks.map(async (texts) => {
        const requestParams = new URLSearchParams(params)
        texts.forEach((t) => requestParams.append('text', t))
        const requestParamsString = requestParams.toString()
        return (await axios.post(`${apiURL}/translate`, requestParamsString))
          .data
      })
    )
  )
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

module.exports = {
  usage,
  translate,
  parseLocale,
}
