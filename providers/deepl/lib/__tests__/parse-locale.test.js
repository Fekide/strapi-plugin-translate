'use strict'

const locales = require('@strapi/plugin-i18n/server/constants/iso-locales.json')
const { parseLocale } = require('../parse-locale')

function supportedLocale({ code, name }) {
  // Swiss German is not supported
  if (code.includes('gsw')) return false
  return [
    'Bulgarian',
    'Czech',
    'Danish',
    'German',
    'Greek',
    'English',
    'Spanish',
    'Estonian',
    'Finnish',
    'French',
    'Hungarian',
    'Indonesian',
    'Italian',
    'Japanese',
    'Lithuanian',
    'Latvian',
    'Dutch',
    'Polish',
    'Portuguese',
    'Romanian',
    'Russian',
    'Slovak',
    'Slovenian',
    'Swedish',
    'Turkish',
    'Ukrainian',
    'Chinese',
  ].some((l) => name.toLowerCase().includes(l.toLowerCase()))
}

const supportedLocales = locales.filter(supportedLocale)
const unSupportedLocales = locales.filter((l) => !supportedLocale(l))

describe('locale parser', () => {
  describe('succeeds', () => {
    it.each(supportedLocales)('for supported locale $code', ({ code }) => {
      const result = parseLocale(code)
      expect(result).toMatch(/^[A-Z]{2}(-[A-Z]{2})?$/)
    })
  })
  describe('fails', () => {
    it.each(unSupportedLocales)('for unsupported locale $code', ({ code }) => {
      expect(() => parseLocale(code)).toThrow()
    })
  })
})
