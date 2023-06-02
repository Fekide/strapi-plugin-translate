import React, { memo } from 'react'
import { Table, Tbody, Thead, Th, Tr } from '@strapi/design-system/Table'
import { Button, Flex, Typography } from '@strapi/design-system'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import useCollection from '../../Hooks/useCollection'
import { getTrad } from '../../utils'
import BatchUpdateRow from './BatchUpdateRows'

const BatchUpdateTable = ({
  updates,
  dismissUpdates,
  refetch,
  selectedUpdateIDs,
  setSelectedUpdateIDs,
}) => {
  const { formatMessage } = useIntl()
  const { locales } = useCollection()

  const dismissSelected = () => {
    dismissUpdates(selectedUpdateIDs).then(() => {
      setSelectedUpdateIDs([])
      refetch()
    })
  }

  return (
    <>
      <Table rowCount={updates.length + 1} colCount={locales.length + 2}>
        <Thead>
          <Tr>
            <Th>
              <Typography variant="sigma">IDs</Typography>
            </Th>

            <Th>
              <Typography variant="sigma">
                {formatMessage({
                  id: getTrad(`batch-update.select`),
                  defaultMessage: 'select',
                })}
              </Typography>
            </Th>

            {locales.map((locale) => (
              <Th key={locale.code}>
                <Typography variant="sigma">{locale.name}</Typography>
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {updates.map((entry, index) => (
            <BatchUpdateRow
              key={entry.id}
              entry={entry}
              selectedIDs={selectedUpdateIDs}
              setSelectedIDs={setSelectedUpdateIDs}
              locales={locales}
              index={index}
            />
          ))}
        </Tbody>
      </Table>
      <Flex>
        <Button
          onClick={() =>
            setSelectedUpdateIDs(updates.map((update) => update.id))
          }
          variant="secondary"
        >
          {formatMessage({
            id: getTrad(`batch-update.select-all`),
            defaultMessage: 'select all',
          })}
        </Button>
        <Button
          onClick={() => dismissSelected()}
          variant="danger"
          disabled={selectedUpdateIDs.length === 0}
        >
          {formatMessage({
            id: getTrad(`batch-update.dismiss`),
            defaultMessage: 'dismiss selected',
          })}
        </Button>
      </Flex>
    </>
  )
}

BatchUpdateTable.propTypes = {
  updates: PropTypes.arrayOf(
    PropTypes.shape({
      id: Number,
      attributes: PropTypes.shape({
        contentType: PropTypes.string,
        groupID: PropTypes.string,
        localesWithUpdates: PropTypes.arrayOf(PropTypes.string),
      }),
    })
  ),
  dismissUpdates: PropTypes.func,
  refetch: PropTypes.func,
  selectedUpdateIDs: PropTypes.array,
  setSelectedUpdateIDs: PropTypes.func,
}

export default memo(BatchUpdateTable)
