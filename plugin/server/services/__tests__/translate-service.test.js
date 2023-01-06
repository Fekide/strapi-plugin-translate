'use strict'

const { getService } = require('../../utils')

// Every text to translate becomes "translated" in this mock so it can be verified to have been changed
const translatedByFormat = {
  plain: 'translatedPlain',
  markdown: 'translatedMarkdown',
  html: 'translatedHTML',
}

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
              async translate({ text, sourceLocale, targetLocale, format }) {
                if (!['plain', 'html', 'markdown'].includes(format)) {
                  throw new Error(`Unknown format ${format}`)
                }
                if (!text) {
                  return []
                }
                if (!sourceLocale | !targetLocale) {
                  throw new Error('source and target locale must be defined')
                }

                const textArray = Array.isArray(text) ? text : [text]
                return textArray.map(() => translatedByFormat[format])
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
      const fieldsToTranslate = [{ field: 'title', format: 'plain' }]

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
        title: translatedByFormat.plain,
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
        { field: 'title', format: 'plain' },
        { field: 'content', format: 'markdown' },
        { field: 'component.text', format: 'plain' },
        { field: 'repeated.0.text', format: 'plain' },
        { field: 'repeated.1.text', format: 'plain' },
      ]

      // when
      const result = await strapi.plugins.translate
        .service('translate')
        .translate({ data, sourceLocale, targetLocale, fieldsToTranslate })

      // then
      expect(result).toEqual({
        title: translatedByFormat.plain,
        content: translatedByFormat.markdown,
        untranslated: 'not translated',
        component: {
          text: translatedByFormat.plain,
          number: 6,
        },
        repeated: [
          { text: translatedByFormat.plain },
          { text: translatedByFormat.plain },
        ],
      })
    })
  })
})
