'use strict'

const { createCoreService } = require('@strapi/strapi').factories

module.exports = createCoreService('plugin::translate.updated-entry', () => ({
  async create(params) {
    try {
      const {
        results: [firstResult],
      } = await super.find({
        fields: ['id'],
        filters: {
          contentType: params.data.contentType,
          groupID: params.data.groupID,
        },
      })
      super.update(firstResult.id, {
        localesWithUpdates: Array.from(
          new Set([
            ...(firstResult.localesWithUpdates ?? []),
            ...(params.data.localesWithUpdates ?? []),
          ])
        ),
      })
      if (firstResult) return firstResult
    } catch (e) {
      console.error(e)
    }

    return super.create(params)
  },
}))
