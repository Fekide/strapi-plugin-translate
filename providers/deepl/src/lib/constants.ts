import packageJson from '../../package.json'

export const DEEPL_FREE_API = 'https://api-free.deepl.com/v2'
export const DEEPL_PAID_API = 'https://api.deepl.com/v2'
export const DEEPL_API_MAX_TEXTS = 50
export const batchContentTypeUid = 'plugin::deepl.batch-translate-job'
export const DEEPL_API_MAX_REQUEST_SIZE = 131072
export const DEEPL_API_ROUGH_MAX_REQUEST_SIZE = 130000
export const DEEPL_PRIORITY_BATCH_TRANSLATION = 6
export const DEEPL_PRIORITY_DIRECT_TRANSLATION = 3
export const DEEPL_PRIORITY_USAGE = 1
export const DEEPL_PRIORITY_DEFAULT = 5
export const DEEPL_APP_INFO = {
  appName: packageJson.name,
  appVersion: packageJson.version,
}
