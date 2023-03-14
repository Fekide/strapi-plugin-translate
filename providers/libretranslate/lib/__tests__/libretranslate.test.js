'use strict'
const { faker } = require('@faker-js/faker')
const { rest } = require('msw')

const provider = require('..')
const { getServer } = require('../../__mocks__/server')

const BASE_URL = 'https://lt.example.org'

const enabledLocales = [
  {
    code: 'en',
    name: 'English',
    targets: [
      'ar',
      'az',
      'ca',
      'cs',
      'da',
      'de',
      'el',
      'en',
      'eo',
      'fi',
      'fr',
      'ga',
      'he',
      'hi',
      'hu',
      'id',
      'it',
      'nl',
      'zh',
    ],
  },
]

describe('deepl provider', () => {
  let server

  function buildTranslateHandler({ maxChars, maxTexts }) {
    maxChars = maxChars || -1
    maxTexts = maxTexts || -1
    return async (req, res, ctx) => {
      const json = await req.json()
      if (
        maxTexts !== -1 &&
        Array.isArray(json.q) &&
        json.q.length > maxTexts
      ) {
        console.warn('Too many Texts', json.q.length)
        return res(ctx.status(400))
      }

      if (maxChars !== -1) {
        if (
          Array.isArray(json.q) &&
          json.q.reduce((prev, curr) => prev + curr.length, 0) > maxChars
        ) {
          console.warn('Batch translation, too many characters')
          return res(ctx.status(400))
        } else if (json.q.length > maxChars) {
          console.warn('Single translation, too many characters')
          return res(ctx.status(400))
        }
      }

      let targetLang = json.target
      if (!targetLang) {
        return res(ctx.status(400))
      }

      let sourceLang = json.source
      if (!sourceLang) {
        return res(ctx.status(400))
      }

      return res(
        ctx.json({
          translatedText: json.q,
        })
      )
    }
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
    let ltProvider

    beforeAll(() => {
      ltProvider = provider.init({ apiUrl: BASE_URL })
    })

    it('returns undefined', async () => {
      await expect(ltProvider.usage()).resolves.not.toBeDefined()
    })
  })

  describe('translate', () => {
    let ltProvider
    beforeEach(() => {
      server.use(
        rest.post(
          `${BASE_URL}/translate`,
          buildTranslateHandler({ maxTexts: 50, maxChars: 10000 })
        ),
        rest.get(`${BASE_URL}/languages`, async (req, res, ctx) => {
          return res(ctx.json(enabledLocales))
        })
      )
      ltProvider = provider.init({
        apiUrl: BASE_URL,
        apiMaxTexts: 50,
        apiMaxChars: 10000,
      })
    })

    describe('succeeds', () => {
      async function singleText() {
        // given
        const params = {
          sourceLocale: 'en',
          targetLocale: 'de',
          text: 'Some text',
        }
        // when
        const result = await ltProvider.translate(params)

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
        const result = await ltProvider.translate(params)

        // then
        expect(result).toEqual(params.text)
      }

      async function markdownTexts() {
        // given
        const params = {
          sourceLocale: 'en',
          targetLocale: 'de',
          text: ['# Heading\n\nSome text', '## Subheading\n\nSome more text'],
          format: 'markdown',
        }
        // when
        const result = await ltProvider.translate(params)

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
        const result = await ltProvider.translate(params)

        // then
        expect(result).toEqual([])
      }

      async function forNTexts(n = 120) {
        // given
        const textLength = n
        const params = {
          sourceLocale: 'en',
          targetLocale: 'de',
          text: Array.from({ length: textLength }, (_v, i) => `text ${i}`),
        }
        // when
        const result = await ltProvider.translate(params)

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

      it('with more than more texts than limit', async () => {
        await forNTexts()
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
        const result = await ltProvider.translate(params)

        // then
        expect(result).toEqual(params.text)
      })

      it('with a field larger than request size limit', async () => {
        // given
        let text = faker.lorem.paragraphs(5)
        while (text.length < 10000) {
          text += faker.lorem.paragraphs(5)
        }
        const params = {
          sourceLocale: 'en',
          targetLocale: 'de',
          text: [text],
        }
        // when
        const result = await ltProvider.translate(params)

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
                faker.datatype.number({
                  min: 10000 / 2000,
                  max: 10000 / 200,
                })
              ),
            textLength
          ),
        }
        // when
        const result = await ltProvider.translate(params)

        // then
        expect(result).toEqual(params.text)
      })

      it('with rate limiting', async () => {
        ltProvider = provider.init({
          apiUrl: BASE_URL,
          apiMaxRPM: 60,
          apiMaxTexts: 1,
        })

        let firstRequest
        let lastRequest

        server.use(
          rest.post(`${BASE_URL}/translate`, async (req, res, ctx) => {
            const json = await req.json()
            if (!firstRequest) firstRequest = new Date()
            lastRequest = new Date()

            return res(
              ctx.json({
                translatedText: json.q,
              })
            )
          })
        )

        await forNTexts(5)
        expect(lastRequest - firstRequest).toBeGreaterThanOrEqual(3900)
      })
    })

    describe('fails', () => {
      it('with missing target language', async () => {
        // given
        const params = {
          text: 'Some text',
          sourceLocale: 'en',
        }
        await expect(
          // when
          async () => ltProvider.translate(params)
          // then
        ).rejects.toThrow('source and target locale must be defined')
      })

      it('with missing source language', async () => {
        // given
        const params = {
          targetLocale: 'de',
          text: 'Some text',
        }
        await expect(
          // when
          async () => ltProvider.translate(params)
          // then
        ).rejects.toThrow('source and target locale must be defined')
      })
    })
  })

  describe('init', () => {
    it('throws when no URL is provided', () => {
      delete process.env.LT_API_URL
      expect(() => provider.init()).toThrow(
        'You must provide a URL to the LibreTranslate API'
      )
    })
  })
})
