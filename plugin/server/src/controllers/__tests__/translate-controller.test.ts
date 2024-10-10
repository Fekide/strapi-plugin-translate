import {
  describe,
  expect,
  it,
  afterEach,
  jest,
  beforeEach,
} from '@jest/globals'
import { TranslateController } from '../translate'

import { simpleContentType } from '../../__mocks__/contentTypes'
import createContext from '../../__mocks__/createContext'
import setup, { SetupProps } from '../../__mocks__/initSetup'

jest.mock('../../utils/translatable-fields')
jest.mock('../../utils/translate-relations')

describe('translate controller', () => {
  const mockTranslateService = jest.fn()
  beforeEach(async () => {
    jest.mock('../../services/translate', () => {
      return () => ({
        translate: mockTranslateService,
      })
    })
    await setup({
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
    const documentId = 'a'
    const sourceLocale = 'en'
    const targetLocale = 'de'
    const contentType = 'api::first.first'
    const ctx = createContext({
      documentId,
      sourceLocale,
      targetLocale,
      contentType,
    })

    // when
    await strapi
      .plugin('translate')
      .controller<TranslateController>('translate')
      .translateEntity(
        ctx,
        jest.fn(() => Promise.resolve())
      )

    // then
    expect(ctx.badRequest).not.toHaveBeenCalled()
    expect(mockTranslateService).toHaveBeenCalled()
  })

  it('bad request if source locale is missing', async () => {
    // given
    const documentId = 'a'
    const sourceLocale = 'en'
    const contentType = 'api::first.first'
    const ctx = createContext({
      documentId,
      sourceLocale,
      contentType,
    })

    // when
    await strapi
      .plugin('translate')
      .controller<TranslateController>('translate')
      .translateEntity(
        ctx,
        jest.fn(() => Promise.resolve())
      )

    // then
    expect(ctx.badRequest).toHaveBeenCalled()
    expect(mockTranslateService).not.toHaveBeenCalled()
  })

  it('bad request if target locale is missing', async () => {
    // given
    const documentId = 'a'
    const targetLocale = 'de'
    const contentType = 'api::first.first'
    const ctx = createContext({
      documentId,
      targetLocale,
      contentType,
    })

    // when
    await strapi
      .plugin('translate')
      .controller<TranslateController>('translate')
      .translateEntity(
        ctx,
        jest.fn(() => Promise.resolve())
      )

    // then
    expect(ctx.badRequest).toHaveBeenCalled()
    expect(mockTranslateService).not.toHaveBeenCalled()
  })

  it('not found if content type does not exist', async () => {
    // given
    const documentId = 'a'
    const sourceLocale = 'en'
    const targetLocale = 'de'
    const contentType = 'api::unknown.unknown'
    const ctx = createContext({
      documentId,
      sourceLocale,
      targetLocale,
      contentType,
    })

    // when
    await strapi
      .plugin('translate')
      .controller<TranslateController>('translate')
      .translateEntity(
        ctx,
        jest.fn(() => Promise.resolve())
      )

    // then
    expect(ctx.notFound).toHaveBeenCalled()
    expect(mockTranslateService).not.toHaveBeenCalled()
  })

  it('id has to be a number or string', async () => {
    // given
    const documentId = null
    const sourceLocale = 'en'
    const targetLocale = 'de'
    const contentType = 'api::unknown.unknown'
    const ctx = createContext({
      documentId,
      sourceLocale,
      targetLocale,
      contentType,
    })

    // when
    await strapi
      .plugin('translate')
      .controller<TranslateController>('translate')
      .translateEntity(
        ctx,
        jest.fn(() => Promise.resolve())
      )

    // then
    expect(ctx.badRequest).toHaveBeenCalled()
    expect(mockTranslateService).not.toHaveBeenCalled()
  })
})
