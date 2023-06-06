import React from 'react'
import PropTypes from 'prop-types'
import { Td, Tr } from '@strapi/design-system/Table'
import { Checkbox, Typography } from '@strapi/design-system'
import { useIntl } from 'react-intl'
import { getTrad } from '../../utils'

const BatchUpdateRow = ({
  entry,
  selectedIDs,
  setSelectedIDs,
  locales,
  index,
}) => {
  const { formatMessage } = useIntl()

  return (
    <Tr aria-rowindex={index}>
      <Td>
        <Typography>{entry.attributes.groupID.split('-').join(',')}</Typography>
      </Td>

      <Td>
        <Checkbox
          value={selectedIDs.includes(entry.id)}
          onChange={() =>
            setSelectedIDs((selectedIDs) =>
              selectedIDs.includes(entry.id)
                ? selectedIDs.filter((id_) => id_ !== entry.id)
                : [entry.id, ...selectedIDs]
            )
          }
        >
          {formatMessage({
            id: getTrad(`batch-update.select`),
            defaultMessage: 'select',
          })}
        </Checkbox>
      </Td>

      {locales.map(({ code }) => (
        <Td key={code}>
          <Typography>
            {entry.attributes.localesWithUpdates.includes(code)
              ? formatMessage({
                  id: getTrad(`batch-update.was-updated`),
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
