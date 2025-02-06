'use strict'

module.exports = {
  default() {
    return {
      provider: 'dummy',
      providerOptions: {},
      translatedFieldTypes: [
        { type: 'string', format: 'plain' },
        { type: 'text', format: 'plain' },
        { type: 'blocks', format: 'jsonb' },
        { type: 'richtext', format: 'markdown' },
        'component',
        'dynamiczone',
      ],
      translateRelations: true,
      regenerateUids: false,
      ignoreUpdatedContentTypes: [],
    }
  },
  validator({
    provider,
    providerOptions,
    translatedFieldTypes,
    translateRelations,
    regenerateUids,
    ignoreUpdatedContentTypes,
  }) {
    if (provider === 'dummy' && process.env.NODE_ENV !== 'test') {
      console.warn(
        'provider is set to dummy by default. This only copies all values'
      )
    }
    if (!Array.isArray(translatedFieldTypes)) {
      throw new Error('translatedFieldTypes has to be an array')
    }
    for (const field of translatedFieldTypes) {
      if (typeof field === 'string') {
        continue
      } else if (typeof field === 'object') {
        if (
          typeof field.type !== 'string' ||
          !['undefined', 'string'].includes(typeof field.format)
        ) {
          throw new Error('incorrect schema for translated fields')
        }
        if (
          field.format &&
          !['plain', 'markdown', 'html', 'jsonb'].includes(field.format)
        ) {
          throw new Error(
            `unhandled format ${field.format} for translated field ${field.type}`
          )
        }
      }
    }
    if (typeof translateRelations !== 'boolean') {
      throw new Error('translateRelations has to be a boolean')
    }
    if (providerOptions && typeof providerOptions !== 'object') {
      throw new Error('providerOptions has to be an object if it is defined')
    }
    if (typeof regenerateUids !== 'boolean') {
      throw new Error('regenerateUids has to be a boolean')
    }
    if (!Array.isArray(ignoreUpdatedContentTypes)) {
      throw new Error('ignoreUpdatedContentTypes has to be an Array')
    }
  },
}
