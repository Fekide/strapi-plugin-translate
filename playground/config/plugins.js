module.exports = ({ env }) => ({
  // ...
  translate: {
    resolve: "../plugin",
    enabled: true,
    config: {
      provider: 'deepl',
      providerOptions: {},
    },
  },
  // ...
})
