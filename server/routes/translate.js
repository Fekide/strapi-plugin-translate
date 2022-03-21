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
  {
    method: 'POST',
    path: '/batch-translate',
    handler: 'translate.batchTranslate',
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
