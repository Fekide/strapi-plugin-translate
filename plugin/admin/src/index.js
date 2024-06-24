import get from 'lodash/get'
import { prefixPluginTranslations } from '@strapi/helper-plugin'
import pluginPkg from '../../package.json'
import pluginId from './pluginId'
import Initializer from './components/Initializer'
import CMEditViewTranslateLocale from './components/CMEditViewTranslateLocale'
import PluginIcon from './components/PluginIcon'
import mutateCTBContentTypeSchema from './utils/mutateCTBContentTypeSchema'
import TRANSLATABLE_FIELDS from './utils/translatableFields'
import { getTrad } from './utils'

const name = pluginPkg.strapi.name

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
      Component: async () => {
        const component = await import(
          /* webpackChunkName: "translate-app" */ './pages/App'
        )

        return component
      },
      permissions: [
        { action: 'plugin::translate.batch-translate', subject: null },
        { action: 'plugin::translate.translate', subject: null },
        { action: 'plugin::translate.usage', subject: null },
      ],
    })
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    })
  },

  bootstrap(app) {
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'translate-locale',
      Component: CMEditViewTranslateLocale,
    })

    const ctbPlugin = app.getPlugin('content-type-builder')

    if (ctbPlugin) {
      const ctbFormsAPI = ctbPlugin.apis.forms
      ctbFormsAPI.addContentTypeSchemaMutation(mutateCTBContentTypeSchema)

      ctbFormsAPI.extendFields(TRANSLATABLE_FIELDS, {
        validator: () => {},
        form: {
          advanced({ contentTypeSchema, forTarget, data }) {
            if (forTarget === 'contentType') {
              const contentTypeHasI18nEnabled = get(
                contentTypeSchema,
                ['schema', 'pluginOptions', 'i18n', 'localized'],
                false
              )
              const attributeHasi18nEnabled = get(
                data,
                ['pluginOptions', 'i18n', 'localized'],
                false
              )
              const attributeType = data.type

              if (
                !contentTypeHasI18nEnabled ||
                (attributeType !== 'relation' && !attributeHasi18nEnabled)
              ) {
                return []
              }
            }

            return [
              {
                name: 'pluginOptions.translate.translate',
                type: 'select',
                intlLabel: {
                  id: getTrad('content-type-builder.form.label'),
                  defaultMessage:
                    'Configure automated translation for this field?',
                },
                description: {
                  id: getTrad('content-type-builder.form.description'),
                  defaultMessage:
                    'How should the Translate plugin handle the translation of this field?',
                },
                validations: {},
                options: [
                  {
                    key: '__null_reset_value__',
                    value: '',
                    metadatas: {
                      intlLabel: {
                        id: 'components.InputSelect.option.placeholder',
                        defaultMessage: 'Choose here',
                      },
                    },
                  },
                  {
                    key: 'translate',
                    value: 'translate',
                    metadatas: {
                      intlLabel: {
                        id: getTrad(
                          'content-type-builder.form.value.translate'
                        ),
                        defaultMessage: 'Translate',
                      },
                    },
                  },
                  {
                    key: 'copy',
                    value: 'copy',
                    metadatas: {
                      intlLabel: {
                        id: getTrad('content-type-builder.form.value.copy'),
                        defaultMessage: 'Copy',
                      },
                    },
                  },
                  {
                    key: 'delete',
                    value: 'delete',
                    metadatas: {
                      intlLabel: {
                        id: getTrad('content-type-builder.form.value.delete'),
                        defaultMessage: 'Delete',
                      },
                    },
                  },
                ],
              },
            ]
          },
        },
      })
    }
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
