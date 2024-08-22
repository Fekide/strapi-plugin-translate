import { TranslateConfig } from '../config'

export const getConfig = () => {
  return strapi.config.get<TranslateConfig>('plugin::translate')
}
