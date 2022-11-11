'use strict'

const { getService } = require('../../utils')

// Every text to translate becomes "translated" in this mock so it can be verified to have been changed
const translatedText = 'translated'

const setup = function (params) {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(params),
    writable: true,
  })
}
afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('provider service', () => {
  describe('translate', () => {
    beforeEach(() =>
      setup({
        provider: {
          provider: 'dummy',
          name: 'Dummy',
          init() {
            return {
              async translate({ text, sourceLocale, targetLocale }) {
                if (!text) {
                  return []
                }
                if (!sourceLocale | !targetLocale) {
                  throw new Error('source and target locale must be defined')
                }

                const textArray = Array.isArray(text) ? text : [text]
                return textArray.map(() => 'translated')
              },
              async usage() {
                return {
                  count: 1000,
                  limit: 10000,
                }
              },
            }
          },
        },
      })
    )

    it('single field', async () => {
      // given
      const data = {
        title: 'test',
      }
      const sourceLocale = 'en'
      const targetLocale = 'de'
      const fieldsToTranslate = ['title']

      // when
      const result = await getService('translate').translate({
        data,
        sourceLocale,
        targetLocale,
        fieldsToTranslate,
      })

      // then
      expect(result).toEqual({
        ...data,
        title: translatedText,
      })
    })

    it('no fields', async () => {
      // given
      const data = {
        title: 'test',
      }
      const sourceLocale = 'en'
      const targetLocale = 'de'
      const fieldsToTranslate = []

      // when
      const result = await getService('translate').translate({
        data,
        sourceLocale,
        targetLocale,
        fieldsToTranslate,
      })

      // then
      expect(result).toEqual(data)
    })

    it('multiple and nested fields', async () => {
      // given
      const data = {
        title: 'test',
        content: 'long content',
        untranslated: 'not translated',
        component: {
          text: 'test',
          number: 6,
        },
        repeated: [{ text: 'hello' }, { text: 'bye' }],
      }
      const sourceLocale = 'en'
      const targetLocale = 'de'
      const fieldsToTranslate = [
        'title',
        'content',
        'component.text',
        'repeated.0.text',
        'repeated.1.text',
      ]

      // when
      const result = await strapi.plugins.translate
        .service('translate')
        .translate({ data, sourceLocale, targetLocale, fieldsToTranslate })

      // then
      expect(result).toEqual({
        title: translatedText,
        content: translatedText,
        untranslated: 'not translated',
        component: {
          text: translatedText,
          number: 6,
        },
        repeated: [{ text: translatedText }, { text: translatedText }],
      })
    })
  })
})
