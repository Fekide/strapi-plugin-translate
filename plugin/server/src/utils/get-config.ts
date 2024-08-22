import { TranslateConfig } from 'src/config'

export const getConfig = () => {
  return strapi.config.get<TranslateConfig>('plugin.translate')
}
