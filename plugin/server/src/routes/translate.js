// Migrated route for Strapi 5
const translateRoutes = [
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
  // ...otras rutas existentes...
];

module.exports = translateRoutes;
