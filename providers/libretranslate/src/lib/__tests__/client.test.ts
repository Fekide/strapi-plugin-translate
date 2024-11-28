'use strict'
import { URLSearchParams } from 'url'
import {
  DefaultBodyType,
  http,
  HttpResponse,
  HttpResponseResolver,
  PathParams,
} from 'msw'

import { getServer } from '../../__mocks__/server'
import { Client } from '../client/index'
import { SetupServer } from 'msw/node'
import setup from '../../__mocks__/initStrapi'

const VALID_URL = 'https://valid.url'
const INVALID_URL = 'https://not-valid'

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

describe('libretranslate client', () => {
  let server: SetupServer

  const translateHandler: HttpResponseResolver = async ({ request }) => {
    const body = await request.text()
    const params = new URLSearchParams(body)
    let text = params.getAll('text')
    return HttpResponse.json({ translatedText: text })
  }
  const languagesHandler: HttpResponseResolver = async () => {
    return HttpResponse.json(enabledLocales)
  }
  beforeAll(async () => {
    server = getServer()

    await setup()
  })

  afterEach(async () => {
    server.resetHandlers()
  })

  afterAll(async () => {
    server.close()
  })

  describe('init', () => {
    beforeEach(() => {
      server.use(http.post(`${VALID_URL}/translate`, translateHandler))
      server.use(http.get(`${VALID_URL}/languages`, languagesHandler))
    })

    it('sets LocaleInformation default values', async () => {
      server.use(
        http.get(`${INVALID_URL}/languages`, async () => {
          await new Promise((r) => setTimeout(r, 200))

          return new HttpResponse(null, { status: 500 })
        })
      )
      const client = new Client(INVALID_URL)
      expect(client.localeInformation).toBeDefined()
      expect(client.localeInformation.length).toBe(30)

      // wait until sever response is resolved, prevents logging after test completion
      await new Promise((r) => setTimeout(r, 200))
    })

    it('sets LocaleInformation according to server response', async () => {
      const client = new Client(VALID_URL)

      // wait a bit for the server response to resolve
      await new Promise((r) => setTimeout(r, 100))

      expect(client.localeInformation).toEqual(enabledLocales)
    })
  })

  describe('getLocaleInformation', () => {
    let client: Client
    beforeEach(() => {
      server.use(http.get(`${VALID_URL}/languages`, languagesHandler))

      client = new Client(VALID_URL)
    })

    it('works for ok response', async () => {
      expect(await client.getLocaleInformation()).toEqual(enabledLocales)
    })

    it.each([404, 400, 500, 403])(
      'throws Error for non ok response code %d',
      async (status) => {
        server.use(
          http.get(
            `${VALID_URL}/languages`,
            () => new HttpResponse(null, { status })
          )
        )

        expect(async () => client.getLocaleInformation()).rejects.toThrow(
          'failed with '
        )
      }
    )

    it('throws Error for network error', async () => {
      server.use(http.get(`${VALID_URL}/languages`, () => HttpResponse.error()))

      expect(async () => client.getLocaleInformation()).rejects.toThrow(
        'Did not receive response'
      )
    })
  })

  describe('translateText', () => {
    let client: Client
    beforeEach(() => {
      server.use(http.post(`${VALID_URL}/translate`, translateHandler))
      server.use(http.get(`${VALID_URL}/languages`, languagesHandler))

      client = new Client(VALID_URL)
    })

    it('does not throw for ok response', async () => {
      expect(
        client.translateText('text', 'source', 'target')
      ).resolves.not.toThrow()
    })

    it('uses API key if supplied', () => {
      client = new Client(VALID_URL, 'my-api-key')

      server.use(
        http.post(`${VALID_URL}/translate`, async ({ request }) => {
          expect(await request.json()).toEqual(
            expect.objectContaining({ api_key: 'my-api-key' })
          )

          return HttpResponse.json({ translatedText: 'text' })
        })
      )

      expect(
        client.translateText('text', 'source', 'target', 'text')
      ).resolves.not.toThrow()
    })

    it.each([
      ['text', 'en', 'de', 'text'],
      ['<h1>text</h1>', 'de', 'en', 'html'],
    ])(
      'passes parameters correctly',
      async ([text, source, target, format]) => {
        server.use(
          http.post(`${VALID_URL}/translate`, async ({ request }) => {
            expect(await request.json()).toEqual(
              expect.objectContaining({ q: text, source, target, format })
            )

            return HttpResponse.json({ translatedText: 'text' })
          })
        )

        expect(
          client.translateText(text, source, target, format as any)
        ).resolves.not.toThrow()
      }
    )

    it.each([404, 400, 500, 403])(
      'throws Error for non ok response code %d',
      async (status) => {
        server.use(
          http.post(
            `${VALID_URL}/translate`,
            () => new HttpResponse(null, { status })
          )
        )

        expect(client.translateText('text', 'src', 'target')).rejects.toThrow()
      }
    )

    it('throws Error for network error', async () => {
      server.use(
        http.post(`${VALID_URL}/translate`, () => HttpResponse.error())
      )

      expect(async () =>
        client.translateText('text', 'src', 'target')
      ).rejects.toThrow('Did not receive response')
    })
  })

  describe('parseLocales', () => {
    let client: Client
    beforeEach(() => {
      server.use(http.get(`${VALID_URL}/languages`, languagesHandler))

      client = new Client(VALID_URL)
    })

    it('works as expected without localeInformation', () => {
      server.use(
        http.get(
          `${VALID_URL}/languages`,
          () => new HttpResponse(null, { status: 500 })
        )
      )

      client = new Client(VALID_URL)
      expect(client.parseLocales('de', 'en-US')).toEqual(
        expect.objectContaining({ source: 'de', target: 'en' })
      )
    })

    it('throws for unsupported locales', async () => {
      await new Promise((r) => setTimeout(r, 100))
      expect(() => client.parseLocales('de', 'en-US')).toThrow('Source locale')
      expect(() => client.parseLocales('en-US', 'invalid')).toThrow(
        'Target locale'
      )
    })

    it('does not throw for supported locales', async () => {
      await new Promise((r) => setTimeout(r, 100))
      expect(() => client.parseLocales('en', 'de')).not.toThrow()
    })
  })
})
