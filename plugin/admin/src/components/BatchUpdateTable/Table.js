import React, { memo, useState, useEffect } from 'react'
import { Table, Tbody, Thead, Th, Tr, Td } from '@strapi/design-system/Table'
import { ExclamationMarkCircle } from '@strapi/icons'
import {
  Box,
  Flex,
  Stack,
  Button,
  Checkbox,
  Select,
  Option,
  Dialog,
  DialogBody,
  DialogFooter,
  Typography,
} from '@strapi/design-system'
import { useIntl } from 'react-intl'
import useCollection from '../../Hooks/useCollection'
import useUpdateCollection from '../../Hooks/useUpdateCollection'
import { getTrad } from '../../utils'

const CollectionTable = () => {
  const { formatMessage } = useIntl()

  const [selectedIDs, setSelectedIDs] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sourceLocale, setSourceLocale] = useState(null)

  const { locales } = useCollection()

  useEffect(() => {
    if (Array.isArray(locales) && locales.length > 0)
      setSourceLocale(locales[0].code)
  }, [locales])

  const { updates, startUpdate, dismissUpdates, refetch } =
    useUpdateCollection()

  useEffect(() => {
    const localeUses = updates
      .filter(({ id }) => selectedIDs.includes(id))
      .reduce((acc, current) => {
        for (const locale of current.attributes.localesWithUpdates) {
          acc[locale] = (acc[locale] ?? 0) + 1
        }

        return acc
      }, {})

    const { code: mostUpdatedLocale } = Object.entries(localeUses).reduce(
      (acc, [code, uses]) => (acc.uses < uses ? { code, uses } : acc),
      { code: '', uses: 0 }
    )

    setSourceLocale(mostUpdatedLocale)
  }, [selectedIDs, updates])

  const onAction = () => {
    setIsLoading(true)
    startUpdate(selectedIDs, sourceLocale).then(() => {
      setIsLoading(false)
      setDialogOpen(false)
      refetch()
    })
  }

  const dismissSelected = () => {
    dismissUpdates(selectedIDs).then(() => {
      setSelectedIDs([])
      refetch()
    })
  }

  return (
    <Box background="neutral100">
      <Flex>
        <Button
          disabled={selectedIDs.length === 0}
          onClick={() => setDialogOpen(true)}
        >
          Translate selected
        </Button>
        <Button
          disabled={selectedIDs.length === 0}
          onClick={() => dismissSelected()}
          variant="danger"
        >
          Dismiss selected
        </Button>
      </Flex>
      <Table data-cy="updated-entries">
        <Thead>
          <Tr>
            <Th>
              <Checkbox
                value={selectedIDs.length > 0}
                disabled={updates.length === 0}
                indeterminate={
                  selectedIDs.length > 0 && selectedIDs.length < updates.length
                }
                onClick={() => {
                  if (selectedIDs.length === updates.length) {
                    setSelectedIDs([])
                  } else {
                    setSelectedIDs(updates.map(({ id }) => id))
                  }
                }}
              />
            </Th>
            <Th>
              <Typography variant="sigma">Type</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">IDs</Typography>
            </Th>
            {locales.map((locale) => (
              <Th key={locale.code}>
                <Typography variant="sigma">{locale.name}</Typography>
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {updates.map(({ id, attributes }, index) => (
            <Tr key={id} aria-rowindex={index}>
              <Td>
                <Checkbox
                  value={selectedIDs.includes(id)}
                  onClick={() => {
                    if (selectedIDs.includes(id)) {
                      setSelectedIDs((selectedIDs) =>
                        selectedIDs.filter((param) => param !== id)
                      )
                    } else {
                      setSelectedIDs((selectedIDs) => [id, ...selectedIDs])
                    }
                  }}
                />
              </Td>
              <Td>
                <Typography>{attributes.contentType}</Typography>
              </Td>
              <Td>
                <Typography>
                  {attributes.groupID.split('-').join(',')}
                </Typography>
              </Td>
              {locales.map(({ code }) => (
                <Td key={code}>
                  <Typography>
                    {attributes.localesWithUpdates.includes(code)
                      ? 'was updated'
                      : ''}
                  </Typography>
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
      {dialogOpen && (
        <Dialog
          onClose={() => setDialogOpen(false)}
          title={formatMessage({
            id: getTrad(`batch-update.dialog.title`),
            defaultMessage: 'Confirmation',
          })}
          isOpen={dialogOpen}
        >
          <DialogBody icon={<ExclamationMarkCircle />}>
            <Stack spacing={2}>
              <Flex justifyContent="center">
                <Typography id="confirm-description">
                  {formatMessage({
                    id: getTrad(`batch-update.dialog.content`),
                    defaultMessage: 'Confirmation body',
                  })}
                </Typography>
              </Flex>
              <Box>
                <Stack spacing={2}>
                  <Select
                    label={formatMessage({
                      id: getTrad('batch-update.sourceLocale'),
                    })}
                    onChange={setSourceLocale}
                    value={sourceLocale}
                  >
                    {locales.map(({ name, code }) => {
                      return (
                        <Option key={code} value={code}>
                          {name}
                        </Option>
                      )
                    })}
                  </Select>
                </Stack>
              </Box>
            </Stack>
          </DialogBody>
          <DialogFooter
            startAction={
              <Button onClick={() => setDialogOpen(false)} variant="tertiary">
                {formatMessage({
                  id: 'popUpWarning.button.cancel',
                  defaultMessage: 'No, cancel',
                })}
              </Button>
            }
            endAction={
              <Button
                onClick={onAction}
                disabled={!sourceLocale}
                loading={isLoading}
              >
                {formatMessage({
                  id: getTrad(`batch-update.dialog.submit-text`),
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
