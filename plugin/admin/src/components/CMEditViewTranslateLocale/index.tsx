// This component is highly inspired by the CMEditViewCopyLocale component of @strapi/plugin-i18n
// In the following the referenced License by Strapi Solutions

// Copyright (c) 2015-present Strapi Solutions SAS
//
// Portions of the Strapi software are licensed as follows:
//
// * All software that resides under an "ee/" directory (the “EE Software”), if that directory exists, is licensed under the license defined in "ee/LICENSE".
//
// * All software outside of the above-mentioned directories or restrictions above is available under the "MIT Expat" license as set forth below.
//
// MIT Expat License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import get from 'lodash/get'
import { useSelector } from 'react-redux'
import { useIntl } from 'react-intl'
import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog'
import { Select, Option } from '@strapi/design-system/Select'
import { Button } from '@strapi/design-system/Button'
import { Box } from '@strapi/design-system/Box'
import { Divider } from '@strapi/design-system/Divider'
import { Typography } from '@strapi/design-system/Typography'
import { Flex } from '@strapi/design-system/Flex'
import { Stack } from '@strapi/design-system/Stack'
import ExclamationMarkCircle from '@strapi/icons/ExclamationMarkCircle'
import Duplicate from '@strapi/icons/Duplicate'
import {
  useCMEditViewDataManager,
  useNotification,
  useQueryParams,
  CheckPermissions,
  request,
} from '@strapi/helper-plugin'
import _ from 'lodash'
import { getTrad } from '../../utils'
import permissions from '../../permissions'
import useUsage from '../../Hooks/useUsage'
import parseRelations from './utils/parse-relations'
import flattenEntity from './utils/flattenEntity'

const StyledTypography = styled(Typography)`
  svg {
    margin-right: ${({ theme }) => theme.spaces[2]};
    fill: none;
    > g,
    path {
      fill: ${({ theme }) => theme.colors.primary600};
    }
  }
`

const CenteredTypography = styled(Typography)`
  text-align: center;
`

const CMEditViewTranslateLocale = () => {
  const [{ query }] = useQueryParams()
  const locales = useSelector((state) => state.i18n_locales.locales)
  const { layout, modifiedData, slug } = useCMEditViewDataManager()
  const readPermissions =
    (useSelector(
      (state) => state.rbacProvider.collectionTypesRelatedPermissions
    )[slug] || [])['plugin::content-manager.explorer.read'] || []

  const defaultLocale = locales.find((loc) => loc.isDefault)
  const currentLocale = get(query, 'plugins.i18n.locale', defaultLocale.code)
  const hasI18nEnabled = get(
    layout,
    ['pluginOptions', 'i18n', 'localized'],
    false
  )
  const localizations = get(modifiedData, 'localizations', [])

  if (!hasI18nEnabled || !localizations.length) {
    return null
  }

  return (
    <CheckPermissions permissions={permissions.translate}>
      <Content
        {...{
          appLocales: locales,
          currentLocale,
          localizations,
          readPermissions,
        }}
      />
    </CheckPermissions>
  )
}

