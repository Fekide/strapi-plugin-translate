const { get, set, isEmpty, defaults } = require('lodash')

const dummyProvider = require('../server/utils/dummy-provider')
const configModule = require('../server/config')

module.exports = ({
  config = {},
  toStore = false,
  database = {},
  // components should not be in the actual format but the formatted version
  components = {},
  // contentTypes should not be in the actual format but the formatted version
  contentTypes = {},
  plugins = {},
  db = {},
  provider = dummyProvider,
}) => {
  const dbConfig = toStore
    ? {
        plugin: {
          translate: {
            config: { ...config },
          },
        },
      }
    : {}

  defaults(config, configModule.default())
  configModule.validator(config)

  let mock = {
    db: {
      query: (uid) => {
        const [handler, collection] = uid.split('::')
        const values = get(mock.db, `${handler}.${collection}.records`, [])
        return {
          findOne: async ({ where }) =>
            new Promise((resolve) =>
              resolve(values.find((obj) => obj.id == where.id.$eq))
            ),
          findMany: async () => new Promise((resolve) => resolve(values)),
          findWithCount: async () =>
            new Promise((resolve) => resolve([values, values.length])),
          count: async () => new Promise((resolve) => resolve(values.length)),
          create: async (value) => new Promise((resolve) => resolve(value)),
          update: async (value) => new Promise((resolve) => resolve(value)),
          delete: async (value) => new Promise((resolve) => resolve(value)),
          ...db.query?.(uid, { strapi, values }),
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
      ...plugins,
      translate: {
        service: function (name) {
          return this.services[name]({ strapi: mock.getRef() })
        },
        controller: function (name) {
          return this.controllers[name]({ strapi: mock.getRef() })
        },
        package: require('../package.json'),
        services: {
          provider: require('../server/services/provider'),
          translate: require('../server/services/translate'),
          format: require('../server/services/format'),
          chunks: require('../server/services/chunks'),
          'batch-translate-job': () => {
            const uid = 'plugin::translate.batch-translate-job'
            return {
              findOne: mock.db.query(uid).findOne,
              find: mock.db.query(uid).findMany,
              count: mock.db.query(uid).count,
              create: mock.db.query(uid).create,
              update: mock.db.query(uid).update,
              delete: mock.db.query(uid).delete,
            }
          },
        },
        controllers: {
          provider: require('../server/controllers/provider'),
          translate: require('../server/controllers/translate'),
        },
        contentTypes: {
          'batch-translate-job': require('../server/content-types/batch-translate-job/schema.json'),
        },
        provider: provider.init(),
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
        translate: {
          ...config,
          provider: provider?.provider,
        },
      },
    },
    entityService: {
      findOne: (uid, id, params) =>
        mock.db.query(uid).findOne({ where: { id: { $eq: id } }, ...params }),
      findMany: (uid, params) =>
        mock.db.query(uid).findMany({ ...params, where: params.filters }),
      create: (uid, params) => mock.db.query(uid).create(params),
      update: (uid, id, params) => mock.db.query(uid).update(id, params),
      delete: (uid, id, params) => mock.db.query(uid).delete(id, params),
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

  if (!isEmpty(database)) {
    Object.keys(database).forEach((uid) => {
      const [handler, collection] = uid.split('::')
      set(mock.db, `${handler}.${collection}.records`, database[uid])
    })
  }

  return mock
}
