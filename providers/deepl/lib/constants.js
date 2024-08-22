'use strict'

const packageJson = require("../package.json")

module.exports = {
  DEEPL_FREE_API: 'https://api-free.deepl.com/v2',
  DEEPL_PAID_API: 'https://api.deepl.com/v2',
  DEEPL_API_MAX_TEXTS: 50,
  batchContentTypeUid: 'plugin::deepl.batch-translate-job',
  DEEPL_API_MAX_REQUEST_SIZE: 131072,
  // Lower to account for additional information in post data
  DEEPL_API_ROUGH_MAX_REQUEST_SIZE: 130000,
  DEEPL_PRIORITY_BATCH_TRANSLATION: 6,
  DEEPL_PRIORITY_DIRECT_TRANSLATION: 3,
  DEEPL_PRIORITY_USAGE: 1,
  DEEPL_PRIORITY_DEFAULT: 5,
  DEEPL_APP_INFO: {
    appName: packageJson.name,
    appVersion: packageJson.version
  }
}
