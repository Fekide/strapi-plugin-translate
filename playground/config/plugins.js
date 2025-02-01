module.exports = ({ env }) => ({
  // ...
  translate: {
    resolve: '../plugin',
    enabled: true,
    config: {
      provider: env('TRANSLATE_PROVIDER', 'deepl'),
      providerOptions: {},
      translatedFieldTypes: [
        'string',
        { type: 'blocks', format: 'jsonb' },
        { type: 'text', format: 'plain' },
        { type: 'richtext', format: 'markdown' },
        'component',
        'dynamiczone',
      ],
      regenerateUids: true,
    },
  },
  // ...
})
