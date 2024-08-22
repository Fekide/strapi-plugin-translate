import { UntranslatedService } from '@shared/services/untranslated';
import { Locale } from '@shared/types/locale';
import { Core } from '@strapi/strapi'
import { geti18nService } from '../utils/get-service';

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
      throw new Error("getUntranslatedEntity: to be migrated")
      const metadata = strapi.db.metadata.get(uid)
      if (!metadata) {
        throw new Error('Content Type does not exist')
      }
      const tableName = metadata.tableName
      const joinTable = metadata.attributes?.localizations?.["joinTable"]
      if (!joinTable) {
        throw new Error('Content Type not localized')
      }
      const notTranslated = await strapi.db
        .getConnection(tableName)
        .select(`${tableName}.${joinTable.joinColumn.referencedColumn}`)
        // Join the other localizations (null allowed)
        .leftJoin(
          joinTable.name,
          `${tableName}.${joinTable.joinColumn.referencedColumn}`,
          `${joinTable.name}.${joinTable.joinColumn.name}`
        )
        .leftJoin(
          `${tableName} as c2`,
          `${joinTable.name}.${joinTable.inverseJoinColumn.name}`,
          `c2.${joinTable.inverseJoinColumn.referencedColumn}`
        )
        // The other localizations should not include the target locale
        .whereNotIn(
          `${tableName}.${joinTable.joinColumn.referencedColumn}`,
          strapi.db
            .getConnection(tableName)
            .select(`${tableName}.${joinTable.joinColumn.referencedColumn}`)
            // Join the other localizations (null not allowed)
            .join(
              joinTable.name,
              `${tableName}.${joinTable.joinColumn.referencedColumn}`,
              `${joinTable.name}.${joinTable.joinColumn.name}`
            )
            .join(
              `${tableName} as c2`,
              `${joinTable.name}.${joinTable.inverseJoinColumn.name}`,
              `c2.${joinTable.inverseJoinColumn.referencedColumn}`
            )
            // other localization should be the target
            .where('c2.locale', targetLocale)
            // start localization should be the source
            .andWhere(`${tableName}.locale`, sourceLocale)
        )
        // Only from the source locale
        .andWhere(`${tableName}.locale`, sourceLocale)
        // Only the first needed
        .limit(1)
      if (!notTranslated || notTranslated.length == 0) {
        return null
      }
      // Fetch the whole data
      return strapi.db.query(uid).findOne({
        where: { id: notTranslated[0].id },
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
      const targetEntities = await strapi.documents(uid).findMany({
        locale: targetLocale,
        fields: ['documentId'],
      })
      const targetIDs = targetEntities.map((entity) => entity.documentId)
      const locales = await geti18nService("locales").find() as Locale[]
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
