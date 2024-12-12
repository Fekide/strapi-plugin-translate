import { factories } from '@strapi/strapi'

export default factories.createCoreService(
  'plugin::translate.updated-entry',
  () => ({
    async create(params: {
      data: Record<string, unknown>
      [key: string]: unknown
    }) {
      try {
        const {
          results: [firstResult],
        } = await super.find({
          fields: ['id', 'localesWithUpdates'],
          filters: {
            contentType: params.data.contentType,
            groupID: params.data.groupID,
          },
        })
        if (firstResult) {
          return super.update(firstResult.id, {
            data: {
              localesWithUpdates: Array.from(
                new Set([
                  ...(firstResult.localesWithUpdates ?? []),
                  ...(Array.isArray(params.data.localesWithUpdates)
                    ? params.data.localesWithUpdates
                    : []),
                ])
              ),
            },
          })
        } else {
          return super.create(params)
        }
      } catch (e) {
        console.error(e)
      }
    },
  })
)
