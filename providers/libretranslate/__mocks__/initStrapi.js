'use strict'

module.exports = ({ plugins = {} }) => {
  let mock = {
    plugin(name) {
      return this.plugins[name]
    },
    getRef() {
      return this
    },
    plugins: {
      ...plugins,
      translate: {
        service(name) {
          return this.services[name]({ strapi: mock.getRef() })
        },
        controller(name) {
          return this.controllers[name]({ strapi: mock.getRef() })
        },
        services: {
          chunks: require('strapi-plugin-translate/server/services/chunks'),
          format: require('strapi-plugin-translate/server/services/format'),
        },
      },
      'content-type-builder': {
        service(name) {
          return this.services[name]
        },
        services: {
          components: {
            // To make it easier here, the componentInfo is actually already in the correct format
            formatComponent(componentInfo) {
              return componentInfo
            },
          },
          'content-types': {
            formatContentType(contentTypeInfo) {
              return contentTypeInfo
            },
          },
        },
      },
    },
    service(uid) {
      const [handler, collection] = uid.split('::')
      if (handler === 'plugin') {
        const [plugin, service] = collection.split('.')
        return this.plugins[plugin].services[service]({ strapi: mock.getRef() })
      }
      return {
        findOne: (id, params) => this.entityService.findOne(uid, id, params),
        find: (params) => this.entityService.findMany(uid, params),
        create: (params) => this.entityService.create(uid, params),
        update: (id, params) => this.entityService.update(uid, id, params),
        delete: (id, params) => this.entityService.delete(uid, id, params),
      }
    },
    log: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  }

  return mock
}
