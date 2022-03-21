const { get, set, isEmpty } = require('lodash')

module.exports = ({
  config = {},
  toStore = false,
  database = {},
  // components should not be in the actual format but the formatted version
  components = {},
  // contentTypes should not be in the actual format but the formatted version
  contentTypes = {},
}) => {
  const dbConfig = toStore
    ? {
        plugin: {
          deepl: {
            config: { ...config },
          },
        },
      }
    : {}

  let mock = {
    db: {
      query: (uid) => {
        const [handler, collection] = uid.split('::')
        const values = get(mock.db, `${handler}.${collection}.records`, [])
        return {
          findOne: async (id) =>
            new Promise((resolve) =>
              resolve(values.find((obj) => obj.id == id))
            ),
          findMany: async () => new Promise((resolve) => resolve(values)),
          findWithCount: async () =>
            new Promise((resolve) => resolve([values, values.length])),
          count: async () => new Promise((resolve) => resolve(values.length)),
          create: async (value) => new Promise((resolve) => resolve(value)),
          update: async (value) => new Promise((resolve) => resolve(value)),
          delete: async (value) => new Promise((resolve) => resolve(value)),
        }
      },
      ...dbConfig,
    },
    components,
    contentTypes,
    getRef: function () {
      return this
    },
    plugin: function (name) {
      return this.plugins[name]
    },
    store: async function (storeProps) {
      const { type, name } = storeProps // { type: 'plugin', name: 'comments' }

      const mockedStore = {
        get: async function (props) {
          // { key: 'config' }
          const { key } = props
          return new Promise((resolve) =>
            resolve(get(mock.db, `${type}.${name}.${key}`, undefined))
          )
        },
        set: async function (props) {
          // { key: 'config', value: {...} }
          const { key, value } = props
          set(mock.db, `${type}.${name}.${key}`, value)
          return this.get(key)
        },
        delete: async function (props) {
          // { key: 'config' }
          const { key } = props
          set(mock.db, `${type}.${name}.${key}`, undefined)
          return new Promise((resolve) => resolve(true))
        },
      }

      return new Promise((resolve) => resolve(mockedStore))
    },
    plugins: {
      deepl: {
        service: function (name) {
          return this.services[name]({ strapi: mock.getRef() })
        },
        controller: function (name) {
          return this.controllers[name]({ strapi: mock.getRef() })
        },
        package: require('../package.json'),
        services: {
          deepl: require('../server/services/deepl'),
          translate: require('../server/services/translate'),
        },
        controllers: {
          deepl: require('../server/controllers/deepl'),
          translate: require('../server/controllers/translate'),
        },
        contentTypes: {},
      },
      'content-type-builder': {
        service: function (name) {
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
    config: {
      get: function (prop = '') {
        return get(this.plugins, prop.replace('plugin.', ''))
      },
      set: function (prop = '', value) {
        return set(this.plugins, prop.replace('plugin.', ''), value)
      },
      plugins: {
        deepl: {
          apiKey: 'mocked_key',
          freeApi: true,
          translatedFieldTypes: [
            'string',
            'text',
            'richtext',
            'component',
            'dynamiczone',
          ],
          translateRelations: true,
          glossaryId: null,
          ...(toStore ? {} : config),
        },
      },
    },
    service(uid) {
      return {
        findOne: this.db.query(uid).findOne,
        find: this.db.query(uid).findMany,
        count: this.db.query(uid).count,
        create: this.db.query(uid).create,
        update: this.db.query(uid).update,
        delete: this.db.query(uid).delete,
      }
    },
    log: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  }

  if (!isEmpty(database)) {
    Object.keys(database).forEach((uid) => {
      const [handler, collection] = uid.split('::')
      set(mock.db, `${handler}.${collection}.records`, database[uid])
    })
  }

  return mock
}
