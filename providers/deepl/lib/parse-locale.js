'use strict'

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
      return stripped
    case 'PT':
      if (unstripped == 'PT-PT') return unstripped
      if (unstripped == 'PT-BR') return unstripped
      return 'PT-PT'
    // english creole variants. Translating them to english by default
    case 'AIG':
    case 'BAH':
    case 'SVC':
    case 'VIC':
    case 'LIR':
    case 'TCH':
      return 'EN-US'
    case 'EN':
      if (unstripped == 'EN-GB') return unstripped
      if (unstripped == 'EN-US') return unstripped
      return 'EN-US'

    default:
      throw new Error('unsupported locale')
  }
}

module.exports = {
  parseLocale,
}
