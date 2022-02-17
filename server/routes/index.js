module.exports = [
  {
    method: 'POST',
    path: '/translate',
    handler: 'translateController.index',
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
];
