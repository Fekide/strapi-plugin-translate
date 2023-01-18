'use strict'

const defaults = require('lodash/defaults')

const defaultLocaleMap = {
  PT: 'PT-PT',
  EN: 'EN-US',
  // english creole variants. Translating them to english by default
  AIG: 'EN-US',
  BAH: 'EN-US',
  SVC: 'EN-US',
  VIC: 'EN-US',
  LIR: 'EN-US',
  TCH: 'EN-US',
}

function parseLocale(strapiLocale, localeMap = {}) {
  const unstripped = strapiLocale.toUpperCase()
  const stripped = unstripped.split('-')[0]

  defaults(localeMap, defaultLocaleMap)

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
    case 'ID':
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
    case 'TR':
    case 'UK':
    case 'ZH':
      return localeMap[stripped] || stripped
    case 'PT':
      if (unstripped == 'PT-PT') return unstripped
      if (unstripped == 'PT-BR') return unstripped
      return localeMap[stripped]
    case 'EN':
      if (unstripped == 'EN-GB') return unstripped
      if (unstripped == 'EN-US') return unstripped
      return localeMap[stripped]

    default:
      if (localeMap[stripped]) return localeMap[stripped]
      if (localeMap[unstripped]) return localeMap[unstripped]
      if (localeMap[strapiLocale]) return localeMap[strapiLocale]
      throw new Error('unsupported locale')
  }
}

module.exports = {
  parseLocale,
}
