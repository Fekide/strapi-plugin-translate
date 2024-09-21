import {
  Button,
  Dialog,
  Field,
  Flex,
  SingleSelect,
  SingleSelectOption,
  Typography,
} from '@strapi/design-system'
import { Earth, WarningCircle } from '@strapi/icons'
import {
  unstable_useDocument as useDocument,
  useQueryParams,
  useForm,
  unstable_useDocumentLayout as useDocumentLayout,
} from '@strapi/strapi/admin'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { getTranslation } from '../utils'
import {
  HeaderActionProps,
  HeaderActionComponent,
} from '@strapi/content-manager/strapi-admin'
import { useGetI18NLocalesQuery } from '../services/locales'
import { useTranslateEntityMutation } from '../services/translation'
import { Modules, UID } from '@strapi/strapi'
import parseRelations from '../utils/parse-relations'
import { unset } from 'lodash'
import useUsage from '../Hooks/useUsage'

interface I18nBaseQuery {
  plugins?: {
    i18n?: {
      locale?: string
      relatedEntityId?: Modules.Documents.ID
    }
  }
}

export const TranslateFromAnotherLocaleAction: HeaderActionComponent = ({
  documentId,
  meta,
  model,
  collectionType,
  document,
}: HeaderActionProps) => {
  const { formatMessage } = useIntl()
  const [{ query }] = useQueryParams<I18nBaseQuery>()
  const currentDesiredLocale = query.plugins?.i18n?.locale
  const [localeSelected, setLocaleSelected] = React.useState<string | null>(
    null
  )
  const setValues = useForm('TranslateFromAnotherLocale', (state) => state.setValues)
  const [translateEntity] = useTranslateEntityMutation()
  const { schema, components } = useDocument({
    model,
    documentId,
    collectionType,
    params: { locale: currentDesiredLocale },
  })
  const { edit: editLayout } = useDocumentLayout(model)
  const { data: locales = [] } = useGetI18NLocalesQuery()

  const [expectedCost, setExpectedCost] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const { estimateUsage, usage } = useUsage()

  const availableLocales = Array.isArray(locales)
    ? locales.filter((locale) =>
        meta?.availableLocales.some((l) => l.locale === locale.code)
      )
    : []

  const handleLocaleChange = (value: string) => {
    setLocaleSelected(value)
    if (value && currentDesiredLocale && documentId) {
      estimateUsage({
        contentType: model as UID.ContentType,
        documentId,
        sourceLocale: value,
      }).then((result) => {
        setExpectedCost(result?.data?.data != null ? result.data.data : null)
      })
    }
  }

  const translateFromLocale = async () => {
    if (
      !localeSelected ||
      (collectionType === 'collection-types' && !documentId) ||
      !currentDesiredLocale ||
      !schema ||
      !document
    ) {
      console.error('Missing required data to translate', {
        localeSelected,
        documentId,
        currentDesiredLocale,
        schema,
        document,
      })
      return
    }
    setLoading(true)
    const response = await translateEntity({
      documentId,
      contentType: model as UID.ContentType,
      sourceLocale: localeSelected,
      targetLocale: currentDesiredLocale,
    })
    if ('error' in response || !response.data.data) {
      setLoading(false)
      return
    }

    const { data: translatedData } = response

    const parsedData = parseRelations(translatedData.data, {
      contentType: schema,
      components,
      editLayout,
    })

    ;[
      'createdBy',
      'updatedBy',
      'publishedAt',
      'id',
      'createdAt',
      'updatedAt',
    ].forEach((key) => {
      unset(parsedData, key)

      if (!document[key]) return
      parsedData[key] = document[key]
    })

    for (const key in parsedData) {
      const attribute = schema.attributes[key]

      if (attribute) {
        if (attribute.type === 'json') {
          parsedData[key] = JSON.stringify(parsedData[key], undefined, 2)
        }
      }
    }

    setValues(parsedData)
    setLoading(false)
  }

  return {
    type: 'icon',
    icon: <Earth />,
    disabled: availableLocales.length === 0,
    label: formatMessage({
      id: getTranslation('CMEditViewTranslateLocale.translate-text'),
      defaultMessage: 'Translate from another locale',
    }),
    dialog: {
      type: 'dialog',
      title: formatMessage({
        id: getTranslation('CMEditViewTranslateLocale.dialog.title'),
        defaultMessage: 'Confirmation',
      }),
      content: (
        <>
          <Dialog.Body>
            <Flex direction="column" gap={3}>
              <WarningCircle width="24px" height="24px" fill="danger600" />
              <Typography textAlign="center">
                {formatMessage({
                  id: getTranslation('CMEditViewTranslateLocale.dialog.body'),
                  defaultMessage:
                    'Your current content will be erased and filled by the translated content of the selected locale:',
                })}
              </Typography>
              <Field.Root width="100%">
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('Settings.locales.modal.locales.label'),
                    defaultMessage: 'Locale',
                  })}
                </Field.Label>
                <SingleSelect
                  value={localeSelected}
                  placeholder={formatMessage({
                    id: getTranslation(
                      'CMEditViewCopyLocale.dialog.field.placeholder'
                    ),
                    defaultMessage: 'Select one locale...',
                  })}
                  // @ts-expect-error – the DS will handle numbers, but we're not allowing the API.
                  onChange={handleLocaleChange}
                >
                  {availableLocales.map((locale) => (
                    <SingleSelectOption key={locale.code} value={locale.code}>
                      {locale.name}
                    </SingleSelectOption>
                  ))}
                </SingleSelect>
              </Field.Root>
              {expectedCost && usage != null && (
                <Typography>
                  {formatMessage({
                    id: getTranslation('usage.estimatedUsage'),
                    defaultMessage:
                      'This action is expected to increase your API usage by: ',
                  })}
                  {expectedCost}
                </Typography>
              )}
              {usage != null &&
                expectedCost &&
                expectedCost > usage.limit - usage.count && (
                  <Typography>
                    {formatMessage({
                      id: getTranslation('usage.estimatedUsageExceedsQuota'),
                      defaultMessage:
                        'This action is expected to exceed your API Quota',
                    })}
                  </Typography>
                )}
            </Flex>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Cancel>
              <Button variant="tertiary">
                {formatMessage({
                  id: getTranslation('CMEditViewTranslateLocale.cancel-text'),
                  defaultMessage: 'No, cancel',
                })}
              </Button>
            </Dialog.Cancel>
            <Dialog.Action>
              <Button
                variant="success"
                onClick={translateFromLocale}
                loading={loading}
              >
                {formatMessage({
                  id: getTranslation('CMEditViewTranslateLocale.submit-text'),
                  defaultMessage: 'Yes, fill in',
                })}
              </Button>
            </Dialog.Action>
          </Dialog.Footer>
        </>
      ),
    },
  }
}
