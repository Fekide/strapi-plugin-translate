'use strict'

module.exports = {
  default: ({ env }) => ({
    apiKey: env['DEEPL_API_KEY'] ?? null,
    freeApi: env['DEEPL_API_FREE']
      ? env['DEEPL_API_FREE'].toLowerCase() == 'true'
      : true,
    translatedFieldTypes: [
      'string',
      'text',
      'richtext',
      'component',
      'dynamiczone',
    ],
    glossaryId: null,
  }),
  validator({ apiKey, translatedFieldTypes, freeApi, glossaryId }) {
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
      throw new Error('freeApi has to bee a boolean')
    }
    if (glossaryId !== null && typeof freeApi !== 'string') {
      throw new Error('glossaryId should be a string if it is defined')
    }
  },
}
