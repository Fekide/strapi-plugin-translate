import React, { memo } from 'react'
import { Table, Tbody, Thead, Th, Tr } from '@strapi/design-system'
import { Typography } from '@strapi/design-system'
import { useIntl } from 'react-intl'
import useCollection from '../../Hooks/useCollection'
import { getTranslation } from '../../utils'
import BatchUpdateRow from './Row'
import { UpdatedEntry } from '@shared/contracts/updated-entry'

interface BatchUpdateTableProps {
  updates: Array<UpdatedEntry>
  selectedUpdateIDs: Array<string>
  setSelectedUpdateIDs: React.Dispatch<React.SetStateAction<string[]>>
}

const BatchUpdateTable = ({
  updates,
  selectedUpdateIDs,
  setSelectedUpdateIDs,
}: BatchUpdateTableProps) => {
  const { formatMessage } = useIntl()
  const { locales } = useCollection()

  console.log('BatchUpdateTable', updates)

  return (
    <Table rowCount={updates.length + 1} colCount={locales.length + 2}>
      <Thead>
        <Tr>
          <Th>
            <Typography variant="sigma">IDs</Typography>
          </Th>

          <Th>
            <Typography variant="sigma">
              {formatMessage({
                id: getTranslation(`batch-update.select`),
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
            key={entry.documentId}
            entry={entry}
            selectedIDs={selectedUpdateIDs}
            setSelectedIDs={setSelectedUpdateIDs}
            locales={locales}
            index={index}
          />
        ))}
      </Tbody>
    </Table>
  )
}


export default memo(BatchUpdateTable)
