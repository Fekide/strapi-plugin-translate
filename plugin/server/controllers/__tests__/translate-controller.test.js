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

describe('translate controller', () => {
  const mockTranslateService = jest.fn()
  beforeEach(() => {
    jest.mock('../../services/translate', () => {
      return () => ({
        translate: mockTranslateService,
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
    mockTranslateService.mockReset()
  })

  it('should call translate service', async () => {
    // given
    const data = { id: 1, title: 'test' }
    const sourceLocale = 'en'
    const targetLocale = 'de'
    const contentTypeUid = 'api::first.first'
    const ctx = createContext({
      data,
      sourceLocale,
      targetLocale,
      contentTypeUid,
    })

    // when
    await strapi.plugin('translate').controller('translate').translate(ctx)

    // then
    expect(mockTranslateService).toHaveBeenCalled()
  })

  it('bad request if source locale is missing', async () => {
    // given
    const data = { id: 1, title: 'test' }
    const sourceLocale = 'en'
    const contentTypeUid = 'api::first.first'
    const ctx = createContext({
      data,
      sourceLocale,
      contentTypeUid,
    })

    // when
    await strapi.plugin('translate').controller('translate').translate(ctx)

    // then
    expect(ctx.badRequest).toHaveBeenCalled()
    expect(mockTranslateService).not.toHaveBeenCalled()
  })

  it('bad request if target locale is missing', async () => {
    // given
    const data = { id: 1, title: 'test' }
    const targetLocale = 'de'
    const contentTypeUid = 'api::first.first'
    const ctx = createContext({
      data,
      targetLocale,
      contentTypeUid,
    })

    // when
    await strapi.plugin('translate').controller('translate').translate(ctx)

    // then
    expect(ctx.badRequest).toHaveBeenCalled()
    expect(mockTranslateService).not.toHaveBeenCalled()
  })

  it('not found if content type does not exist', async () => {
    // given
    const data = { id: 1, title: 'test' }
    const sourceLocale = 'en'
    const targetLocale = 'de'
    const contentTypeUid = 'api::unknown.unknown'
    const ctx = createContext({
      data,
      sourceLocale,
      targetLocale,
      contentTypeUid,
    })

    // when
    await strapi.plugin('translate').controller('translate').translate(ctx)

    // then
    expect(ctx.notFound).toHaveBeenCalled()
    expect(mockTranslateService).not.toHaveBeenCalled()
  })
})
