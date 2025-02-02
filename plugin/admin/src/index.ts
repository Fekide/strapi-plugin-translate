import { getTranslation } from './utils/getTranslation'
import { PLUGIN_ID } from './pluginId'
import { Initializer } from './components/Initializer'
import PluginIcon from './components/PluginIcon'
import { PluginDefinition } from '@strapi/strapi/admin'
import mutateCTBContentTypeSchema from './utils/mutateCTBContentTypeSchema'
import TRANSLATABLE_FIELDS from './utils/translatableFields'
import { get } from 'lodash'
import { prefixPluginTranslations } from './utils/prefixPluginTranslations'
import permissions from './permissions'
import { TranslateFromAnotherLocaleAction } from './components/CMHeaderActions'

const admin: PluginDefinition = {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: () => import('./pages/App'),
      permissions,
    })

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    })
  },
  bootstrap(app) {
    const contentManager = app.getPlugin('content-manager') as any
    contentManager.apis.addDocumentHeaderAction([
      TranslateFromAnotherLocaleAction,
    ])

    const ctbPlugin = app.getPlugin('content-type-builder')

    if (ctbPlugin) {
      const ctbFormsAPI = ctbPlugin.apis.forms as any
      ctbFormsAPI.addContentTypeSchemaMutation(mutateCTBContentTypeSchema)

      ctbFormsAPI.extendFields(TRANSLATABLE_FIELDS, {
        validator: () => {},
        form: {
          advanced({ contentTypeSchema, forTarget, data }: any) {
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
                  id: getTranslation('content-type-builder.form.label'),
                  defaultMessage:
                    'Configure automated translation for this field?',
                },
                description: {
                  id: getTranslation('content-type-builder.form.description'),
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
                        id: getTranslation(
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
                        id: getTranslation(
                          'content-type-builder.form.value.copy'
                        ),
                        defaultMessage: 'Copy',
                      },
                    },
                  },
                  {
                    key: 'delete',
                    value: 'delete',
                    metadatas: {
                      intlLabel: {
                        id: getTranslation(
                          'content-type-builder.form.value.delete'
                        ),
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
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(
            `./translations/${locale}.json`
          )
          return {
            data: prefixPluginTranslations(data, PLUGIN_ID),
            locale,
          }
        } catch {
          return {
            data: {},
            locale,
          }
        }
      })
    )

    return Promise.resolve(importedTrads)
  },
}

export default admin
