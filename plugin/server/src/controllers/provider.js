import { getService } from '../utils/get-service.js';

const providerController = {
  async usage(ctx) {
    const data = await getService('provider').usage();
    ctx.body = { data };
  },
};

export default providerController;
