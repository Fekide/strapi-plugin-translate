import { Core } from '@strapi/strapi'
import service from '../untranslated'

const uid = 'api::post.post'

describe('untranslated service', () => {
  describe('getUntranslatedEntity', () => {
    it('throws Error if ContentType is not found', () => {
      const strapi = {
        contentTypes: {},
      } as any as Core.Strapi

      Object.defineProperty(global, 'strapi', { value: strapi, writable: true })

      const untranslatedService = service({ strapi })

      return expect(async () =>
        untranslatedService.getUntranslatedEntity(
          { uid, sourceLocale: 'en', targetLocale: 'de' },
          { populate: {} }
        )
      ).rejects.toThrow('Content Type does not exist')
    })

    it('throws Error if Content Type is not localized', () => {
      const strapi = {
        contentTypes: {
          [uid]: { pluginOptions: { i18n: { localized: false } } },
        },
      } as any as Core.Strapi

      Object.defineProperty(global, 'strapi', { value: strapi, writable: true })

      const untranslatedService = service({ strapi })

      return expect(async () =>
        untranslatedService.getUntranslatedEntity(
          { uid, sourceLocale: 'en', targetLocale: 'de' },
          { populate: {} }
        )
      ).rejects.toThrow('Content Type not localized')
    })
  })

  describe('getUntranslatedEntityIDs', () => {
    it('throws Error if Content Type is not found', () => {
      const strapi = {
        contentTypes: {},
      } as any as Core.Strapi

      Object.defineProperty(global, 'strapi', { value: strapi, writable: true })

      const untranslatedService = service({ strapi })

      return expect(async () =>
        untranslatedService.getUntranslatedEntity(
          { uid, sourceLocale: 'en', targetLocale: 'de' },
          { populate: {} }
        )
      ).rejects.toThrow('Content Type does not exist')
    })

    it('throws Error if Content Type is not localized', () => {
      const strapi = {
        contentTypes: {
          [uid]: { pluginOptions: { i18n: { localized: false } } },
        },
      } as any as Core.Strapi

      Object.defineProperty(global, 'strapi', { value: strapi, writable: true })

      const untranslatedService = service({ strapi })

      return expect(async () =>
        untranslatedService.getUntranslatedEntity(
          { uid, sourceLocale: 'en', targetLocale: 'de' },
          { populate: {} }
        )
      ).rejects.toThrow('Content Type not localized')
    })
  })
})
