import { Core } from '@strapi/strapi'
import { getService } from '../utils/get-service'

export interface ProviderController {
  usage: Core.ControllerHandler
}

export default (): ProviderController => ({
  async usage(ctx) {
    const data = await getService('provider').usage()
    ctx.body = { data }
  },
})
