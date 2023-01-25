'use strict'

function stripAndUpper(locale) {
  const unstripped = locale.toUpperCase()
  const stripped = unstripped.split('-')[0]

  return { unstripped, stripped }
}

function parseLocale(strapiLocale, direction = 'target') {
  const { unstripped, stripped } = stripAndUpper(strapiLocale)

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
      possiblyUnstrippedResult = stripped
      break
    case 'PT':
      if (unstripped == 'PT-PT') possiblyUnstrippedResult = unstripped
      else if (unstripped == 'PT-BR') possiblyUnstrippedResult = unstripped
      else possiblyUnstrippedResult = 'PT-PT'
      break
    // english creole variants. Translating them to english by default
    case 'AIG':
    case 'BAH':
    case 'SVC':
    case 'VIC':
    case 'LIR':
    case 'TCH':
      possiblyUnstrippedResult = 'EN-US'
      break
    case 'EN':
      if (unstripped == 'EN-GB') possiblyUnstrippedResult = unstripped
      else if (unstripped == 'EN-US') possiblyUnstrippedResult = unstripped
      else possiblyUnstrippedResult = 'EN-US'
      break
    default:
      throw new Error('unsupported locale')
  }
  if (direction === 'source') {
    return stripAndUpper(possiblyUnstrippedResult).stripped
  }
  return possiblyUnstrippedResult
}

module.exports = {
  parseLocale,
}
