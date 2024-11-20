'use strict'

const i18n = require('@strapi/plugin-i18n/strapi-server')
const { parseLocale } = require('../parse-locale')

const locales = i18n().services["iso-locales"]().getIsoLocales()

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
    'Korean',
    'Norwegian Bokmål',
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
  it('uses locale mapping', () => {
    const localeMap = {
      EN: 'EN-GB',
    }
    expect(parseLocale('en', localeMap)).toMatch('EN-GB')
  })
  it('does not parse en to EN as that is deprecated', () => {
    expect(parseLocale('en')).not.toEqual('EN')
  })
  it('does not parse pt to PT as that is deprecated', () => {
    expect(parseLocale('pt')).not.toEqual('PT')
  })
  it('source language is parsed without specific locale', () => {
    expect(parseLocale('en-GB', {}, 'source')).toEqual('EN')
  })
  it('source language is parsed without specific locale even with locale map', () => {
    expect(parseLocale('en-GB', {}, 'source')).toEqual('EN')
  })
})
