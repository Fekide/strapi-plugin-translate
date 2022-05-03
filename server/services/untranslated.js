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
      const {
        collectionName,
        info: { singularName },
      } = strapi.contentTypes[uid]
      const notTranslated = await strapi.db
        .getConnection(collectionName)
        .select(`${collectionName}.id`)
        // Join the other localizations (null allowed)
        .leftJoin(
          `${collectionName}_localizations_links as l`,
          `${collectionName}.id`,
          `l.${singularName}_id`
        )
        .leftJoin(
          `${collectionName} as c2`,
          `l.inv_${singularName}_id`,
          'c2.id'
        )
        // The other localizations should not include the target locale
        .whereNotIn(
          `${collectionName}.id`,
          strapi.db
            .getConnection(collectionName)
            .select(`${collectionName}.id`)
            // Join the other localizations (null not allowed)
            .join(
              `${collectionName}_localizations_links as l`,
              `${collectionName}.id`,
              `l.${singularName}_id`
            )
            .join(
              `${collectionName} as c2`,
              `l.inv_${singularName}_id`,
              'c2.id'
            )
            // other localization should be the target
            .where('c2.locale', targetLocale)
            // start localization should be the source
            .andWhere(`${collectionName}.locale`, sourceLocale)
        )
        // Only from the source locale
        .andWhere(`${collectionName}.locale`, sourceLocale)
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
     * Calculate if a locale is fully translated,
     * i.e. there are no other entities in any other locale
     * that do not have a localization in this locale
     *
     * @param {string} uid Content-Type-UID
     * @param {string} targetLocale the target locale
     * @returns if the target locale is fully translated
     */
    async ifFullyTranslated(uid, targetLocale) {
      const {
        collectionName,
        info: { singularName },
      } = strapi.contentTypes[uid]
      const notTranslated = await strapi.db
        .getConnection(collectionName)
        // Join the other localizations (null allowed)
        .leftJoin(
          `${collectionName}_localizations_links as l`,
          `${collectionName}.id`,
          `l.${singularName}_id`
        )
        .leftJoin(
          `${collectionName} as c2`,
          `l.inv_${singularName}_id`,
          'c2.id'
        )
        // The other localizations should not include the target locale
        .whereNotIn(
          `${collectionName}.id`,
          strapi.db
            .getConnection(collectionName)
            .select(`${collectionName}.id`)
            // Join the other localizations (null not allowed)
            .join(
              `${collectionName}_localizations_links as l`,
              `${collectionName}.id`,
              `l.${singularName}_id`
            )
            .join(
              `${collectionName} as c2`,
              `l.inv_${singularName}_id`,
              'c2.id'
            )
            // other localization should be the target
            .where('c2.locale', targetLocale)
        )
        // First entity cannot be of the target locale
        .andWhereNot(`${collectionName}.locale`, targetLocale)
        // One is enough to see if there is at least one missing or not
        .limit(1)
      return notTranslated.length === 0
    },
  }
}
