'use strict'

module.exports = [
  {
    method: 'GET',
    path: '/usage',
    handler: 'deepl.usage',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: ['plugin::deepl.usage'] },
        },
      ],
    },
  },
]
