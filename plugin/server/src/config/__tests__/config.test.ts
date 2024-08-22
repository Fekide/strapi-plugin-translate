import { describe, expect, it, afterEach } from '@jest/globals'
import { TranslateConfig, TranslatedFieldType } from '..'

import setup from '../../__mocks__/initSetup'

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('config', () => {
  it('default provider is dummy', () => {
    setup({})

    expect(strapi.config.get<TranslateConfig>('plugin::translate').provider).toEqual('dummy')
  })

  it('setting translate relations to false', () => {
    setup({ config: { translateRelations: false } })

    expect(strapi.config.get<TranslateConfig>('plugin::translate').translateRelations).toEqual(
      false
    )
  })

  it('changing translated field types', () => {
    const translatedFieldTypes: Array<TranslatedFieldType> = [
      'string',
      { type: 'text', format: 'plain' },
      { type: 'richtext', format: 'markdown' },
      { type: 'ckeditor', format: 'html' },
    ]
    setup({ config: { translatedFieldTypes } })

    expect(strapi.config.get<TranslateConfig>('plugin::translate').translatedFieldTypes).toEqual(
      translatedFieldTypes
    )
  })

  it('fails with translated field types not array', () => {
    const translatedFieldTypes = 'string' as any

    expect(() => setup({ config: { translatedFieldTypes } })).toThrow(
      'translatedFieldTypes has to be an array'
    )
  })

  it('fails with translateRelations not a boolean', () => {
    const translateRelations = 'false' as any

    expect(() => setup({ config: { translateRelations } })).toThrow(
      'translateRelations has to be a boolean'
    )
  })

  it('fails with providerOptions not object or undefined', () => {
    const providerOptions = 'Test' as any

    expect(() => setup({ config: { providerOptions } })).toThrow(
      'providerOptions has to be an object if it is defined'
    )
  })

  it('fails with translated fields not being in correct schema', () => {
    const translatedFieldTypes = [{ field: 'richtext' }] as any

    expect(() => setup({ config: { translatedFieldTypes } })).toThrow(
      'incorrect schema for translated fields'
    )
  })

  it('fails with translated fields of unhandled field type', () => {
    const translatedFieldTypes = [{ type: 'richtext', format: 'xml' }] as any

    expect(() => setup({ config: { translatedFieldTypes } })).toThrow(
      'unhandled format xml for translated field richtext'
    )
  })
})
