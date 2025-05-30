const { getService } = require('../utils/get-service');

function providerController(ctx) {
  async function usage() {
    const data = await getService('provider').usage();
    ctx.body = { data };
  }

  return {
    usage,
  };
}

module.exports = providerController;
