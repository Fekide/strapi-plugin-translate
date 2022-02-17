'use strict';

module.exports = {
  default: ({ env}) => ({
    apiKey: env["DEEPL_API_KEY"] ?? null,
    freeApi: env["DEEPL_API_FREE"] ? (env["DEEPL_API_FREE"].toLowerCase() == "true") : true
  }),
  validator() {},
};
