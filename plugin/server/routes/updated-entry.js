'use strict'

/**
 *  router.
 */

const { factories } = require('@strapi/strapi')

module.exports = factories.createCoreRouter('plugin::translate.updated-entry', {
  config: {
    find: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: ['plugin::translate.translate'] },
        },
      ],
    },
    delete: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: ['plugin::translate.translate'] },
        },
      ],
    },
  },
  only: ['find', 'delete'],
})
