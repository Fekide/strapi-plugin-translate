import { Core } from '@strapi/strapi'
import { getService } from '../utils/get-service'
import { TranslateProviderUsage } from '../../../shared/contracts/provider'

export interface ProviderController {
  usage: Core.ControllerHandler<TranslateProviderUsage.Response>
}

export default (): ProviderController => ({
  async usage(ctx) {
    const data = await getService('provider').usage()
    ctx.body = { data }
  },
})
