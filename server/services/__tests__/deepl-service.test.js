// Every text to translate becomes "translated" in this mock so it can be verified to have been changed
const translatedText = 'translated'

jest.mock('../../utils/deepl-api', () => {
  return {
    translate(props) {
      if (Array.isArray(props.text)) {
        return {
          translations: props.text.map((t) => ({
            detected_source_language: 'EN',
            text: translatedText,
          })),
        }
      } else if (props.text) {
        return {
          translations: [
            { detected_source_language: 'EN', text: translatedText },
          ],
        }
      } else {
        return { translations: [] }
      }
    },
    parseLocale: jest.fn(),
  }
})

const setup = function (params) {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(params),
    writable: true,
  })
}
afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('deepl service', () => {
  describe('translate', () => {
    beforeEach(() => setup({}))

    it('single field', async () => {
      // given
      const data = {
        title: 'test',
      }
      const sourceLocale = 'en'
      const targetLocale = 'de'
      const fieldsToTranslate = ['title']

      // when
      const result = await strapi.plugins.deepl
        .service('deeplService')
        .translate({ data, sourceLocale, targetLocale, fieldsToTranslate })

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
      const result = await strapi.plugins.deepl
        .service('deeplService')
        .translate({ data, sourceLocale, targetLocale, fieldsToTranslate })

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
      const result = await strapi.plugins.deepl
        .service('deeplService')
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
