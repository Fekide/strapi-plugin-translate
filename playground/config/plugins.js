module.exports = ({ env }) => ({
  // ...
  translate: {
    resolve: '../plugin',
    enabled: true,
    config: {
      provider: env('TRANSLATE_PROVIDER', 'deepl'),
      providerOptions: {},
    },
  },
  // ...
})
