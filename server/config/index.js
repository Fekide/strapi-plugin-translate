'use strict'

module.exports = {
  default: ({ env }) => {
    return {
      apiKey: env('DEEPL_API_KEY', null),
      freeApi: env.bool('DEEPL_API_FREE', true),
      translatedFieldTypes: [
        'string',
        'text',
        'richtext',
        'component',
        'dynamiczone',
      ],
      translateRelations: true,
      glossaryId: null,
    }
  },
  validator({
    apiKey,
    translatedFieldTypes,
    freeApi,
    glossaryId,
    translateRelations,
  }) {
    if (!apiKey) {
      throw new Error(
        'apiKey is not set, disable the plugin if you do not have one since the translations will not succeed'
      )
    }
    if (typeof apiKey != 'string') {
      throw new Error('apiKey must be a string')
    }
    if (!Array.isArray(translatedFieldTypes)) {
      throw new Error('translatedFieldTypes has to bee an array')
    }
    if (typeof freeApi !== 'boolean') {
      throw new Error('freeApi has to be a boolean')
    }
    if (typeof translateRelations !== 'boolean') {
      throw new Error('translateRelations has to be a boolean')
    }
    if (glossaryId !== null && typeof glossaryId !== 'string') {
      throw new Error('glossaryId should be a string if it is defined')
    }
  },
}
