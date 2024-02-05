'use strict'
const { URLSearchParams } = require('url')
const { faker } = require('@faker-js/faker')
const {
  stringByteLength,
} = require('strapi-plugin-translate/server/utils/byte-length')
const { http, HttpResponse } = require('msw')

const {
  DEEPL_FREE_API,
  DEEPL_PAID_API,
  DEEPL_API_MAX_REQUEST_SIZE,
} = require('../constants')
const provider = require('../')
const { getServer } = require('../../__mocks__/server')

const deeplTestApi = 'https://test.api.deepl.com'

const authKey = 'token'
const invalidAuthKey = 'invalid'
const usage_result = {
  character_count: 180118,
  character_limit: 1250000,
}

describe('deepl provider', () => {
  let server

  const isAuthenticated = (req) => {
    const passedAuthKey = req.headers
      .get('authorization')
      .replace('DeepL-Auth-Key', '')
      .trim()
    let matchAuthKey = authKey
    if (req.url.toString().startsWith(DEEPL_FREE_API)) {
      matchAuthKey += ':fx'
    } else if (req.url.toString().startsWith(deeplTestApi)) {
      matchAuthKey += ':test'
    }
    return matchAuthKey === passedAuthKey
  }

  const usageHandler = async ({ request }) => {
    if (isAuthenticated(request)) {
      return HttpResponse.json(usage_result, { status: 200 })
    }
    return new HttpResponse(null, { status: 403 })
  }
  const translateHandler = async ({ request }) => {
    const body = await request.text()
    if (stringByteLength(body || '') > DEEPL_API_MAX_REQUEST_SIZE) {
      console.log({ length: stringByteLength(body || '') })
      return new HttpResponse(null, { status: 413 })
    }
    const params = new URLSearchParams(body)
    if (isAuthenticated(request)) {
      let text = params.getAll('text')
      if (text.length == 0) {
        return new HttpResponse(null, { status: 400 })
      }
      if (text.length > 50) {
        return new HttpResponse(null, { status: 413 })
      }
      let targetLang = params.get('target_lang')
      if (!targetLang) {
        return new HttpResponse(null, { status: 400 })
      }
      return HttpResponse.json({
        translations: text.map((t) => ({
          detected_source_language: 'EN',
          text: t,
        })),
      })
    }
    return new HttpResponse(null, { status: 403 })
  }
  beforeAll(() => {
    server = getServer()

    Object.defineProperty(global, 'strapi', {
      value: require('../../__mocks__/initStrapi')({}),
      writable: true,
    })
  })

  afterEach(async () => {
    server.resetHandlers()
  })

  afterAll(async () => {
    server.close()
  })
  describe('usage', () => {
    describe.each([
      [true, true],
      [true, false],
      [false, true],
      [false, false],
    ])('for free api %p, with key valid %p', (freeApi, validKey) => {
      let deeplProvider

      beforeAll(() => {
        const usedKey = validKey ? authKey : invalidAuthKey
        deeplProvider = provider.init({
          apiKey: freeApi ? `${usedKey}:fx` : usedKey,
        })
      })
      beforeEach(() => {
        server.use(
          http.get(`${DEEPL_FREE_API}/usage`, usageHandler),
          http.get(`${DEEPL_PAID_API}/usage`, usageHandler)
        )
      })
      if (validKey) {
        describe('succeeds', () => {
          it('with valid key', async () => {
            // when
            const result = await deeplProvider.usage()

            // then
            expect(result).toEqual({
              count: usage_result.character_count,
              limit: usage_result.character_limit,
            })
          })
        })
      } else {
        describe('fails', () => {
          it('with invalid key', async () => {
            await expect(deeplProvider.usage()).rejects.toThrow(
              'Authorization failure'
            )
          })
        })
      }
    })
  })

  describe('translate', () => {
    beforeEach(() => {
      server.use(
        http.post(`${DEEPL_FREE_API}/translate`, translateHandler),
        http.post(`${DEEPL_PAID_API}/translate`, translateHandler)
      )
    })
    describe.each([
      [true, true],
      [true, false],
      [false, true],
      [false, false],
    ])('for free api %p, with key valid %p', (freeApi, validKey) => {
      let deeplProvider
      beforeAll(() => {
        const usedKey = validKey ? authKey : invalidAuthKey
        deeplProvider = provider.init({
          apiKey: freeApi ? `${usedKey}:fx` : usedKey,
        })
      })
      if (validKey) {
        describe('succeeds', () => {
          async function singleText() {
            // given
            const params = {
              sourceLocale: 'en',
              targetLocale: 'de',
              text: 'Some text',
            }
            // when
            const result = await deeplProvider.translate(params)

            // then
            expect(result).toEqual([params.text])
          }

          async function multipleTexts() {
            // given
            const params = {
              sourceLocale: 'en',
              targetLocale: 'de',
              text: ['Some text', 'Some more text', 'Even more text'],
            }
            // when
            const result = await deeplProvider.translate(params)

            // then
            expect(result).toEqual(params.text)
          }

          async function markdownTexts() {
            // given
            const params = {
              sourceLocale: 'en',
              targetLocale: 'de',
              text: [
                '# Heading\n\nSome text',
                '## Subheading\n\nSome more text',
              ],
              format: 'markdown',
            }
            // when
            const result = await deeplProvider.translate(params)

            // then
            expect(result).toEqual(params.text)
          }

          async function forMissingText() {
            // given
            const params = {
              sourceLocale: 'en',
              targetLocale: 'de',
            }
            // when
            const result = await deeplProvider.translate(params)

            // then
            expect(result).toEqual([])
          }

          async function forMoreThan50Texts() {
            // given
            const textLength = 120
            const params = {
              sourceLocale: 'en',
              targetLocale: 'de',
              text: Array.from({ length: textLength }, (_v, i) => `text ${i}`),
            }
            // when
            const result = await deeplProvider.translate(params)

            // then
            expect(result).toEqual(params.text)
          }

          it('with single text', async () => {
            await singleText()
          })

          it('with multiple texts', async () => {
            await multipleTexts()
          })

          it('with missing text', async () => {
            await forMissingText()
          })

          it('with markdown texts', async () => {
            await markdownTexts()
          })

          it('with more than 50 texts', async () => {
            await forMoreThan50Texts()
          })

          it('with all fields together more than request size limit', async () => {
            // given
            const textLength = 40
            const params = {
              sourceLocale: 'en',
              targetLocale: 'de',
              text: faker.helpers.uniqueArray(
                () => faker.lorem.paragraphs(20),
                textLength
              ),
            }
            // when
            const result = await deeplProvider.translate(params)

            // then
            expect(result).toEqual(params.text)
          })

          it('with a field larger than request size limit', async () => {
            // given
            const params = {
              sourceLocale: 'en',
              targetLocale: 'de',
              text: [faker.lorem.paragraphs(DEEPL_API_MAX_REQUEST_SIZE / 200)],
            }
            // when
            const result = await deeplProvider.translate(params)

            // then
            expect(result).toEqual(params.text)
          })

          it.skip('with fields larger than request size limit count of new lines preserved', async () => {
            // given
            const textLength = 10
            const params = {
              sourceLocale: 'en',
              targetLocale: 'de',
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
            const result = await deeplProvider.translate(params)

            // then
            expect(result).toEqual(params.text)
          })

          it('with some fields larger than request size limit', async () => {
            // given
            const textLength = 20
            const params = {
              sourceLocale: 'en',
              targetLocale: 'de',
              text: faker.helpers.uniqueArray(
                () =>
                  faker.lorem.paragraphs(
                    faker.number.int({
                      min: DEEPL_API_MAX_REQUEST_SIZE / 2000,
                      max: DEEPL_API_MAX_REQUEST_SIZE / 200,
                    })
                  ),
                textLength
              ),
            }
            // when
            const result = await deeplProvider.translate(params)

            // then
            expect(result).toEqual(params.text)
          })
        })
      }
      describe('fails', () => {
        async function forInvalidKey() {
          // given
          const params = {
            sourceLocale: 'en',
            targetLocale: 'de',
            text: 'Some text',
          }
          await expect(
            // when
            async () => deeplProvider.translate(params)
            // then
          ).rejects.toThrow('Authorization failure')
        }
        async function forMissingTargetLang() {
          // given
          const params = {
            text: 'Some text',
          }
          await expect(
            // when
            async () => deeplProvider.translate(params)
            // then
          ).rejects.toThrow('source and target locale must be defined')
        }
        if (!validKey) {
          it('with invalid key', async () => {
            await forInvalidKey()
          })
        }

        it('with missing target language', async () => {
          await forMissingTargetLang()
        })
      })
    })
  })

  describe('setup', () => {
    beforeEach(() => {
      server.use(
        http.get(`${DEEPL_FREE_API}/usage`, usageHandler),
        http.get(`${DEEPL_PAID_API}/usage`, usageHandler),
        http.get(`${deeplTestApi}/v2/usage`, usageHandler)
      )
    })
    describe('provider options', () => {
      it('key used', async () => {
        const deeplProvider = provider.init({
          apiKey: authKey,
        })
        deeplProvider.usage().catch((e) => console.error(e))
        await expect(deeplProvider.usage()).resolves.toBeTruthy()
      })

      it('URL used', async () => {
        const deeplProvider = provider.init({
          apiKey: `${authKey}:test`,
          apiUrl: deeplTestApi,
        })

        await expect(deeplProvider.usage()).resolves.toBeTruthy()
      })

      describe('api options used', () => {
        const registerHandlerEnforceParams = (
          requiredParams,
          forbiddenParams = []
        ) => {
          const handler = async ({ request }) => {
            const body = await request.text()
            const params = new URLSearchParams(body)

            for (const key of forbiddenParams) {
              if (params.has(key)) {
                return new HttpResponse.text(
                  `Server should not have received param ${key}`,
                  { status: 400 }
                )
              }
            }
            for (const key of Object.keys(requiredParams)) {
              if (!params.has(key)) {
                return new HttpResponse.text(
                  `Server did not receive required param ${key}`,
                  { status: 400 }
                )
              } else if (params.get(key) !== requiredParams[key]) {
                return new HttpResponse.text(
                  `Required param ${key}=${
                    requiredParams[key]
                  } did not match received ${key}=${params.get(key)}`,
                  { status: 400 }
                )
              }
            }

            // skip authentication and validation
            let text = params.getAll('text')
            return HttpResponse.json({
              translations: text.map((t) => ({
                detected_source_language: 'EN',
                text: t,
              })),
            })
          }
          server.use(http.post(`${DEEPL_PAID_API}/translate`, handler))
        }

        it('uses formality when provided', async () => {
          registerHandlerEnforceParams({ formality: 'prefer_less' })

          const deeplProvider = provider.init({
            apiKey: authKey,
            apiOptions: { formality: 'prefer_less' },
          })

          // given
          const params = {
            sourceLocale: 'en',
            targetLocale: 'de',
            text: 'Some text',
          }
          // when
          const result = await deeplProvider.translate(params)

          // then
          expect(result).toEqual([params.text])
        })

        it('does not use tagHandling even if provided', async () => {
          registerHandlerEnforceParams({}, ['tagHandling'])

          const deeplProvider = provider.init({
            apiKey: authKey,
            apiOptions: { tagHandling: 'html' },
          })

          // given
          const params = {
            sourceLocale: 'en',
            targetLocale: 'de',
            text: 'Some text',
          }
          // when
          const result = await deeplProvider.translate(params)

          // then
          expect(result).toEqual([params.text])
        })
      })
    })

    describe('environment variables', () => {
      afterEach(() => {
        delete process.env.DEEPL_API_KEY
        delete process.env.DEEPL_API_URL
      })

      it('env var key used', async () => {
        process.env.DEEPL_API_KEY = authKey
        const deeplProvider = provider.init({})

        await expect(deeplProvider.usage()).resolves.toBeTruthy()
      })

      it('env var URL used', async () => {
        process.env.DEEPL_API_URL = deeplTestApi
        const deeplProvider = provider.init({
          apiKey: `${authKey}:test`,
        })

        await expect(deeplProvider.usage()).resolves.toBeTruthy()
      })
    })
  })
})
