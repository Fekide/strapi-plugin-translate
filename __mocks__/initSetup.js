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
        const [handler, rest] = uid.split('::')
        const [collection] = rest.split('.')
        const values = get(mock.db, `${handler}.${collection}.records`, [])
        return {
          findOne: async () => new Promise((resolve) => resolve(values[0])),
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
        package: require('../package.json'),
        services: {
          deeplService: require('../server/services/deepl-service'),
        },
        controllers: {
          deeplController: require('../server/controllers/deepl-controller'),
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
          glossaryId: null,
          ...(toStore ? {} : config),
        },
      },
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
