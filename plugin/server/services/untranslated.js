'use strict'

module.exports = ({ strapi }) => {
  return {
    /**
     * Get an untranslated source entity based not the parameters
     *
     * @param {object} param0 Parameters for the content type
     * @param {object} param1 Parameters for the query result
     * @returns One entity of the content type 'uid' that has not yet been translated from 'sourceLocale' to 'targetLocale'
     */
    async getUntranslatedEntity(
      { uid, targetLocale, sourceLocale },
      { populate }
    ) {
      const metadata = strapi.db.metadata.get(uid)
      if (!metadata) {
        throw new Error('Content Type does not exist')
      }
      const tableName = metadata.tableName
      const joinTable = metadata.attributes?.localizations?.joinTable
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
     * @param {object} param0 Parameters for the content type
     * @param {object} param1 Parameters for the query result
     * @returns IDs of all entities of the content type 'uid' that have not yet been translated from 'sourceLocale' to 'targetLocale'
     */
    async getUntranslatedEntityIDs({ uid, targetLocale, sourceLocale }) {
      const metadata = strapi.db.metadata.get(uid)
      if (!metadata) {
        throw new Error('Content Type does not exist')
      }
      const tableName = metadata.tableName
      const joinTable = metadata.attributes?.localizations?.joinTable
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
      if (!notTranslated || notTranslated.length == 0) {
        return []
      }
      // Return the IDs
      return notTranslated.map(({ id }) => id)
    },

    /**
     * Calculate if a locale is fully translated,
     * i.e. there are no other entities in any other locale
     * that do not have a localization in this locale
     *
     * @param {string} uid Content-Type-UID
     * @param {string} targetLocale the target locale
     * @returns if the target locale is fully translated
     */
    async isFullyTranslated(uid, targetLocale) {
      const metadata = strapi.db.metadata.get(uid)
      if (!metadata) {
        throw new Error('Content Type does not exist')
      }
      const tableName = metadata.tableName
      const joinTable = metadata.attributes?.localizations?.joinTable
      if (!joinTable) {
        throw new Error('Content Type not localized')
      }
      const notTranslated = await strapi.db
        .getConnection(tableName)
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
        )
        // First entity cannot be of the target locale
        .andWhereNot(`${tableName}.locale`, targetLocale)
        // One is enough to see if there is at least one missing or not
        .limit(1)
      return notTranslated.length === 0
    },
  }
}
