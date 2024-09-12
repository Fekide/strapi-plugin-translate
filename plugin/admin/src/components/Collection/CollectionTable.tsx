import React, { memo, useState, useEffect } from 'react'
import { Table, Tbody } from '@strapi/design-system/Table'
import { Box } from '@strapi/design-system/Box'
import { Layout } from '@strapi/design-system/Layout'
import { Dialog, DialogBody, DialogFooter } from '@strapi/design-system/Dialog'
import { useIntl } from 'react-intl'
import { Stack } from '@strapi/design-system/Stack'
import { Flex } from '@strapi/design-system/Flex'
import { Typography } from '@strapi/design-system/Typography'
import {WarningCircle} from '@strapi/icons'
import { Select, Option } from '@strapi/design-system/Select'
import { Button } from '@strapi/design-system/Button'
import { ToggleInput } from '@strapi/design-system/ToggleInput'
import useCollection from '../../Hooks/useCollection'
import { getTranslation } from '../../utils'
import useUsage from '../../Hooks/useUsage'
import CollectionTableHeader from './CollectionHeader'
import CollectionRow from './CollectionRow'
import {
  useTranslateBatchJobCancelMutation,
  useTranslateBatchJobPauseMutation,
  useTranslateBatchJobResumeMutation,
} from 'src/services/batch-jobs'
import { useTranslateBatchMutation } from 'src/services/translation'
import { ContentTypeTranslationReport } from '@shared/types/report'
import useAlert from 'src/Hooks/useAlert'
import { ActionType } from './actions'


type HandleActionProps = {
  action: ActionType
  targetLocale: string
  collection: ContentTypeTranslationReport
}

const CollectionTable = () => {
  const {
    collections,
    locales,
  } = useCollection()
  const { formatMessage } = useIntl()
  const { handleNotification } = useAlert()
  const { usage, estimateUsageForCollection, estimateUsageForCollectionResult: expectedCost } = useUsage()

  const [translateBatch, translateBatchResult] = useTranslateBatchMutation()
  const [pauseTranslation, pauseTranslationResult] =
    useTranslateBatchJobPauseMutation()
  const [resumeTranslation, resumeTranslationResult] =
    useTranslateBatchJobResumeMutation()
  const [cancelTranslation, cancelTranslationResult] =
    useTranslateBatchJobCancelMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [targetLocale, setTargetLocale] = useState<string | null>(null)
  const [sourceLocale, setSourceLocale] = useState<string | null>(null)
  const [autoPublish, setAutoPublish] = useState(false)
  const [collection, setCollection] =
    useState<ContentTypeTranslationReport | null>(null)
  const [action, setAction] = useState<ActionType | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (
      dialogOpen &&
      action === 'translate' &&
      sourceLocale &&
      targetLocale &&
      collection &&
      usage
    ) {
      estimateUsageForCollection({
        contentType: collection.contentType,
        sourceLocale,
        targetLocale,
      })
    }
  }, [
    dialogOpen,
    sourceLocale,
    targetLocale,
    collection,
    estimateUsageForCollection,
    action,
    usage,
  ])

  const handleAction = ({
    action,
    targetLocale,
    collection,
  }: HandleActionProps) => {
    setTargetLocale(targetLocale)
    setCollection(collection)
    setAction(action)
    handleToggleDialog()
  }
  const handleToggleDialog = () => {
    setDialogOpen((prev) => !prev)
  }

  const handleSourceLocaleChange = (value: string) => {
    setSourceLocale(value)
  }

  const toggleAutoPublish = () => {
    setAutoPublish(!autoPublish)
  }

  const dialogFieldMissing = (field: string) => {
    handleNotification({
      type: 'warning',
      id: `batch-translate.dialog.translate.${field}-missing`,
      defaultMessage: `${field} is missing`,
    })
    setLoading(false)
  }

  const handleConfirm = async () => {
    console.log('Confirm')
    try {
      switch (action) {
        case 'translate':
          setLoading(true)

          if (!targetLocale) {
            dialogFieldMissing('target-locale')
            return
          }

          if (!sourceLocale) {
            dialogFieldMissing('source-locale')
            return
          }

          if (!collection) {
            dialogFieldMissing('collection')
            return
          }
          await translateBatch({
            contentType: collection.contentType,
            sourceLocale,
            targetLocale,
            autoPublish,
          })
          break
        case 'cancel':
          if (!targetLocale) {
            dialogFieldMissing('target-locale')
            return
          }
          if (!collection) {
            dialogFieldMissing('collection')
            return
          }
          await cancelTranslation({
            documentId: collection.localeReports[targetLocale].job.documentId,
          })
          break
        case 'pause':
          if (!targetLocale) {
            dialogFieldMissing('target-locale')
            return
          }
          if (!collection) {
            dialogFieldMissing('collection')
            return
          }
          await pauseTranslation({
            documentId: collection.localeReports[targetLocale].job.documentId,
          })
          break
        case 'resume':
          if (!targetLocale) {
            dialogFieldMissing('target-locale')
            return
          }
          if (!collection) {
            dialogFieldMissing('collection')
            return
          }
          await resumeTranslation({
            documentId: collection.localeReports[targetLocale].job.documentId,
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
    }
  }

  const ROW_COUNT = collections.length
  const COL_COUNT = locales.length + 1

  return (
    <Layout>
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
            id: getTranslation(`batch-translate.dialog.${action}.title`),
            defaultMessage: 'Confirmation',
          })}
          isOpen={dialogOpen}
        >
          <DialogBody icon={<WarningCircle />}>
            <Stack size={2}>
              <Flex justifyContent="center">
                <Typography id="confirm-description">
                  {formatMessage({
                    id: getTranslation(`batch-translate.dialog.${action}.content`),
                    defaultMessage: 'Confirmation body',
                  })}
                </Typography>
              </Flex>
              <Box>
                {action === 'translate' && (
                  <Stack spacing={2}>
                    <Select
                      label={formatMessage({
                        id: getTranslation('Settings.locales.modal.locales.label'),
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
                        id: getTranslation(
                          'batch-translate.dialog.translate.autoPublish.label'
                        ),
                        defaultMessage: 'Auto-Publish',
                      })}
                      hint={formatMessage({
                        id: getTranslation(
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
                    {expectedCost && usage && (
                      <Typography>
                        {formatMessage({
                          id: getTranslation('usage.estimatedUsage'),
                          defaultMessage:
                            'This action is expected to increase your API usage by: ',
                        })}
                        {expectedCost}
                      </Typography>
                    )}
                    {usage &&
                      expectedCost &&
                      expectedCost > usage?.limit - usage?.count && (
                        <Typography>
                          {formatMessage({
                            id: getTranslation('usage.estimatedUsageExceedsQuota'),
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
                  id: getTranslation(`batch-translate.dialog.${action}.submit-text`),
                  defaultMessage: 'Confirm',
                })}
              </Button>
            }
          />
        </Dialog>
      )}
    </Layout>
  )
}

export default memo(CollectionTable)
