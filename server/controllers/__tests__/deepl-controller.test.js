'use strict'

const { simpleContentType } = require('../../../__mocks__/contentTypes')
const createContext = require('../../../__mocks__/createContext')

const setup = function (params) {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(params),
    writable: true,
  })
}

jest.mock('../../utils/translatable-fields')
jest.mock('../../utils/translate-relations')

describe('deepl controller', () => {
  const translateServiceMock = jest.fn()
  beforeEach(() => {
    jest.mock('../../services/translate', () => {
      return () => ({
        translate: translateServiceMock,
      })
    })
    setup({
      contentTypes: {
        'api::first.first': simpleContentType,
      },
    })
  })

  afterEach(() => {
    Object.defineProperty(global, 'strapi', {})
    translateServiceMock.mockReset()
  })

  it('should call translate service', async () => {
    // given
    const id = 1
    const sourceLocale = 'en'
    const targetLocale = 'de'
    const contentTypeUid = 'api::first.first'
    const ctx = createContext({
      id,
      sourceLocale,
      targetLocale,
      contentTypeUid,
    })

    // when
    await strapi.plugin('deepl').controller('translate').translate(ctx)

    // then
    expect(ctx.badRequest).not.toHaveBeenCalled()
    expect(translateServiceMock).toHaveBeenCalled()
  })

  it('bad request if source locale is missing', async () => {
    // given
    const id = 1
    const sourceLocale = 'en'
    const contentTypeUid = 'api::first.first'
    const ctx = createContext({
      id,
      sourceLocale,
      contentTypeUid,
    })

    // when
    await strapi.plugin('deepl').controller('translate').translate(ctx)

    // then
    expect(ctx.badRequest).toHaveBeenCalled()
    expect(translateServiceMock).not.toHaveBeenCalled()
  })

  it('bad request if target locale is missing', async () => {
    // given
    const id = 1
    const targetLocale = 'de'
    const contentTypeUid = 'api::first.first'
    const ctx = createContext({
      id,
      targetLocale,
      contentTypeUid,
    })

    // when
    await strapi.plugin('deepl').controller('translate').translate(ctx)

    // then
    expect(ctx.badRequest).toHaveBeenCalled()
    expect(translateServiceMock).not.toHaveBeenCalled()
  })

  it('not found if content type does not exist', async () => {
    // given
    const id = 1
    const sourceLocale = 'en'
    const targetLocale = 'de'
    const contentTypeUid = 'api::unknown.unknown'
    const ctx = createContext({
      id,
      sourceLocale,
      targetLocale,
      contentTypeUid,
    })

    // when
    await strapi.plugin('deepl').controller('translate').translate(ctx)

    // then
    expect(ctx.notFound).toHaveBeenCalled()
    expect(translateServiceMock).not.toHaveBeenCalled()
  })

  it('id has to be a number or string', async () => {
    // given
    const id = null
    const sourceLocale = 'en'
    const targetLocale = 'de'
    const contentTypeUid = 'api::unknown.unknown'
    const ctx = createContext({
      id,
      sourceLocale,
      targetLocale,
      contentTypeUid,
    })

    // when
    await strapi.plugin('deepl').controller('translate').translate(ctx)

    // then
    expect(ctx.badRequest).toHaveBeenCalled()
    expect(translateServiceMock).not.toHaveBeenCalled()
  })
})
