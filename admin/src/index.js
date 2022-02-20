import { prefixPluginTranslations } from '@strapi/helper-plugin'
import pluginPkg from '../../package.json'
import pluginId from './pluginId'
import Initializer from './components/Initializer'
import CMEditViewTranslateLocale from './components/CMEditViewTranslateLocale'

const name = pluginPkg.strapi.name

export default {
  register(app) {
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    })
  },

  bootstrap(app) {
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'deepl-locale-translate',
      Component: CMEditViewTranslateLocale,
    })
  },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            }
          })
          .catch(() => {
            return {
              data: {},
              locale,
            }
          })
      })
    )

    return Promise.resolve(importedTrads)
  },
}
