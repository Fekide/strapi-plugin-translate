import { getService } from '../utils/get-service'

export default () => ({
  async usage(ctx: any) {
    const data = await getService('provider').usage()
    ctx.body = { data }
  },
})