const Content = ({
  appLocales,
  currentLocale,
  localizations,
  readPermissions,
}) => {
  const { allLayoutData, initialData, slug, onChange } =
    useCMEditViewDataManager()

  const options = appLocales
    .filter(({ code }) => {
      return (
        code !== currentLocale &&
        localizations.map(({ locale }) => locale).includes(code) &&
        readPermissions.some(({ properties }) =>
          get(properties, 'locales', []).includes(code)
        )
      )
    })
    .map(({ name, code }) => {
      return {
        label: name,
        value: localizations.find(({ locale }) => code === locale).id,
      }
    })

  const toggleNotification = useNotification()
  const { formatMessage } = useIntl()
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState(options[0]?.value || '')
  const [expectedCost, setExpectedCost] = useState(undefined)

  const { usage, estimateUsage, hasUsageInformation } = useUsage()

  useEffect(() => {
    if (isOpen && hasUsageInformation) {
      estimateUsage({
        id: value,
        contentTypeUid: slug,
        sourceLocale: localizations.find(({ id }) => id == value).locale,
      }).then(setExpectedCost, () => {})
    }
  }, [value, isOpen, slug, localizations, estimateUsage, hasUsageInformation])

  const handleConfirmCopyLocale = async () => {
    if (!value) {
      handleToggle()

      return
    }

    const translateURL = `/translate/translate`

    setIsLoading(true)
    try {
      const { locale: sourceLocale } = localizations.find(
        ({ id }) => id == value
      )
      const translatedData = await request(translateURL, {
        method: 'POST',
        body: {
          id: value,
          sourceLocale,
          targetLocale: currentLocale,
          contentTypeUid: slug,
        },
      })

      const parsedData = parseRelations(translatedData, allLayoutData)

      ;[
        'createdBy',
        'updatedBy',
        'publishedAt',
        'id',
        'createdAt',
        'updatedAt',
      ].forEach((key) => {
        _.unset(parsedData, key)

        if (!initialData[key]) return
        parsedData[key] = initialData[key]
      })

      const flattenedData = flattenEntity(parsedData, allLayoutData)

      for (const key in flattenedData) {
        if (Object.hasOwnProperty.call(flattenedData, key)) {
          let { value, type } = flattenedData[key]

          if (type) {
            if (type === 'json') {
              value = JSON.stringify(value)
            }
            onChange({ target: { name: key, value, type } })
          }
        }
      }

      toggleNotification({
        type: 'success',
        message: {
          id: getTrad('CMEditViewTranslateLocale.translate-success'),
          defaultMessage: 'Copied and translated from other locale!',
        },
      })
    } catch (err) {
      console.error(err)

      toggleNotification({
        type: 'warning',
        message: {
          id: getTrad(err.response?.data?.error?.message),
          defaultMessage: 'Failed to translate locale',
        },
      })
    } finally {
      setIsLoading(false)
      handleToggle()
    }
  }

  const handleChange = (value) => {
    setValue(value)
  }

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <Box paddingTop={6}>
      <Typography variant="sigma" textColor="neutral600">
        {formatMessage({
          id: getTrad('plugin.name'),
          defaultMessage: 'Translate',
        })}
      </Typography>
      <Box paddingTop={2} paddingBottom={6}>
        <Divider />
      </Box>
      <StyledTypography
        fontSize={2}
        textColor="primary600"
        as="button"
        type="button"
        onClick={handleToggle}
      >
        <Flex>
          <Duplicate width="12px" height="12px" />
          {formatMessage({
            id: getTrad('CMEditViewTranslateLocale.translate-text'),
            defaultMessage: 'Translate from another locale',
          })}
        </Flex>
      </StyledTypography>
      {isOpen && (
        <Dialog onClose={handleToggle} title="Confirmation" isOpen={isOpen}>
          <DialogBody icon={<ExclamationMarkCircle />}>
            <Stack spacing={2}>
              <Flex justifyContent="center">
                <CenteredTypography id="confirm-description">
                  {formatMessage({
                    id: getTrad(
                      'CMEditViewTranslateLocale.ModalConfirm.content'
                    ),
                    defaultMessage:
                      'Your current content will be erased and filled by the translated content of the selected locale:',
                  })}
                </CenteredTypography>
              </Flex>
              <Box>
                <Select
                  label={formatMessage({
                    id: getTrad('Settings.locales.modal.locales.label'),
                  })}
                  onChange={handleChange}
                  value={value}
                >
                  {options.map(({ label, value }) => {
                    return (
                      <Option key={value} value={value}>
                        {label}
                      </Option>
                    )
                  })}
                </Select>
              </Box>
              {expectedCost && hasUsageInformation && (
                <CenteredTypography>
                  {formatMessage({
                    id: getTrad('usage.estimatedUsage'),
                    defaultMessage:
                      'This action is expected to increase your API usage by: ',
                  })}
                  {expectedCost}
                </CenteredTypography>
              )}
              {hasUsageInformation &&
                expectedCost &&
                expectedCost > usage.limit - usage.count && (
                  <CenteredTypography>
                    {formatMessage({
                      id: getTrad('usage.estimatedUsageExceedsQuota'),
                      defaultMessage:
                        'This action is expected to exceed your API Quota',
                    })}
                  </CenteredTypography>
                )}
            </Stack>
          </DialogBody>
          <DialogFooter
            startAction={
              <Button onClick={handleToggle} variant="tertiary">
                {formatMessage({
                  id: 'popUpWarning.button.cancel',
                  defaultMessage: 'No, cancel',
                })}
              </Button>
            }
            endAction={
              <Button
                variant="success"
                onClick={handleConfirmCopyLocale}
                loading={isLoading}
              >
                {formatMessage({
                  id: getTrad('CMEditViewTranslateLocale.submit-text'),
                  defaultMessage: 'Yes, fill in',
                })}
              </Button>
            }
          />
        </Dialog>
      )}
    </Box>
  )
}

Content.propTypes = {
  appLocales: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
  currentLocale: PropTypes.string.isRequired,
  localizations: PropTypes.array.isRequired,
  readPermissions: PropTypes.array.isRequired,
}

export default CMEditViewTranslateLocale
