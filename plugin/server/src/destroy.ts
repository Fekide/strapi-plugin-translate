import type { Core } from '@strapi/strapi';
import { getService } from './utils/get-service';

const destroy = ({ strapi }: { strapi: Core.Strapi }) => {
  return getService('translate').batchTranslateManager.destroy()
};

export default destroy;
