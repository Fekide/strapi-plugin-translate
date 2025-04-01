import type { Core } from '@strapi/strapi'
import spec from '../../documentation/content-api.json';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  // register phase
  if (strapi.plugin('documentation')) {
    strapi
      .plugin('documentation')
      .service('override')
      .registerOverride(spec, {
        pluginOrigin: 'translate',
        excludeFromGeneration: ['translate'],
      });
  }
}

export default register
