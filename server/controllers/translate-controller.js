'use strict';

module.exports = ({strapi}) => ({
  async index(ctx) {
    ctx.body = await strapi.plugin('deepl')
      .service('translateService')
      .translate(ctx.request.body);
  },
});
