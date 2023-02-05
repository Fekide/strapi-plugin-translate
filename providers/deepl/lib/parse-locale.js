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

function stripAndUpper(locale) {
  const unstripped = locale.toUpperCase()
  const stripped = unstripped.split('-')[0]

  return { unstripped, stripped }
}

function parseLocale(strapiLocale, localeMap = {}, direction = 'target') {
  const { unstripped, stripped } = stripAndUpper(strapiLocale)

  defaults(localeMap, defaultLocaleMap)

  let possiblyUnstrippedResult = stripped
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
    case 'KO':
    case 'LT':
    case 'LV':
    case 'NB':
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
      possiblyUnstrippedResult = localeMap[stripped] || stripped
      break
    case 'PT':
      if (unstripped == 'PT-PT') possiblyUnstrippedResult = unstripped
      else if (unstripped == 'PT-BR') possiblyUnstrippedResult = unstripped
      else possiblyUnstrippedResult = localeMap[stripped] || 'PT-PT'
      break
    case 'EN':
      if (unstripped == 'EN-GB') possiblyUnstrippedResult = unstripped
      else if (unstripped == 'EN-US') possiblyUnstrippedResult = unstripped
      else possiblyUnstrippedResult = localeMap[stripped] || 'EN-US'
      break
    default:
      if (localeMap[stripped]) possiblyUnstrippedResult = localeMap[stripped]
      else if (localeMap[unstripped])
        possiblyUnstrippedResult = localeMap[unstripped]
      else if (localeMap[strapiLocale])
        possiblyUnstrippedResult = localeMap[strapiLocale]
      else throw new Error('unsupported locale')
  }
  if (direction === 'source') {
    return stripAndUpper(possiblyUnstrippedResult).stripped
  }
  return possiblyUnstrippedResult
}

module.exports = {
  parseLocale,
}
