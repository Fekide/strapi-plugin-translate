import React, { memo, useState, useEffect } from 'react'
import { Table, Tbody } from '@strapi/design-system/Table'
import { Box } from '@strapi/design-system/Box'
import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog'
import { useIntl } from 'react-intl'
import { useNotification } from '@strapi/helper-plugin'
import { Stack } from '@strapi/design-system/Stack'
import { Flex } from '@strapi/design-system/Flex'
import { Typography } from '@strapi/design-system/Typography'
import ExclamationMarkCircle from '@strapi/icons/ExclamationMarkCircle'
import { Select, Option } from '@strapi/design-system/Select'
import { Button } from '@strapi/design-system/Button'
import { ToggleInput } from '@strapi/design-system/ToggleInput'
import useCollection from '../../Hooks/useCollection'
import { getTrad } from '../../utils'
import useUsage from '../../Hooks/useUsage'
import CollectionTableHeader from './CollectionHeader'
import CollectionRow from './CollectionRow'

const CollectionTable = () => {
  const {
    collections,
    locales,
    translateCollection,
    cancelTranslation,
    pauseTranslation,
    resumeTranslation,
  } = useCollection()
  const { formatMessage } = useIntl()
  const toggleNotification = useNotification()
  const { usage, estimateUsageForCollection } = useUsage()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [targetLocale, setTargetLocale] = useState(null)
  const [sourceLocale, setSourceLocale] = useState(null)
  const [autoPublish, setAutoPublish] = useState(false)
  const [collection, setCollection] = useState(null)
  const [action, setAction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expectedCost, setExpectedCost] = useState(undefined)

  useEffect(() => {
    if (dialogOpen && action === 'translate' && sourceLocale && targetLocale) {
      estimateUsageForCollection({
        contentType: collection.contentType,
        sourceLocale,
        targetLocale,
      }).then(setExpectedCost, () => {})
    }
  }, [
    dialogOpen,
    sourceLocale,
    targetLocale,
    collection,
    estimateUsageForCollection,
    action,
  ])

  const handleAction = ({ action, targetLocale, collection }) => {
    setTargetLocale(targetLocale)
    setCollection(collection)
    setAction(action)
    handleToggleDialog()
  }
  const handleToggleDialog = () => {
    setDialogOpen((prev) => !prev)
  }

  const handleSourceLocaleChange = (value) => {
    setSourceLocale(value)
  }

  const toggleAutoPublish = () => {
    setAutoPublish(!autoPublish)
  }

  const handleConfirm = async () => {
    console.log('Confirm')
    try {
      switch (action) {
        case 'translate':
          setLoading(true)

          if (!sourceLocale) {
            toggleNotification({
              type: 'warning',
              message: {
                id: 'batch-translate.dialog.translate.source-locale-missing',
                defaultMessage: 'Source locale is missing',
              },
            })
            setLoading(false)

            return
          }
          await translateCollection({
            contentType: collection.contentType,
            sourceLocale,
            targetLocale,
            autoPublish,
          })
          break
        case 'cancel':
          await cancelTranslation({
            jobID: collection.localeReports[targetLocale]?.job?.id,
          })
          break
        case 'pause':
          await pauseTranslation({
            jobID: collection.localeReports[targetLocale]?.job?.id,
          })
          break
        case 'resume':
          await resumeTranslation({
            jobID: collection.localeReports[targetLocale]?.job?.id,
          })
          break
        default:
          console.log('Action not implemented')
          break
      }
      setLoading(false)
      handleToggleDialog()
      setSourceLocale(null)
      setTargetLocale(null)
      setCollection(null)
      setAction(null)
    } catch (error) {
      setLoading(false)
      console.error(error)

      toggleNotification({
        type: 'warning',
        message: {
          id: getTrad(error.response?.data?.error?.message),
          defaultMessage: `Failed to do action ${action}`,
        },
      })
    }
  }

  const ROW_COUNT = collections.length
  const COL_COUNT = locales.length + 1

  return (
    <Box background="neutral100">
      <Table colCount={COL_COUNT} rowCount={ROW_COUNT}>
        <CollectionTableHeader locales={locales} />
        <Tbody>
          {collections.map((collection) => (
            <CollectionRow
              key={collection.contentType}
              entry={collection}
              locales={locales}
              onAction={(action, targetLocale) =>
                handleAction({ action, targetLocale, collection })
              }
            />
          ))}
        </Tbody>
      </Table>
      {dialogOpen && (
        <Dialog
          onClose={handleToggleDialog}
          title={formatMessage({
            id: getTrad(`batch-translate.dialog.${action}.title`),
            defaultMessage: 'Confirmation',
          })}
          isOpen={dialogOpen}
        >
          <DialogBody icon={<ExclamationMarkCircle />}>
            <Stack size={2}>
              <Flex justifyContent="center">
                <Typography id="confirm-description">
                  {formatMessage({
                    id: getTrad(`batch-translate.dialog.${action}.content`),
                    defaultMessage: 'Confirmation body',
                  })}
                </Typography>
              </Flex>
              <Box>
                {action === 'translate' && (
                  <Stack spacing={2}>
                    <Select
                      label={formatMessage({
                        id: getTrad('Settings.locales.modal.locales.label'),
                      })}
                      onChange={handleSourceLocaleChange}
                      value={sourceLocale}
                    >
                      {locales
                        .filter((loc) => loc.code !== targetLocale)
                        .map(({ name, code }) => {
                          return (
                            <Option key={code} value={code}>
                              {name}
                            </Option>
                          )
                        })}
                    </Select>
                    <ToggleInput
                      label={formatMessage({
                        id: getTrad(
                          'batch-translate.dialog.translate.autoPublish.label'
                        ),
                        defaultMessage: 'Auto-Publish',
                      })}
                      hint={formatMessage({
                        id: getTrad(
                          'batch-translate.dialog.translate.autoPublish.hint'
                        ),
                        defaultMessage:
                          'Publish translated entities automatically',
                      })}
                      name="auto-publish"
                      onLabel="True"
                      offLabel="False"
                      checked={autoPublish}
                      onChange={toggleAutoPublish}
                    />
                    {expectedCost && (
                      <Typography>
                        {formatMessage({
                          id: getTrad('usage.estimatedUsage'),
                          defaultMessage:
                            'This action is expected to increase your API usage by: ',
                        })}
                        {expectedCost}
                      </Typography>
                    )}
                    {usage &&
                      expectedCost &&
                      expectedCost > usage.limit - usage.count && (
                        <Typography>
                          {formatMessage({
                            id: getTrad('usage.estimatedUsageExceedsQuota'),
                            defaultMessage:
                              'This action is expected to exceed your API Quota',
                          })}
                        </Typography>
                      )}
                  </Stack>
                )}
              </Box>
            </Stack>
          </DialogBody>
          <DialogFooter
            startAction={
              <Button onClick={handleToggleDialog} variant="tertiary">
                {formatMessage({
                  id: 'popUpWarning.button.cancel',
                  defaultMessage: 'No, cancel',
                })}
              </Button>
            }
            endAction={
              <Button
                variant="success"
                onClick={handleConfirm}
                loading={loading}
              >
                {formatMessage({
                  id: getTrad(`batch-translate.dialog.${action}.submit-text`),
                  defaultMessage: 'Confirm',
                })}
              </Button>
            }
          />
        </Dialog>
      )}
    </Box>
  )
}

export default memo(CollectionTable)
