// Migrated service for Strapi 5
const providerService = ({ strapi }) => ({
  async usage() {
    if (typeof strapi.plugin('translate').provider.usage !== 'function') {
      return undefined;
    }
    return strapi.plugin('translate').provider.usage();
  },
});

export default providerService;
