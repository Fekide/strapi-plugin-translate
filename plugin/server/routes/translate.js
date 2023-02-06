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
          config: { actions: ['plugin::translate.translate'] },
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
          config: { actions: ['plugin::translate.batch-translate'] },
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/batch-translate/content-types',
    handler: 'translate.batchTranslateContentTypes',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: ['plugin::translate.batch-translate'] },
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/batch-translate/status/:id',
    handler: 'translate.batchTranslateJobStatus',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: ['plugin::translate.batch-translate'] },
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
          config: { actions: ['plugin::translate.batch-translate'] },
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
          config: { actions: ['plugin::translate.batch-translate'] },
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
          config: { actions: ['plugin::translate.batch-translate'] },
        },
      ],
    },
  },
  {
    method: 'POST',
    path: '/usage/estimate',
    handler: 'translate.usageEstimate',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'POST',
    path: '/usage/estimateCollection',
    handler: 'translate.usageEstimateCollection',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
]
