import { Core } from '@strapi/strapi'
import { getService } from '../utils/get-service'
import { TranslateProviderUsage } from '../../../shared/contracts/provider'
import { handleContextError } from '../utils/handle-error'

export interface ProviderController extends Core.Controller {
  usage: Core.ControllerHandler<TranslateProviderUsage.Response>
}

export default (): ProviderController => ({
  async usage(ctx) {
    try {
      const data = await getService('provider').usage()
      return { data }
    } catch (error) {
      return handleContextError(ctx, error, 'GetUsage.error')
    }
  },
})
