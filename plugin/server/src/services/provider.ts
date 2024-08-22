import { Core } from "@strapi/strapi"
import { ProviderService } from "@shared/services/provider"



export default ({ strapi }: { strapi: Core.Strapi }): ProviderService => ({
  async usage() {
    if (typeof strapi.plugin('translate').provider.usage !== 'function') {
      return undefined
    }
    return strapi.plugin('translate').provider.usage()
  },
})
