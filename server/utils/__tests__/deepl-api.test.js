const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const faker = require('@faker-js/faker').default

const {
  DEEPL_FREE_API,
  DEEPL_PAID_API,
  DEEPL_API_MAX_REQUEST_SIZE,
} = require('../constants')

const { URLSearchParams } = require('url')

const { usage, translate, parseLocale } = require('../deepl-api')

const locales = require('@strapi/plugin-i18n/server/constants/iso-locales.json')
const { stringByteLength } = require('../byte-length')

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

    Object.defineProperty(global, 'strapi', {
      value: require('../../../__mocks__/initSetup')({}),
      writable: true,
    })
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
    describe.each([true, false])('for free api %p', (freeApi) => {
      describe('succeeds', () => {
        it('with valid key', async () => {
          // given
          const params = {
            free_api: freeApi,
            auth_key: authKey,
          }
          // when
          const result = await usage(params)

          // then
          expect(mock.history.post[0].url).toEqual(
            `${freeApi ? DEEPL_FREE_API : DEEPL_PAID_API}/usage`
          )
          expect(result).toEqual(usage_result)
        })
      })
      describe('fails', () => {
        it('with invalid key', async () => {
          // given
          const params = {
            free_api: freeApi,
            auth_key: invalidAuthKey,
          }
          try {
            // when
            await usage(params)
            throw new Error('usage should not succeed')
          } catch (error) {
            // then
            expect(mock.history.post[0].url).toEqual(
              `${freeApi ? DEEPL_FREE_API : DEEPL_PAID_API}/usage`
            )
            expect(error.response.status).toEqual(403)
          }
        })
      })
    })
  })

  describe('translate', () => {
    describe.each([true, false])('for free api %p', (freeApi) => {
      beforeEach(() => {
        const translateHandler = (config) => {
          if (stringByteLength(config.data) > DEEPL_API_MAX_REQUEST_SIZE) {
            console.log({ length: stringByteLength(config.data) })
            return [413]
          }
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
            translations: [
              { detected_source_language: 'EN', text: params.text },
            ],
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

        async function forMoreThan50Texts(freeApi) {
          // given
          const textLength = 120
          const params = {
            free_api: freeApi,
            auth_key: authKey,
            target_lang: 'DE',
            text: Array.from({ length: textLength }, (_v, i) => `text ${i}`),
          }
          // when
          const result = await translate(params)

          // then
          expect(mock.history.post.length).toBeGreaterThan(1)
          expect(result).toEqual({
            translations: params.text.map((t) => ({
              detected_source_language: 'EN',
              text: t,
            })),
          })
        }

        it('with single text', async () => {
          await singleText(freeApi)
        })

        it('with multiple texts', async () => {
          await multipleTexts(freeApi)
        })

        it('with missing text', async () => {
          await forMissingText(freeApi)
        })

        it('with more than 50 texts', async () => {
          await forMoreThan50Texts(freeApi)
        })

        it('with all fields together more than request size limit', async () => {
          // given
          const textLength = 40
          const params = {
            free_api: freeApi,
            auth_key: authKey,
            target_lang: 'DE',
            text: faker.helpers.uniqueArray(
              () => faker.lorem.paragraphs(20),
              textLength
            ),
          }
          // when
          const result = await translate(params)

          // then
          expect(mock.history.post.length).toBeGreaterThan(1)
          expect(result).toEqual({
            translations: params.text.map((t) => ({
              detected_source_language: 'EN',
              text: t,
            })),
          })
        })

        it('with a field larger than request size limit', async () => {
          // given
          const textLength = 1
          const params = {
            free_api: freeApi,
            auth_key: authKey,
            target_lang: 'DE',
            text: [faker.lorem.paragraphs(DEEPL_API_MAX_REQUEST_SIZE / 200)],
          }
          // when
          const result = await translate(params)

          // then
          expect(mock.history.post.length).toBeGreaterThan(1)
          expect(result).toEqual({
            translations: params.text.map((t) => ({
              detected_source_language: 'EN',
              text: t,
            })),
          })
        })

        it.skip('with fields larger than request size limit count of new lines preserved', async () => {
          // given
          const textLength = 10
          const params = {
            free_api: freeApi,
            auth_key: authKey,
            target_lang: 'DE',
            text: faker.helpers.uniqueArray(
              () =>
                faker.lorem.paragraphs(
                  DEEPL_API_MAX_REQUEST_SIZE / 200,
                  '\n'.repeat(faker.datatype.number({ min: 1, max: 3 }))
                ),
              textLength
            ),
          }
          // when
          const result = await translate(params)

          // then
          expect(mock.history.post.length).toBeGreaterThan(1)
          expect(result).toEqual({
            translations: params.text.map((t) => ({
              detected_source_language: 'EN',
              text: t,
            })),
          })
        })

        it('with some fields larger than request size limit', async () => {
          // given
          const textLength = 20
          const params = {
            free_api: freeApi,
            auth_key: authKey,
            target_lang: 'DE',
            text: faker.helpers.uniqueArray(
              () =>
                faker.lorem.paragraphs(
                  faker.datatype.number({
                    min: DEEPL_API_MAX_REQUEST_SIZE / 2000,
                    max: DEEPL_API_MAX_REQUEST_SIZE / 200,
                  })
                ),
              textLength
            ),
          }
          // when
          const result = await translate(params)

          // then
          expect(mock.history.post.length).toBeGreaterThan(1)
          expect(result).toEqual({
            translations: params.text.map((t) => ({
              detected_source_language: 'EN',
              text: t,
            })),
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

        it('with invalid key', async () => {
          await forInvalidKey(freeApi)
        })

        it('with missing target language', async () => {
          await forMissingTargetLang(freeApi)
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
