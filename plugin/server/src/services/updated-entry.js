const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreService('plugin::translate.updated-entry', () => ({
  async create(params) {
    try {
      const {
        results: [firstResult],
      } = await super.find({
        fields: ['id', 'localesWithUpdates'],
        filters: {
          contentType: params.data.contentType,
          groupID: params.data.groupID,
        },
      });
      if (firstResult) {
        return super.update(firstResult.id, {
          data: {
            localesWithUpdates: Array.from(
              new Set([
                ...(firstResult.localesWithUpdates ?? []),
                ...(params.data.localesWithUpdates ?? []),
              ])
            ),
          },
        });
      } else {
        return super.create(params);
      }
    } catch (e) {
      console.error(e);
    }
  },
}));
