'use strict'

const { URLSearchParams } = require('url')
const axios = require('axios')

async function usage({ free_api, ...parameters }) {
  const sub_domain = free_api ? 'api-free' : 'api'
  const params = new URLSearchParams(parameters)

  return (
    await axios.post(
      `https://${sub_domain}.deepl.com/v2/usage`,
      params.toString()
    )
  ).data
}

async function translate({ text, free_api, glossary_id, ...parameters }) {
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
