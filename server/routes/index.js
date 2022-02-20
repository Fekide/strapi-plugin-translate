module.exports = [
  {
    method: 'POST',
    path: '/translate',
    handler: 'deeplController.translate',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        // {
        //   name: 'plugin::content-manager.hasPermissions',
        //   config: { actions: ['plugin::deepl.locale.translate'] },
        // },
      ],
    },
  },
  {
    method: 'GET',
    path: '/usage',
    handler: 'deeplController.usage',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        // {
        //   name: 'plugin::content-manager.hasPermissions',
        //   config: { actions: ['plugin::deepl.locale.translate'] },
        // },
      ],
    },
  },
]
