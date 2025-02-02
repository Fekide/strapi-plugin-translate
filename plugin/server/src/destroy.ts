import type { Core } from '@strapi/strapi'
import { getService } from './utils/get-service'

const destroy: Core.Plugin['destroy'] = () => {
  return getService('translate').batchTranslateManager.destroy()
}

export default destroy
