'use strict'

module.exports = {
  default() {
    return {
      provider: 'dummy',
      prodiverOptions: {},
      translatedFieldTypes: [
        'string',
        'text',
        'richtext',
        'component',
        'dynamiczone',
      ],
      translateRelations: true,
    }
  },
  validator({
    provider,
    providerOptions,
    translatedFieldTypes,
    translateRelations,
  }) {
    if (provider === 'dummy') {
      console.warn(
        'provider is set to dummy by default. This only copies all values'
      )
    }
    if (!Array.isArray(translatedFieldTypes)) {
      throw new Error('translatedFieldTypes has to be an array')
    }
    if (typeof translateRelations !== 'boolean') {
      throw new Error('translateRelations has to be a boolean')
    }
    if (providerOptions && typeof providerOptions !== 'object') {
      throw new Error('providerOptions has to be an object if it is defined')
    }
  },
}
