import { adminApi } from '@strapi/admin/strapi-admin'

const translateApi = adminApi.enhanceEndpoints({
  addTagTypes: ['Translation', 'Usage', 'TranslateProviderUsage'],
})

export { translateApi }
