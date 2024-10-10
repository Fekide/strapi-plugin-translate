import { Core, UID } from '@strapi/strapi'
import { get, set, isEmpty, defaults } from 'lodash'
import { jest } from '@jest/globals'

import dummyProvider from '../utils/dummy-provider'
import configModule, { TranslateConfig } from '../config'
import { TranslateProvider } from '../../../shared/types/provider'
import providerController from '../controllers/provider'
import translateController from '../controllers/translate'
import batchTranslateJob from '../content-types/batch-translate-job'

function draftAndPublishEnabled(uid: UID.ContentType) {
  return strapi.contentTypes[uid].options?.draftAndPublish === true
}

export interface SetupProps {
  config?: Partial<TranslateConfig>
  toStore?: boolean
  database?: Record<string, any>
  components?: Record<string, any>
  contentTypes?: Record<string, any>
  plugins?: Record<string, any>
  // db?:  Partial<Core.Strapi['db']>
  provider?: TranslateProvider
}

const initSetup = async ({
  config = {},
  toStore = false,
  database = {},
  // components should not be in the actual format but the formatted version
  components = {},
  // contentTypes should not be in the actual format but the formatted version
  contentTypes = {},
  plugins = {},
  // db = {},
  provider = dummyProvider,
}: SetupProps): Promise<Core.Strapi> => {
  // const dbConfig = toStore
  //   ? {
  //       plugin: {
  //         translate: {
  //           config: { ...config },
  //         },
  //       },
  //     }
  //   : {}

  let validatedConfig = defaults(config, configModule.default())
  configModule.validator(validatedConfig)
  let mock: Partial<Core.Strapi>

  function store(storeProps) {
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
      },
      delete: async function (props) {
        // { key: 'config' }
        const { key } = props
        set(mock.db, `${type}.${name}.${key}`, undefined)
      },
    }

    return mockedStore
  }
  store.set = function (props) {
    return store(props).set(props)
  }
  store.get = function (props) {
    return store(props).get(props)
  }
  store.delete = function (props) {
    return store(props).delete(props)
  }

  const documents: Core.Strapi['documents'] = function documents(
    uid: UID.ContentType
  ) {
    return {
      findOne: (params) =>
        mock.db
          .query(uid)
          .findOne({
            where: {
              documentId: { $eq: params.documentId },
              locale: { $eq: params.locale },
            },
            ...params,
          }),
      findFirst: (params) => mock.db.query(uid).findMany(params)[0],
      findMany: (params) =>
        mock.db.query(uid).findMany({ ...params, where: params.filters }),
      create: (params) => mock.db.query(uid).create(params),
      update: (params) => mock.db.query(uid).update(params),
      delete: (params) => mock.db.query(uid).delete(params),
      clone: (params) => mock.db.query(uid).delete(params),
      count: (params) => mock.db.query(uid).delete(params),
      publish: draftAndPublishEnabled(uid)
        ? (params) => mock.db.query(uid).update(params)
        : undefined,
      unpublish: draftAndPublishEnabled(uid)
        ? (params) => mock.db.query(uid).update(params)
        : undefined,
      discardDraft: draftAndPublishEnabled(uid)
        ? (params) => mock.db.query(uid).delete(params)
        : undefined,
    }
  } as any

  documents.utils = { transformData: jest.fn(() => Promise.resolve(null)) }
  documents.use = jest.fn(() => mock.documents)

  mock = {
    db: {
      query: (uid) => {
        const [handler, collection] = uid.split('::')
        const values = get(mock.db, `${handler}.${collection}.records`, [])
        return {
          findOne: async ({ where }) =>
            new Promise((resolve) =>
              resolve(
                values.find((obj) => {
                  const docIdCondition = where.documentId
                    ? obj.documentId === where.documentId?.$eq
                    : true
                  const localeCondition = where.locale
                    ? obj.locale === where.locale?.$eq
                    : obj.locale === 'en' // default locale
                  return docIdCondition && localeCondition
                })
              )
            ),
          findMany: async () => new Promise((resolve) => resolve(values)),
          findWithCount: async () =>
            new Promise((resolve) => resolve([values, values.length])),
          count: async () => new Promise((resolve) => resolve(values.length)),
          create: async (value) => new Promise((resolve) => resolve(value)),
          update: async (value) => new Promise((resolve) => resolve(value)),
          delete: async (value) => new Promise((resolve) => resolve(value)),
        } as any
      },
    } as any,
    components,
    contentTypes,
    plugin: function (name) {
      return this.plugins[name]
    },
    store,
    plugins: {
      ...plugins,
      translate: {
        config: function (key, defaultValue) {
          return (
            mock.config.get(`plugin.translate.${String(key)}`) || defaultValue
          )
        },
        service(name) {
          return this.services[name] as any
        },
        controller: function (name) {
          return this.controllers[name] as any
        },
        package: require('../../../package.json'),
        services: {
          provider: {},
          translate: {},
          format: {},
          chunks: {},
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
          provider: providerController(),
          translate: {},
        },
        contentTypes: {
          'batch-translate-job': batchTranslateJob as any,
        },
        provider: provider.init({}),
        bootstrap: async function () {
          this.services.provider = (
            await import('../services/provider')
          ).default({ strapi: mock as Core.Strapi })
          this.services.translate = (
            await import('../services/translate')
          ).default({ strapi: mock as Core.Strapi })
          this.services.format = (await import('../services/format')).default()
          this.services.chunks = (await import('../services/chunks')).default()
          this.controllers.translate = translateController({ strapi: mock as Core.Strapi })
        },
        destroy: jest.fn(() => Promise.resolve()),
        middlewares: {},
        policies: {},
        register: jest.fn(() => Promise.resolve()),
        routes: {},
      },
      'content-type-builder': {
        service: function (name) {
          return this.services[name] as any
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
      } as any,

    },
    config: {
      has: function (prop = '') {
        return !!get(this.plugins, prop.replace('plugin.', ''))
      },
      get: function (prop = '', defaultValue) {
        return (
          get(this.plugins, String(prop).replace('plugin.', '')) || defaultValue
        )
      },
      set: function (prop = '', value) {
        return set(this.plugins, prop.replace('plugin.', ''), value)
      },
      plugins: {
        translate: {
          ...validatedConfig,
          provider: provider?.provider,
        },
      },
    },
    documents,
    entityService: {
      findOne: (uid, id, params) =>
        mock.db.query(uid).findOne({ where: { id: { $eq: id } }, ...params }),
      findMany: (uid, params) =>
        mock.db
          .query(uid)
          .findMany({ ...params, where: params.filters }) as any,
      create: (uid, params) => mock.db.query(uid).create(params),
      update: (uid, id, params) => mock.db.query(uid).update(params),
      delete: (uid, id, params) => mock.db.query(uid).delete(params),
    } as any,
    service(uid) {
      const [handler, collection] = uid.split('::')
      if (handler === 'plugin') {
        const [plugin, service] = collection.split('.')
        return this.plugins[plugin].services[service]
      }
      return {
        findOne: (id, params) =>
          this.documents(uid).findOne({ documentId: id, ...params }),
        find: (params) => this.documents(uid).findMany(params),
        create: (params) => this.documents(uid).create(params),
        update: (id, params) =>
          this.documents(uid).update({ documentId: id, ...params }),
        delete: (id, params) =>
          this.documents(uid).delete({ documentId: id, ...params }),
      }
    },
    log: {
      debug: jest.fn() as any,
      info: jest.fn() as any,
      warn: jest.fn() as any,
      error: jest.fn() as any,
    } as any,
    bootstrap: async () => {
      await mock.plugins.translate.bootstrap({ strapi: mock as Core.Strapi })
      return mock as Core.Strapi
    },
  }

  if (!isEmpty(database)) {
    Object.keys(database).forEach((uid) => {
      const [handler, collection] = uid.split('::')
      set(mock.db, `${handler}.${collection}.records`, database[uid])
    })
  }

  return mock.bootstrap()
}

const setup = async function (params: SetupProps) {
  Object.defineProperty(global, 'strapi', {
    value: await initSetup(params),
    writable: true,
  })
}

export default setup
