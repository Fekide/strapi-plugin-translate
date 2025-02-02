import { ServiceMap, TranslatePluginService } from '../../../shared/services'
import I18nServices from '@strapi/i18n/dist/server/src/services'

export const getService = <Name extends keyof ServiceMap>(name: Name) => {
  return strapi.plugin('translate').service<TranslatePluginService<Name>>(name)
}

export const geti18nService = <Name extends keyof typeof I18nServices>(
  name: Name
) => {
  return strapi
    .plugin('i18n')
    .service<ReturnType<(typeof I18nServices)[Name]>>(name)
}
