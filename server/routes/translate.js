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
          config: { actions: ['plugin::deepl.batch-translate'] },
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/batch-translate/pause/:id',
    handler: 'translate.batchTranslatePauseJob',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: ['plugin::deepl.batch-translate'] },
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/batch-translate/resume/:id',
    handler: 'translate.batchTranslateResumeJob',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: ['plugin::deepl.batch-translate'] },
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/batch-translate/cancel/:id',
    handler: 'translate.batchTranslateCancelJob',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: ['plugin::deepl.batch-translate'] },
        },
      ],
    },
  },
]
