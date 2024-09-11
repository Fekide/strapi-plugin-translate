import { Core } from "@strapi/strapi"
import { TranslateProviderUsageResult } from "../../../shared/types/provider"

export interface ProviderService {
  usage(): Promise<TranslateProviderUsageResult>
}

export default ({ strapi }: { strapi: Core.Strapi }): ProviderService => ({
  async usage() {
    if (typeof strapi.plugin('translate').provider.usage !== 'function') {
      return undefined
    }
    return strapi.plugin('translate').provider.usage()
  },
})
