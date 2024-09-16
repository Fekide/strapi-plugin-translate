import { adminApi } from '@strapi/admin/strapi-admin'

const translateApi = adminApi.enhanceEndpoints({
  addTagTypes: [
    'TranslateReport',
    'TranslateUsageEstimate',
    'TranslateProviderUsage',
    'TranslateBatchJobStatus',
    'TranslateBatchUpdates',
  ],
})

export { translateApi }
