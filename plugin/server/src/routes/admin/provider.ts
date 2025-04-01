export default [
  {
    method: 'GET',
    path: '/usage',
    handler: 'provider.usage',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: ['plugin::translate.usage'] },
        },
      ],
    },
  },
]
