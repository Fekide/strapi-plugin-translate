import { ServiceMap, TranslatePluginService } from 'src/types/services'

export const getService = <Name extends keyof ServiceMap>(name: Name) => {
  return strapi.plugin('translate').service<TranslatePluginService<Name>>(name)
}
