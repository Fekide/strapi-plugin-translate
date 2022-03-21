'use strict'

module.exports = [
  {
    method: 'POST',
    path: '/translate',
    handler: 'translate.translate',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: ['plugin::deepl.translate'] },
        },
      ],
    },
  },
]
