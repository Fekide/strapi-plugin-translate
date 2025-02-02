import { UntranslatedService } from '@shared/services/untranslated'
import { Locale } from '@shared/types/locale'
import { Core } from '@strapi/strapi'
import { geti18nService } from '../utils/get-service'
import { isContentTypeUID, isLocalizedContentType } from '../utils/content-type'

export default ({ strapi }: { strapi: Core.Strapi }): UntranslatedService => {
  return {
    /**
     * Get an untranslated source entity based not the parameters
     *
     * @param param0 Parameters for the content type
     * @param param1 Parameters for the query result
     * @returns One entity of the content type 'uid' that has not yet been translated from 'sourceLocale' to 'targetLocale'
     */
    async getUntranslatedEntity(
      { uid, targetLocale, sourceLocale },
      { populate }
    ) {
      const allUntranslatedDocuments = await this.getUntranslatedDocumentIDs({
        uid,
        targetLocale,
        sourceLocale,
      })
      if (allUntranslatedDocuments.length === 0) {
        return null
      }
      const documentId = allUntranslatedDocuments[0]
      return strapi.documents(uid).findOne({
        documentId,
        locale: sourceLocale,
        populate,
      })
    },

    /**
     * Get all ids of untranslated source entities based not the parameters
     *
     * @param param0 Parameters for the content type
     * @returns DocumentIDs of all entities of the content type 'uid' that have not yet been translated from 'sourceLocale' to 'targetLocale'
     */
    async getUntranslatedDocumentIDs({ uid, targetLocale, sourceLocale }) {
      if (!isContentTypeUID(uid)) {
        throw new Error('Content Type does not exist')
      }
      if (!isLocalizedContentType(uid)) {
        throw new Error('Content Type not localized')
      }
      const sourceEntities = await strapi.documents(uid).findMany({
        locale: sourceLocale,
        fields: ['documentId'],
      })
      const targetEntities = await strapi.documents(uid).findMany({
        locale: targetLocale,
        fields: ['documentId'],
      })
      const sourceIDs = sourceEntities.map((entity) => entity.documentId)
      const targetIDs = targetEntities.map((entity) => entity.documentId)
      return sourceIDs.filter((id) => !targetIDs.includes(id))
    },

    /**
     * Calculate if a locale is fully translated,
     * i.e. there are no other entities in any other locale
     * that do not have a localization in this locale
     *
     * @param uid Content-Type-UID
     * @param targetLocale the target locale
     * @returns if the target locale is fully translated
     */
    async isFullyTranslated(uid, targetLocale) {
      if (!isContentTypeUID(uid)) {
        throw new Error('Content Type does not exist')
      }
      if (!isLocalizedContentType(uid)) {
        throw new Error('Content Type not localized')
      }
      const targetEntities = await strapi.documents(uid).findMany({
        locale: targetLocale,
        fields: ['documentId'],
      })
      const targetIDs = targetEntities.map((entity) => entity.documentId)
      const locales = (await geti18nService('locales').find()) as Locale[]
      const localeCodes = locales.map((locale) => locale.code)

      for (const locale of localeCodes) {
        if (locale === targetLocale) {
          continue
        }
        const otherEntities = await strapi.documents(uid).findMany({
          locale,
          fields: ['documentId'],
        })
        const otherIDs = otherEntities.map((entity) => entity.documentId)
        if (otherIDs.some((documentId) => !targetIDs.includes(documentId))) {
          return false
        }
      }
      return true
    },
  }
}
