import React from 'react'
import PropTypes from 'prop-types'
import { Td, Tr } from '@strapi/design-system'
import { Checkbox, Typography } from '@strapi/design-system'
import { useIntl } from 'react-intl'
import { getTranslation } from '../../utils'
import { UpdatedEntry } from '@shared/contracts/updated-entry'
import { Locale } from '@shared/types/locale'
import { Data } from '@strapi/strapi'

interface BatchUpdateRowProps {
  entry: UpdatedEntry
  selectedIDs: Data.DocumentID[]
  setSelectedIDs: React.Dispatch<React.SetStateAction<string[]>>
  locales: Array<Locale>
  index: number
}

const BatchUpdateRow = ({
  entry,
  selectedIDs,
  setSelectedIDs,
  locales,
  index,
}: BatchUpdateRowProps) => {
  const { formatMessage } = useIntl()

  return (
    <Tr aria-rowindex={index}>
      <Td>
        <Typography>{entry.groupID}</Typography>
      </Td>

      <Td>
        <Checkbox
          checked={selectedIDs.includes(entry.documentId)}
          onCheckedChange={() =>
            setSelectedIDs((selectedIDs) =>
              selectedIDs.includes(entry.documentId)
                ? selectedIDs.filter((id_) => id_ !== entry.documentId)
                : [entry.documentId, ...selectedIDs]
            )
          }
        >
          {formatMessage({
            id: getTranslation(`batch-update.select`),
            defaultMessage: 'select',
          })}
        </Checkbox>
      </Td>

      {locales.map(({ code }) => (
        <Td key={code}>
          <Typography>
            {entry.localesWithUpdates.includes(code)
              ? formatMessage({
                  id: getTranslation(`batch-update.was-updated`),
                  defaultMessage: 'was updated',
                })
              : ''}
          </Typography>
        </Td>
      ))}
    </Tr>
  )
}

BatchUpdateRow.propTypes = {
  locales: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  selectedIDs: PropTypes.arrayOf(PropTypes.number),
  setSelectedIDs: PropTypes.func,
  entry: PropTypes.shape({
    id: PropTypes.number,
    attributes: PropTypes.shape({
      groupID: PropTypes.string,
      localesWithUpdates: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
  index: PropTypes.number,
}

export default BatchUpdateRow
