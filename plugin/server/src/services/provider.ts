import { Core } from "@strapi/strapi"

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async usage() {
    if (typeof strapi.plugin('translate').provider.usage !== 'function') {
      return undefined
    }
    return strapi.plugin('translate').provider.usage()
  },
})
