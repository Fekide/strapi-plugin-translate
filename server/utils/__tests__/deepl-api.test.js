const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')

const { DEEPL_FREE_API, DEEPL_PAID_API } = require('../constants')

const { URLSearchParams } = require('url')

const { usage, translate, parseLocale } = require('../deepl-api')

const locales = require('@strapi/plugin-i18n/server/constants/iso-locales.json')

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
    'Chinese',
  ].some((l) => name.toLowerCase().includes(l.toLowerCase()))
}

const supportedLocales = locales.filter(supportedLocale)
const unSupportedLocales = locales.filter((l) => !supportedLocale(l))

const authKey = 'token'
const invalidAuthKey = 'invalid'

describe('deepl api', () => {
  let mock

  beforeAll(() => {
    mock = new MockAdapter(axios)
  })

  afterEach(() => {
    mock.reset()
  })

  describe('usage', () => {
    const usage_result = {
      character_count: 180118,
      character_limit: 1250000,
    }

    beforeEach(() => {
      const usageHandler = (config) => {
        const params = new URLSearchParams(config.data)
        if (params.get('auth_key') == authKey) {
          return [200, usage_result]
        }
        return [403]
      }
      mock.onPost(`${DEEPL_FREE_API}/usage`).reply(usageHandler)
      mock.onPost(`${DEEPL_PAID_API}/usage`).reply(usageHandler)
    })

    describe('succeeds', () => {
      it('for free api with valid key', async () => {
        // given
        const params = {
          free_api: true,
          auth_key: authKey,
        }
        // when
        const result = await usage(params)

        // then
        expect(mock.history.post[0].url).toEqual(`${DEEPL_FREE_API}/usage`)
        expect(result).toEqual(usage_result)
      })

      it('for paid api with valid key', async () => {
        // given
        const params = {
          free_api: false,
          auth_key: authKey,
        }
        // when
        const result = await usage(params)

        // then
        expect(mock.history.post[0].url).toEqual(`${DEEPL_PAID_API}/usage`)
        expect(result).toEqual(usage_result)
      })
    })
    describe('fails', () => {
      it('for free api with invalid key', async () => {
        // given
        const params = {
          free_api: true,
          auth_key: invalidAuthKey,
        }
        try {
          // when
          await usage(params)
          throw new Error('usage should not succeed')
        } catch (error) {
          expect(mock.history.post[0].url).toEqual(`${DEEPL_FREE_API}/usage`)
          expect(error.response.status).toEqual(403)
        }

        // then
      })

      it('for paid api with invalid key', async () => {
        // given
        const params = {
          free_api: false,
          auth_key: invalidAuthKey,
        }
        try {
          // when
          await usage(params)
          fail('usage should not succeed')
        } catch (error) {
          // then
          expect(mock.history.post[0].url).toEqual(`${DEEPL_PAID_API}/usage`)
          expect(error.response.status).toEqual(403)
        }
      })
    })
  })

  describe('translate', () => {
    beforeEach(() => {
      const translateHandler = (config) => {
        const params = new URLSearchParams(config.data)
        if (params.get('auth_key') == authKey) {
          let text = params.getAll('text')
          if (text.length == 0) {
            return [400]
          }
          if (text.length > 50) {
            return [413]
          }
          let targetLang = params.get('target_lang')
          if (!targetLang) {
            return [400]
          }
          return [
            200,
            {
              translations: text.map((t) => ({
                detected_source_language: 'EN',
                text: t,
              })),
            },
          ]
        }
        return [403]
      }
      mock.onPost(`${DEEPL_FREE_API}/translate`).reply(translateHandler)
      mock.onPost(`${DEEPL_PAID_API}/translate`).reply(translateHandler)
    })

    describe('succeeds', () => {
      async function singleText(freeApi) {
        // given
        const params = {
          free_api: freeApi,
          auth_key: authKey,
          target_lang: 'DE',
          text: 'Some text',
        }
        // when
        const result = await translate(params)

        // then
        expect(mock.history.post[0].url).toEqual(
          `${freeApi ? DEEPL_FREE_API : DEEPL_PAID_API}/translate`
        )
        expect(result).toEqual({
          translations: [{ detected_source_language: 'EN', text: params.text }],
        })
      }

      async function multipleTexts(freeApi) {
        // given
        const params = {
          free_api: freeApi,
          auth_key: authKey,
          target_lang: 'DE',
          text: ['Some text', 'Some more text', 'Even more text'],
        }
        // when
        const result = await translate(params)

        // then
        expect(mock.history.post[0].url).toEqual(
          `${freeApi ? DEEPL_FREE_API : DEEPL_PAID_API}/translate`
        )
        expect(result).toEqual({
          translations: params.text.map((t) => ({
            detected_source_language: 'EN',
            text: t,
          })),
        })
      }

      async function forMissingText(freeApi) {
        // given
        const params = {
          free_api: freeApi,
          auth_key: authKey,
          target_lang: 'DE',
        }
        // when
        const result = await translate(params)

        // then
        expect(mock.history.post.length).toEqual(0)
        expect(result).toEqual({
          translations: [],
        })
      }

      describe('for free api', () => {
        it('with single text', async () => {
          await singleText(true)
        })

        it('with multiple texts', async () => {
          await multipleTexts(true)
        })

        it('with missing text', async () => {
          await forMissingText(true)
        })
      })
      describe('for paid api', () => {
        it('with single text', async () => {
          await singleText(false)
        })

        it('with multiple texts', async () => {
          await multipleTexts(false)
        })

        it('with missing text', async () => {
          await forMissingText(false)
        })
      })
    })

    describe('fails', () => {
      async function forInvalidKey(freeApi) {
        // given
        const params = {
          free_api: freeApi,
          auth_key: invalidAuthKey,
          target_lang: 'DE',
          text: 'Some text',
        }
        await expect(
          // when
          async () => await translate(params)
          // then
        ).rejects.toThrow('403')
        expect(mock.history.post[0].url).toEqual(
          `${freeApi ? DEEPL_FREE_API : DEEPL_PAID_API}/translate`
        )
      }
      async function forMissingTargetLang(freeApi) {
        // given
        const params = {
          free_api: freeApi,
          auth_key: authKey,
          text: 'Some text',
        }
        await expect(
          // when
          async () => await translate(params)
          // then
        ).rejects.toThrow('400')
        expect(mock.history.post[0].url).toEqual(
          `${freeApi ? DEEPL_FREE_API : DEEPL_PAID_API}/translate`
        )
      }

      describe('for free api', () => {
        it('with invalid key', async () => {
          await forInvalidKey(true)
        })

        it('with missing target language', async () => {
          await forMissingTargetLang(true)
        })
      })
      describe('for paid api', () => {
        it('with invalid key', async () => {
          await forInvalidKey(false)
        })

        it('with missing target language', async () => {
          await forMissingTargetLang(false)
        })
      })
    })
  })

  describe('locale parser', () => {
    describe('succeeds', () => {
      it.each(supportedLocales)('for supported locale $code', ({ code }) => {
        const result = parseLocale(code)
        expect(result).toMatch(/^[A-Z]{2}(-[A-Z]{2})?$/)
      })
    })
    describe('fails', () => {
      it.each(unSupportedLocales)(
        'for unsupported locale $code',
        ({ code }) => {
          expect(() => parseLocale(code)).toThrow()
        }
      )
    })
  })
})
