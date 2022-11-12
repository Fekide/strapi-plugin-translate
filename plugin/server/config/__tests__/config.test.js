'use strict'

const setup = function (params) {
  Object.defineProperty(global, 'strapi', {
    value: require('../../../__mocks__/initSetup')(params),
    writable: true,
  })
}

afterEach(() => {
  Object.defineProperty(global, 'strapi', {})
})

describe('config', () => {
  it('default provider is dummy', () => {
    setup({})

    expect(strapi.config.get('plugin.translate').provider).toEqual('dummy')
  })

  it('setting translate relations to false', () => {
    setup({ config: { translateRelations: false } })

    expect(strapi.config.get('plugin.translate').translateRelations).toEqual(
      false
    )
  })

  it('changing translated field types', () => {
    const translatedFieldTypes = [
      'string',
      { type: 'text', format: 'plain' },
      { type: 'richtext', format: 'markdown' },
      { type: 'ckeditor', format: 'html' },
    ]
    setup({ config: { translatedFieldTypes } })

    expect(strapi.config.get('plugin.translate').translatedFieldTypes).toEqual(
      translatedFieldTypes
    )
  })

  it('fails with translated field types not array', () => {
    const translatedFieldTypes = 'string'

    expect(() => setup({ config: { translatedFieldTypes } })).toThrow(
      'translatedFieldTypes has to be an array'
    )
  })

  it('fails with translateRelations not a boolean', () => {
    const translateRelations = 'false'

    expect(() => setup({ config: { translateRelations } })).toThrow(
      'translateRelations has to be a boolean'
    )
  })

  it('fails with providerOptions not object or undefined', () => {
    const providerOptions = 'Test'

    expect(() => setup({ config: { providerOptions } })).toThrow(
      'providerOptions has to be an object if it is defined'
    )
  })

  it('fails with translated fields not being in correct schema', () => {
    const translatedFieldTypes = [{ field: 'richtext' }]

    expect(() => setup({ config: { translatedFieldTypes } })).toThrow(
      'incorrect schema for translated fields'
    )
  })

  it('fails with translated fields of unhandled field type', () => {
    const translatedFieldTypes = [{ type: 'richtext', format: 'xml' }]

    expect(() => setup({ config: { translatedFieldTypes } })).toThrow(
      'unhandled format xml for translated field richtext'
    )
  })
})
